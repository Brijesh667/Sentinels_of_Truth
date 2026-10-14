import { useState, useEffect, useRef } from "react";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import VerdictBadge from "./ui/VerdictBadge";
import ConfidenceMeter from "./ui/ConfidenceMeter";
import SourceList from "./ui/SourceList";
import { formatOriginLabel, getVerdictConfig } from "../utils/verdict";

function formatTookMs(ms) {
  if (ms == null || isNaN(ms)) return null;
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

export default function ResponseCard({
  result,
  isStopped,
  onCheckAnother,
  onReverify,
  currentQuery = "",
}) {
  const containerRef = useRef(null);
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareDropdownOpen, setShareDropdownOpen] = useState(false);

  // Smooth scroll and focus on result arrival
  useEffect(() => {
    if (result && (result.data || result.response || result.error)) {
      const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      containerRef.current?.scrollIntoView({
        behavior: prefersReduced ? "auto" : "smooth",
        block: "start",
      });
    }
  }, [result]);

  if (isStopped) {
    return (
      <Card
        ref={containerRef}
        className="p-6 border-l-4 border-fg-muted mt-6 bg-surface shadow-xs"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-fg-muted shrink-0">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-fg">Verification stopped</h2>
            <p className="text-xs text-fg-muted mt-0.5">
              The verification request was stopped. You can edit your claim or try again.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!result) return null;

  if (
    result.code === "LOGIN_REQUIRED" ||
    result.code === "GAP" ||
    result.code === "DAILY_LIMIT"
  ) {
    return null;
  }

  const errorText = result.response || result.error;

  // Error state
  if (errorText && !result.data) {
    return (
      <Card
        ref={containerRef}
        className="p-6 border-l-4 border-danger mt-6 bg-surface shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-bold text-fg">Verification Error</h2>
          {result.took_ms != null && (
            <Badge variant="neutral" size="sm">
              {formatTookMs(result.took_ms)}
            </Badge>
          )}
        </div>
        <p className="text-fg-muted text-sm leading-relaxed">
          {errorText}
        </p>
        {onCheckAnother && (
          <div className="pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onCheckAnother}
              className="min-h-[40px]"
            >
              Try again
            </Button>
          </div>
        )}
      </Card>
    );
  }

  if (!result.data) return null;

  const status = result.data.verification_status || "unclear";
  const config = getVerdictConfig(status);
  const confidence = result.data.confidence ?? 0;

  const origin = result.origin || (result.cached ? "verified_db" : "web_search");
  const originText = formatOriginLabel(origin, result.verifiedAt);

  const userQuery = (result.query || currentQuery || "").trim();
  const checkedClaim = (result.data.claim || "").trim();
  const claimsDiffer =
    Boolean(userQuery) &&
    Boolean(checkedClaim) &&
    userQuery.toLowerCase() !== checkedClaim.toLowerCase();

  const summaryText = result.data.summary || "";
  const isLongSummary = summaryText.length > 350;
  const displayedSummary =
    isLongSummary && !showFullSummary
      ? summaryText.slice(0, 350) + "..."
      : summaryText;

  let sources = [];
  if (Array.isArray(result.data.sources)) {
    sources = result.data.sources;
  } else if (typeof result.data.sources === "string") {
    try {
      const parsed = JSON.parse(result.data.sources);
      if (Array.isArray(parsed)) {
        sources = parsed;
      } else if (result.data.sources.trim()) {
        sources = [result.data.sources.trim()];
      }
    } catch {
      if (result.data.sources.trim()) {
        sources = [result.data.sources.trim()];
      }
    }
  }
  const firstSource = sources[0] || "";

  const formattedShareText = `"${checkedClaim || userQuery}" — Verdict: ${config.label} (${confidence}% sure).${
    firstSource ? ` Sources: ${firstSource}` : ""
  }`;

  const handleShareClick = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Fact Check: ${config.label}`,
          text: formattedShareText,
          url: firstSource || window.location.href,
        });
        return;
      } catch (err) {
        if (err.name !== "AbortError") {
          setShareDropdownOpen((prev) => !prev);
        }
        return;
      }
    }
    setShareDropdownOpen((prev) => !prev);
  };

  const handleCopySummary = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(formattedShareText);
      } else {
        const ta = document.createElement("textarea");
        ta.value = formattedShareText;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShareDropdownOpen(false);
    } catch (err) {
      console.warn("Failed to copy text:", err);
    }
  };

  const handleWhatsAppShare = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(formattedShareText)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
    setShareDropdownOpen(false);
  };

  const borderColor =
    config.tone === "success"
      ? "border-l-success"
      : config.tone === "danger"
      ? "border-l-danger"
      : config.tone === "warning"
      ? "border-l-warning"
      : "border-l-line";

  return (
    <Card
      ref={containerRef}
      className={`p-6 sm:p-7 border border-line border-l-4 ${borderColor} bg-surface rounded-2xl shadow-xs mt-6 space-y-6 transition-all`}
    >
      {/* 1. TOP HEADER: VerdictBadge left, Origin tag & speed right */}
      <div className="flex items-center justify-between pb-3.5 border-b border-line flex-wrap gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <VerdictBadge status={status} size="md" />
          {result.isFromDbSuggestion && (
            <Badge variant="neutral" size="sm" className="bg-primary/10 text-primary border-primary/20 font-medium">
              Pre-verified
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-fg-muted">
          <Badge variant="neutral" size="sm">
            {originText}
          </Badge>
          {result.took_ms != null && (
            <span>{formatTookMs(result.took_ms)}</span>
          )}
        </div>
      </div>

      {/* 1.5 PRE-VERIFIED FROM DATABASE BANNER & RE-VERIFY */}
      {result.isFromDbSuggestion && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-2 border border-line text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-primary shrink-0" aria-hidden="true" />
            <div className="text-fg">
              <span className="font-semibold text-fg">Suggested from Database (Pre-verified)</span>
              <span className="text-fg-muted hidden sm:inline ml-1.5">
                • Retrieved from verified archives.
              </span>
            </div>
          </div>
          {onReverify && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onReverify(userQuery || checkedClaim)}
              className="shrink-0 text-xs font-semibold gap-1.5 min-h-[36px] bg-surface hover:bg-surface-2 border-line text-primary"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <span>Re-verify without DB</span>
            </Button>
          )}
        </div>
      )}

      {/* 2. CONFIDENCE BAR */}
      <div>
        <ConfidenceMeter
          confidence={confidence}
          status={status}
          showNotice={true}
        />
      </div>

      {/* 3. CLAIM BREAKDOWN */}
      <div className="space-y-3">
        <div className="p-3.5 rounded-xl bg-surface-2 border border-line">
          <span className="text-[11px] font-semibold text-fg-muted uppercase tracking-wider block mb-1">
            You asked
          </span>
          <p className="text-base font-medium text-fg leading-snug">
            {userQuery || checkedClaim}
          </p>
        </div>

        {claimsDiffer && (
          <div className="p-3 rounded-xl bg-surface-2/60 border border-line text-xs sm:text-sm">
            <span className="text-[11px] font-semibold text-fg-muted uppercase tracking-wider block mb-0.5">
              Checked claim
            </span>
            <p className="text-fg font-medium">{checkedClaim}</p>
          </div>
        )}
      </div>

      {/* 4. EDITORIAL EXPLANATION ("Why") */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-fg-muted uppercase tracking-wider block">
          Why
        </span>
        <div className="text-fg text-sm sm:text-base leading-relaxed whitespace-pre-line">
          {displayedSummary}
        </div>
        {isLongSummary && (
          <button
            type="button"
            onClick={() => setShowFullSummary((prev) => !prev)}
            className="text-xs text-primary hover:underline font-medium min-h-[32px] inline-flex items-center cursor-pointer"
          >
            {showFullSummary ? "Show less" : "Read full context"}
          </button>
        )}
      </div>

      {/* 5. VERIFIED SOURCES LIST */}
      <SourceList sources={sources} />

      {/* 6. ACTION BAR */}
      <div className="flex items-center justify-between pt-4 border-t border-line flex-wrap gap-3 relative">
        <div className="relative">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleShareClick}
            className="min-h-[40px] gap-2 text-xs sm:text-sm"
          >
            <svg
              className="w-4 h-4 text-fg-muted"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
            </svg>
            <span>Share breakdown</span>
          </Button>

          {/* Fallback Share Dropdown */}
          {shareDropdownOpen && (
            <div className="absolute left-0 bottom-full mb-2 w-56 rounded-xl bg-surface border border-line shadow-lg p-1.5 z-20 space-y-1">
              <button
                type="button"
                onClick={handleCopySummary}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-fg hover:bg-surface-2 rounded-lg text-left cursor-pointer min-h-[36px]"
              >
                <svg className="w-4 h-4 text-fg-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
                </svg>
                <span>{copied ? "Copied!" : "Copy summary"}</span>
              </button>

              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-fg hover:bg-surface-2 rounded-lg text-left cursor-pointer min-h-[36px]"
              >
                <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 012.41 5.83c.01 4.54-3.69 8.23-8.22 8.23z" />
                </svg>
                <span>Send on WhatsApp</span>
              </button>
            </div>
          )}
          {result.isFromDbSuggestion && onReverify && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onReverify(userQuery || checkedClaim)}
              className="min-h-[40px] gap-1.5 text-xs sm:text-sm text-primary hover:bg-surface-2"
            >
              <svg className="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <span>Re-verify</span>
            </Button>
          )}
        </div>

        {onCheckAnother && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCheckAnother}
            className="min-h-[40px] gap-2 text-xs sm:text-sm text-primary hover:bg-surface-2"
          >
            <span>Check another claim</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Button>
        )}
      </div>
    </Card>
  );
}
