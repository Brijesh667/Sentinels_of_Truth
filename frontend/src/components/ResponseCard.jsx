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
        className="p-6 border border-line mt-6 bg-surface rounded-2xl shadow-xs result-card-enter"
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

  const isNonClaim =
    result.call_function === false ||
    (!result.error && Boolean(result.response)) ||
    (typeof errorText === "string" &&
      (errorText.toLowerCase().includes("fact-verification agent") ||
        errorText.toLowerCase().includes("casual conversation") ||
        errorText.toLowerCase().includes("only verify factual claims") ||
        errorText.toLowerCase().includes("only respond to and verify")));

  // Non-claim / casual conversation response
  if (isNonClaim && !result.data) {
    return (
      <Card
        ref={containerRef}
        className="p-6 border border-line mt-6 bg-surface rounded-2xl shadow-xs space-y-3 result-card-enter"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-bold text-fg">That doesn&apos;t look like a claim</h2>
          {result.took_ms != null && (
            <span className="text-[11px] sm:text-xs text-fg-muted/70 tabular-nums">
              {formatTookMs(result.took_ms)}
            </span>
          )}
        </div>
        <p className="text-fg-muted text-sm sm:text-base leading-relaxed max-w-[65ch]">
          I can only check factual claims. Paste a statement, headline, or forward and I&apos;ll find the evidence.
        </p>
        {onCheckAnother && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onCheckAnother}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-line bg-surface hover:bg-surface-2 hover:border-[var(--accent)] text-xs sm:text-sm font-medium text-fg transition-colors duration-200 cursor-pointer min-h-[40px] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <span>Check another claim</span>
            </button>
          </div>
        )}
      </Card>
    );
  }

  // Genuine Error state
  if (errorText && !result.data) {
    return (
      <Card
        ref={containerRef}
        className="p-6 border border-line mt-6 bg-surface rounded-2xl shadow-xs space-y-3 result-card-enter"
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

  return (
    <Card
      ref={containerRef}
      className="relative overflow-hidden p-5 sm:p-7 border border-line bg-surface rounded-2xl shadow-xs mt-6 space-y-6 result-card-enter"
      style={{
        "--verdict-color": config.varColor,
        "--verdict-bg": config.varBg,
        "--verdict-border": config.varBorder,
        "--verdict-glow": config.varGlow,
        "--verdict-gradient": config.varGradient,
      }}
    >
      {/* 2. Soft top-left radial glow inside the card using verdict color at ~8% opacity */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{
          background: "radial-gradient(circle at 0% 0%, var(--verdict-glow) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      {/* 1. TOP HEADER: VerdictBadge left, Origin chip & speed right (no divider line, spacing only) */}
      <div className="flex items-center justify-between flex-wrap gap-2.5 relative z-10">
        <div className="flex items-center gap-2 flex-wrap">
          <VerdictBadge status={status} size="md" showIcon={false} />
          {result.isFromDbSuggestion && (
            <Badge variant="neutral" size="sm" className="bg-primary/10 text-primary border-primary/20 font-medium">
              Pre-verified
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] sm:text-xs text-fg-muted">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-2 text-fg-muted border border-line/60">
            {originText}
          </span>
          {result.took_ms != null && (
            <span className="tabular-nums text-fg-muted/70">{formatTookMs(result.took_ms)}</span>
          )}
        </div>
      </div>

      {/* 1.5 PRE-VERIFIED FROM DATABASE BANNER & RE-VERIFY */}
      {result.isFromDbSuggestion && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-2/60 border border-line text-xs sm:text-sm relative z-10">
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

      {/* 2. CONFIDENCE BAR (6px, muted track, animated gradient fill) */}
      <div className="relative z-10">
        <ConfidenceMeter
          confidence={confidence}
          status={status}
          showNotice={true}
        />
      </div>

      {/* 3. "YOU ASKED" BOX (Quote style with 2px muted left line, no heavy box) */}
      <div className="space-y-3 relative z-10">
        <div className="border-l-2 border-line pl-3.5 sm:pl-4 py-0.5 space-y-1">
          <span className="text-[11px] font-medium text-fg-muted uppercase tracking-wider block">
            You asked
          </span>
          <p className="text-base font-medium text-fg leading-snug">
            {userQuery || checkedClaim}
          </p>
        </div>

        {claimsDiffer && (
          <div className="border-l-2 border-line/70 pl-3.5 sm:pl-4 py-0.5 space-y-0.5">
            <span className="text-[11px] font-medium text-fg-muted uppercase tracking-wider block">
              Checked claim
            </span>
            <p className="text-sm font-medium text-fg">{checkedClaim}</p>
          </div>
        )}
      </div>

      {/* 4. EDITORIAL EXPLANATION ("Why") */}
      <div className="space-y-1.5 relative z-10">
        <span className="text-xs font-semibold text-fg-muted uppercase tracking-wider block">
          Why
        </span>
        <div className="text-base leading-relaxed text-fg-muted dark:text-slate-300 max-w-[65ch] whitespace-pre-line">
          {displayedSummary}
        </div>
        {isLongSummary && (
          <button
            type="button"
            onClick={() => setShowFullSummary((prev) => !prev)}
            className="text-xs text-[var(--accent)] hover:underline font-medium min-h-[32px] inline-flex items-center cursor-pointer"
          >
            {showFullSummary ? "Show less" : "Read full context"}
          </button>
        )}
      </div>

      {/* 5. VERIFIED SOURCES LIST */}
      <div className="relative z-10">
        <SourceList sources={sources} />
      </div>

      {/* 6. ACTION BAR (Only divider on the card is here, top spacing, quiet outlined share, text link arrow) */}
      <div className="flex items-center justify-between pt-5 mt-6 border-t border-line flex-wrap gap-3 relative z-10">
        <div className="relative">
          <button
            type="button"
            onClick={handleShareClick}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-line bg-surface hover:bg-surface-2 hover:border-[var(--accent)] text-xs sm:text-sm font-medium text-fg transition-colors duration-200 cursor-pointer min-h-[40px] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
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
          </button>

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
            <button
              type="button"
              onClick={() => onReverify(userQuery || checkedClaim)}
              className="inline-flex items-center gap-1.5 px-3 py-2 ml-2 rounded-xl border border-line bg-surface hover:bg-surface-2 text-xs sm:text-sm font-medium text-[var(--accent)] min-h-[40px] cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <span>Re-verify</span>
            </button>
          )}
        </div>

        {onCheckAnother && (
          <button
            type="button"
            onClick={onCheckAnother}
            className="group inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[var(--accent)] hover:underline cursor-pointer min-h-[40px] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-lg py-1 px-1"
          >
            <span>Check another claim</span>
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-[3px] motion-reduce:group-hover:translate-x-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        )}
      </div>
    </Card>
  );
}
