import { useState, useEffect, useRef } from "react";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import Button from "./ui/Button";

function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return null;
  }
}

function formatTookMs(ms) {
  if (ms == null || isNaN(ms)) return null;
  if (ms < 1000) {
    return `${Math.round(ms)} ms`;
  }
  return `${(ms / 1000).toFixed(1)} s`;
}

function isVerifiedVerdict(status) {
  if (!status) return false;
  const s = String(status).toLowerCase().trim();
  return s === "verified" || s === "true" || s === "real";
}

function parseSource(urlStr) {
  try {
    const url = new URL(urlStr);
    if (url.protocol === "http:" || url.protocol === "https:") {
      const fullPath = url.pathname + url.search;
      const truncatedPath =
        fullPath.length > 36 ? fullPath.slice(0, 33) + "..." : fullPath;
      return {
        href: url.href,
        hostname: url.hostname,
        path: truncatedPath || "/",
      };
    }
  } catch {}
  return null;
}

export default function ResponseCard({
  result,
  isStopped,
  onCheckAnother,
  currentQuery = "",
}) {
  const containerRef = useRef(null);
  const headingRef = useRef(null);
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [copied, setCopied] = useState(false);
  const [barWidth, setBarWidth] = useState(0);

  // Smooth scroll and focus on result arrival
  useEffect(() => {
    if (result && (result.data || result.response || result.error)) {
      const prefersReduced = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)"
      )?.matches;
      containerRef.current?.scrollIntoView({
        behavior: prefersReduced ? "auto" : "smooth",
        block: "start",
      });
      headingRef.current?.focus();
    }
  }, [result]);

  // Confidence bar fill animation
  const confidence = result?.data?.confidence ?? 0;
  useEffect(() => {
    if (result?.data) {
      setBarWidth(0);
      const raf = requestAnimationFrame(() => {
        setBarWidth(confidence);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [result, confidence]);

  if (isStopped) {
    return (
      <Card
        ref={containerRef}
        className="p-6 sm:p-8 border-l-4 border-fg-muted mt-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-fg-muted">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </div>
          <div>
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="text-xl font-bold text-fg outline-hidden"
            >
              Stopped
            </h2>
            <p className="text-sm text-fg-muted mt-0.5">
              Verification was stopped. You can edit your claim or try again.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!result) {
    return null;
  }

  if (
    result.code === "LOGIN_REQUIRED" ||
    result.code === "GAP" ||
    result.code === "DAILY_LIMIT"
  ) {
    return null;
  }

  const displayText = result.response || result.error;

  // Error state
  if (displayText && !result.data) {
    return (
      <Card
        ref={containerRef}
        className="p-6 sm:p-8 border-l-4 border-danger mt-6"
      >
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="text-xl font-bold text-fg outline-hidden"
          >
            Verification Error
          </h2>
          {result.took_ms != null && (
            <Badge variant="neutral">{formatTookMs(result.took_ms)}</Badge>
          )}
        </div>
        <p className="text-fg-muted text-sm leading-relaxed mb-4">
          {displayText}
        </p>
        {onCheckAnother && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onCheckAnother}
            className="min-h-[40px]"
          >
            Try another claim
          </Button>
        )}
      </Card>
    );
  }

  if (result.data) {
    const isReal = isVerifiedVerdict(result.data.verification_status);
    const statusBorderColor = isReal ? "border-success" : "border-danger";
    const verdictVariant = isReal ? "success" : "danger";
    const verdictText = result.data.verification_status || "Unknown";

    const origin =
      result.origin || (result.cached ? "verified_db" : "web_search");
    const isDbOrigin = origin === "verified_db";

    const verifiedDateFormatted = formatDate(result.verifiedAt);

    const userQuery = (result.query || currentQuery || "").trim();
    const checkedClaim = (result.data.claim || "").trim();
    const claimsDiffer =
      Boolean(userQuery) &&
      Boolean(checkedClaim) &&
      userQuery.toLowerCase() !== checkedClaim.toLowerCase();

    const matchedClaim = (result.matchedClaim || "").trim();
    const matchedDiffers =
      Boolean(matchedClaim) &&
      userQuery &&
      matchedClaim.toLowerCase() !== userQuery.toLowerCase();

    const summaryText = result.data.summary || "";
    const isLongSummary = summaryText.length > 600;
    const displayedSummary =
      isLongSummary && !showFullSummary
        ? summaryText.slice(0, 600) + "..."
        : summaryText;

    // Filter valid sources
    const validSources = Array.isArray(result.data.sources)
      ? result.data.sources.map(parseSource).filter(Boolean)
      : [];

    const handleCopy = async () => {
      const parts = [];
      if (userQuery) parts.push(`Query: ${userQuery}`);
      if (checkedClaim && claimsDiffer) parts.push(`Claim: ${checkedClaim}`);
      parts.push(`Verdict: ${verdictText}`);
      parts.push(`Confidence: ${confidence}%`);
      if (summaryText) parts.push(`Summary: ${summaryText}`);
      if (validSources.length > 0) {
        parts.push(
          "Sources:\n" + validSources.map((s) => `- ${s.href}`).join("\n")
        );
      }
      const textToCopy = parts.join("\n\n");

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(textToCopy);
        } else {
          const ta = document.createElement("textarea");
          ta.value = textToCopy;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.warn("Failed to copy result:", err);
      }
    };

    return (
      <Card
        ref={containerRef}
        className={`p-6 sm:p-8 border-l-4 ${statusBorderColor} mt-6 space-y-6 transition-all`}
      >
        {/* Header: Title, verdict pill, took_ms */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-line">
          <div className="flex items-center gap-3 flex-wrap">
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="text-2xl sm:text-3xl font-bold text-fg font-display tracking-tight outline-hidden"
            >
              Verification result
            </h2>
            {result.took_ms != null && (
              <Badge variant="neutral" size="sm">
                {formatTookMs(result.took_ms)}
              </Badge>
            )}
          </div>
          <Badge variant={verdictVariant} size="md" className="px-3.5 py-1 text-sm font-semibold capitalize">
            {verdictText}
          </Badge>
        </div>

        {/* Origin tag block */}
        <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-surface-2 border border-line text-xs sm:text-sm">
          <div className="flex items-center gap-2 flex-wrap">
            {isDbOrigin ? (
              <Badge variant="primary" size="sm" className="font-semibold">
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                </svg>
                <span>Verified database</span>
              </Badge>
            ) : (
              <Badge variant="neutral" size="sm">
                <span>Fresh web search</span>
              </Badge>
            )}
            <span className="text-fg-muted">
              {isDbOrigin
                ? verifiedDateFormatted
                  ? `Checked on ${verifiedDateFormatted}`
                  : "Previously verified"
                : "Live evidence analyzed"}
            </span>
          </div>

          {isDbOrigin && matchedDiffers && (
            <p className="text-xs text-fg-muted pt-1">
              <span className="font-medium text-fg">Matched with:</span>{" "}
              {matchedClaim}
            </p>
          )}
        </div>

        {/* Claim block */}
        <div className="space-y-2.5">
          <div className="bg-surface-2 p-4 rounded-xl border border-line">
            <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-1">
              You asked
            </p>
            <p className="text-fg font-medium text-base sm:text-lg leading-snug">
              {userQuery || checkedClaim}
            </p>
          </div>

          {claimsDiffer && (
            <div className="bg-surface-2/60 p-3 rounded-xl border border-line text-xs sm:text-sm">
              <span className="font-semibold text-fg-muted uppercase tracking-wider text-[11px] block mb-0.5">
                Checked claim
              </span>
              <p className="text-fg font-medium">{checkedClaim}</p>
            </div>
          )}
        </div>

        {/* Confidence Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-semibold text-fg-muted uppercase tracking-wider">
              Confidence in this verdict
            </span>
            <span
              className={`text-xl sm:text-2xl font-bold font-display ${
                isReal ? "text-success" : "text-danger"
              }`}
            >
              {confidence}%
            </span>
          </div>

          <div
            role="progressbar"
            aria-valuenow={confidence}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Confidence in this verdict"
            className="w-full bg-surface-2 border border-line rounded-full h-3 overflow-hidden"
          >
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                isReal ? "bg-success" : "bg-danger"
              }`}
              style={{ width: `${barWidth}%` }}
            />
          </div>

          {confidence < 60 && (
            <p className="text-xs text-fg-muted flex items-center gap-1.5 pt-0.5">
              <svg
                className="w-3.5 h-3.5 text-warning flex-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              <span>Low confidence. Double-check the sources.</span>
            </p>
          )}
        </div>

        {/* Summary */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider">
            Summary
          </p>
          <div className="text-fg leading-relaxed text-sm sm:text-base whitespace-pre-line">
            {displayedSummary}
          </div>
          {isLongSummary && (
            <button
              type="button"
              onClick={() => setShowFullSummary((prev) => !prev)}
              className="text-xs text-primary hover:underline font-medium min-h-[32px] inline-flex items-center cursor-pointer"
            >
              {showFullSummary ? "Show less" : "Show more"}
            </button>
          )}
        </div>

        {/* Sources */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider">
            Sources
          </p>
          {validSources.length > 0 ? (
            <div className="space-y-2">
              {validSources.map((source, index) => (
                <a
                  key={index}
                  href={source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 p-3 bg-surface-2 rounded-xl border border-line hover:border-primary/50 hover:bg-surface transition-colors group min-h-[44px]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-primary flex-none" aria-hidden="true">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                        />
                      </svg>
                    </span>
                    <span className="font-semibold text-sm text-fg group-hover:text-primary transition-colors flex-none">
                      {source.hostname}
                    </span>
                    <span className="text-xs text-fg-muted truncate">
                      {source.path}
                    </span>
                  </div>
                  <span
                    className="text-fg-muted group-hover:text-primary transition-colors flex-none"
                    aria-hidden="true"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                      />
                    </svg>
                  </span>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-xs text-fg-muted italic bg-surface-2 p-3 rounded-xl border border-line">
              No sources available
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-line flex-wrap gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            className="min-h-[40px] gap-2"
          >
            {copied ? (
              <>
                <svg
                  className="w-4 h-4 text-success"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                <span>Copy result</span>
              </>
            )}
          </Button>

          {onCheckAnother && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onCheckAnother}
              className="min-h-[40px] gap-2"
            >
              <span>Check another claim</span>
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return null;
}
