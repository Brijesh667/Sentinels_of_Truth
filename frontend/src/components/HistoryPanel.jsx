import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../auth/AuthContext";
import Card from "./ui/Card";
import Button from "./ui/Button";

const RAW_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const BACKEND_URL = RAW_URL.replace(/\/+$/, "");
const PAGE_SIZE = 8;

function getRelativeTimeString(dateStr) {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
    const absDiff = Math.abs(diffInSeconds);

    if (absDiff < 60) {
      return "just now";
    }

    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    const diffInMinutes = Math.round(diffInSeconds / 60);
    if (Math.abs(diffInMinutes) < 60) {
      return rtf.format(diffInMinutes, "minute");
    }
    const diffInHours = Math.round(diffInMinutes / 60);
    if (Math.abs(diffInHours) < 24) {
      return rtf.format(diffInHours, "hour");
    }
    const diffInDays = Math.round(diffInHours / 24);
    if (Math.abs(diffInDays) < 30) {
      return rtf.format(diffInDays, "day");
    }
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function HistoryPanel({ onSelectHistory, refreshTrigger }) {
  const { getAccessToken, isSignedIn, openAuthModal } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!isSignedIn) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const res = await fetch(`${BACKEND_URL}/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
      setError("Could not load history.");
    } finally {
      setLoading(false);
    }
  }, [getAccessToken, isSignedIn]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, refreshTrigger]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      const token = await getAccessToken();
      const res = await fetch(`${BACKEND_URL}/history/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete history item:", err);
    }
  };

  const handleClearAll = async () => {
    if (
      !window.confirm(
        "Are you sure you want to clear your entire verification history?"
      )
    ) {
      return;
    }
    try {
      const token = await getAccessToken();
      const res = await fetch(`${BACKEND_URL}/history`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setHistory([]);
      }
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  // Passive card for guests
  if (!isSignedIn) {
    return (
      <Card className="p-5 border border-line">
        <div className="flex items-center gap-2 mb-2">
          <svg
            className="w-4 h-4 text-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-sm font-semibold text-fg">My history</h3>
        </div>
        <p className="text-xs text-fg-muted mb-4 leading-relaxed">
          Sign in to keep your history and access your past checks across sessions.
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => openAuthModal()}
          className="w-full text-xs min-h-[40px]"
        >
          Sign in to keep your history
        </Button>
      </Card>
    );
  }

  const displayedHistory = history.slice(0, visibleCount);
  const hasMore = visibleCount < history.length;

  return (
    <Card className="p-4 sm:p-5 border border-line">
      {/* Mobile collapsible header button */}
      <button
        type="button"
        onClick={() => setIsOpenMobile((prev) => !prev)}
        className="lg:hidden flex items-center justify-between w-full text-left font-semibold text-fg min-h-[40px] cursor-pointer"
        aria-expanded={isOpenMobile}
      >
        <span className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>My history ({history.length})</span>
        </span>
        <svg
          className={`w-4 h-4 text-fg-muted transition-transform duration-200 ${
            isOpenMobile ? "rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      {/* Desktop header */}
      <div className="hidden lg:flex items-center justify-between mb-4 pb-2 border-b border-line">
        <h3 className="text-sm font-bold text-fg flex items-center gap-2">
          <svg
            className="w-4 h-4 text-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>My history</span>
          {history.length > 0 && (
            <span className="text-xs text-fg-muted font-normal">
              ({history.length})
            </span>
          )}
        </h3>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              disabled={loading}
              className="text-xs text-danger hover:underline font-medium min-h-[32px] px-1 cursor-pointer"
            >
              Clear all
            </button>
          )}
          <button
            type="button"
            onClick={fetchHistory}
            disabled={loading}
            className="text-xs text-primary hover:underline font-medium min-h-[32px] px-1 cursor-pointer"
          >
            {loading ? "..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Main content body (always on desktop, collapsible on mobile) */}
      <div className={`${isOpenMobile ? "block mt-3" : "hidden"} lg:block`}>
        {error && <p className="text-xs text-danger mb-2">{error}</p>}

        {loading && history.length === 0 ? (
          <div className="space-y-2">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-16 rounded-xl bg-surface-2 animate-pulse border border-line"
              />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="py-6 text-center text-xs text-fg-muted italic">
            Your checks will show up here.
          </div>
        ) : (
          <div className="space-y-2">
            {displayedHistory.map((item) => {
              const status =
                item.result?.verification_status?.toLowerCase() || "";
              const isVerified =
                status === "verified" || status === "true" || status === "real";
              const isDb =
                item.origin === "verified_db" ||
                Boolean(item.cached) ||
                item.origin !== "web_search";

              const queryText = item.query || item.claim || "Check";

              return (
                <div
                  key={item._id}
                  onClick={() =>
                    onSelectHistory({
                      query: item.query || item.claim,
                      claim: item.claim,
                      data: item.result,
                      origin:
                        item.origin ||
                        (item.cached ? "verified_db" : "web_search"),
                      cached: item.cached,
                      verifiedAt: item.verifiedAt,
                      matchedClaim: item.matchedClaim,
                      took_ms: item.tookMs,
                    })
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectHistory({
                        query: item.query || item.claim,
                        claim: item.claim,
                        data: item.result,
                        origin:
                          item.origin ||
                          (item.cached ? "verified_db" : "web_search"),
                        cached: item.cached,
                        verifiedAt: item.verifiedAt,
                        matchedClaim: item.matchedClaim,
                        took_ms: item.tookMs,
                      });
                    }
                  }}
                  className="group relative flex items-start justify-between gap-2 p-2.5 rounded-xl border border-line bg-surface hover:bg-surface-2 hover:border-primary/40 transition cursor-pointer text-left min-h-[44px]"
                >
                  <div className="flex-1 min-w-0 pr-1">
                    {/* Clamped claim / query */}
                    <p className="text-xs sm:text-sm font-medium text-fg line-clamp-2 leading-snug">
                      {queryText}
                    </p>

                    {/* Meta row: verdict dot/pill, confidence, relative time, origin */}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap text-[11px] text-fg-muted">
                      {/* Verdict dot + label */}
                      <span className="inline-flex items-center gap-1 font-semibold">
                        <span
                          className={`w-2 h-2 rounded-full flex-none ${
                            isVerified ? "bg-success" : "bg-danger"
                          }`}
                        />
                        <span className={isVerified ? "text-success" : "text-danger"}>
                          {item.result?.verification_status || "Result"}
                        </span>
                      </span>

                      {/* Confidence */}
                      {item.result?.confidence != null && (
                        <span>{item.result.confidence}%</span>
                      )}

                      {/* Relative time */}
                      <span>•</span>
                      <span>{getRelativeTimeString(item.createdAt)}</span>

                      {/* Origin icon */}
                      <span
                        className="inline-flex items-center text-fg-muted"
                        title={
                          isDb
                            ? "Verified database"
                            : "Fresh web search"
                        }
                        aria-label={
                          isDb
                            ? "Verified database"
                            : "Fresh web search"
                        }
                      >
                        {isDb ? (
                          <svg
                            className="w-3 h-3 text-primary"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-3 h-3"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 21a9 9 0 100-18 9 9 0 000 18z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3.6 9h16.8M3.6 15h16.8"
                            />
                          </svg>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, item._id)}
                    aria-label="Delete check"
                    title="Delete item"
                    className="p-1.5 text-fg-muted hover:text-danger rounded-lg hover:bg-danger-soft transition cursor-pointer opacity-70 group-hover:opacity-100 flex-none min-h-[32px] min-w-[32px] flex items-center justify-center"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              );
            })}

            {/* Load more pagination button */}
            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                className="w-full text-xs text-primary hover:bg-surface-2 mt-2 min-h-[36px]"
              >
                Load more
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
