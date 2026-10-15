import { useEffect, useState, useCallback } from "react";
import { useAppAuth } from "../auth/useAppAuth";
import Sheet from "./ui/Sheet";
import Button from "./ui/Button";
import VerdictBadge from "./ui/VerdictBadge";

const RAW_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const BACKEND_URL = RAW_URL.replace(/\/+$/, "");

function getRelativeTimeString(dateStr) {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
    const absDiff = Math.abs(diffInSeconds);

    if (absDiff < 60) return "just now";

    const diffInMinutes = Math.round(diffInSeconds / 60);
    if (Math.abs(diffInMinutes) < 60) {
      const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
      return rtf.format(diffInMinutes, "minute");
    }

    const diffInHours = Math.round(diffInMinutes / 60);
    if (Math.abs(diffInHours) < 24) {
      const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
      return rtf.format(diffInHours, "hour");
    }

    const diffInDays = Math.round(diffInHours / 24);
    if (Math.abs(diffInDays) === 1) return "Yesterday";
    if (Math.abs(diffInDays) < 30) {
      return `${Math.abs(diffInDays)} days ago`;
    }

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function HistorySheet({
  isOpen,
  onClose,
  onSelectHistory,
  refreshTrigger,
}) {
  const { getAccessToken, isSignedIn } = useAppAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!isSignedIn) return;
    setLoading(true);
    setError(null);
    try {
      let token = await getAccessToken();
      let res = await fetch(`${BACKEND_URL}/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 401) {
        token = await getAccessToken({ skipCache: true });
        if (token) {
          res = await fetch(`${BACKEND_URL}/history`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
      }
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
    if (isOpen) {
      fetchHistory();
    } else {
      setConfirmDeleteId(null);
      setDeletingId(null);
      setConfirmClearAll(false);
    }
  }, [isOpen, fetchHistory, refreshTrigger]);

  const handleConfirmDelete = async (e, id) => {
    if (e) e.stopPropagation();
    setDeletingId(id);
    try {
      let token = await getAccessToken();
      let res = await fetch(`${BACKEND_URL}/history/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 401) {
        token = await getAccessToken({ skipCache: true });
        if (token) {
          res = await fetch(`${BACKEND_URL}/history/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
      }
      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete history item:", err);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const executeClearAll = async () => {
    setClearingAll(true);
    try {
      let token = await getAccessToken();
      let res = await fetch(`${BACKEND_URL}/history`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 401) {
        token = await getAccessToken({ skipCache: true });
        if (token) {
          res = await fetch(`${BACKEND_URL}/history`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
      }
      if (res.ok) {
        setHistory([]);
        setConfirmClearAll(false);
      }
    } catch (err) {
      console.error("Failed to clear history:", err);
    } finally {
      setClearingAll(false);
    }
  };

  const handleItemClick = (item) => {
    onSelectHistory({
      query: item.query || item.claim,
      claim: item.claim,
      data: item.result,
      origin: item.origin || (item.cached ? "verified_db" : "web_search"),
      cached: item.cached,
      verifiedAt: item.verifiedAt,
      matchedClaim: item.matchedClaim,
      took_ms: item.tookMs,
    });
    onClose();
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Verification history"
      description={
        history.length > 0 ? `${history.length} saved checks` : "Your private check log"
      }
    >
      <div className="flex flex-col h-full space-y-4">
        {history.length > 0 && (
          <div className="relative pb-2 border-b border-line">
            {confirmClearAll ? (
              <div className="p-2.5 rounded-xl bg-danger/10 border border-danger/30 flex items-center justify-between gap-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-danger/20 text-danger flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-fg">
                    Do you want to clear history?
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setConfirmClearAll(false)}
                    className="px-2.5 py-1 text-xs rounded-lg border border-line bg-surface hover:bg-surface-2 text-fg font-medium transition cursor-pointer min-h-[30px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={clearingAll}
                    onClick={executeClearAll}
                    className="px-3 py-1 text-xs rounded-lg bg-danger text-white hover:bg-danger/90 font-medium transition cursor-pointer flex items-center gap-1 min-h-[30px]"
                  >
                    {clearingAll ? "Clearing..." : "Yes"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xs text-fg-muted font-medium">
                  Recent checks
                </span>
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(true)}
                  disabled={loading}
                  className="text-xs text-danger hover:underline font-medium cursor-pointer min-h-[32px] px-1"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}

        {error && <p className="text-xs text-danger">{error}</p>}

        {loading && history.length === 0 ? (
          <div className="space-y-2 pt-2">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-16 rounded-xl bg-surface-2 animate-pulse border border-line"
              />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-surface-2 text-fg-muted mx-auto flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs sm:text-sm text-fg-muted max-w-xs mx-auto leading-relaxed">
              No past checks found. Verifications you run will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto pr-1">
            {history.map((item) => {
              const queryText = item.query || item.claim || "Check";
              const status = item.result?.verification_status || "unclear";

              return (
                <div
                  key={item._id}
                  onClick={() => handleItemClick(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleItemClick(item);
                    }
                  }}
                  className="group relative flex items-start justify-between gap-2.5 p-3 rounded-xl border border-line bg-surface hover:bg-surface-2 transition cursor-pointer text-left min-h-[44px]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-fg line-clamp-2 leading-snug">
                      {queryText}
                    </p>

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <VerdictBadge status={status} size="sm" showIcon={false} />
                      <span className="text-[11px] text-fg-muted">
                        {getRelativeTimeString(item.createdAt)}
                      </span>
                    </div>
                  </div>

                  {confirmDeleteId === item._id ? (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute inset-0 bg-surface/95 backdrop-blur-xs rounded-xl px-3 py-2 flex items-center justify-between gap-2 border border-danger/40 z-20 shadow-xs animate-in fade-in zoom-in-95 duration-150"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-danger/10 text-danger flex items-center justify-center shrink-0">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </div>
                        <span className="text-xs font-semibold text-fg truncate">
                          Delete this fact?
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(null);
                          }}
                          className="px-2.5 py-1 text-xs rounded-lg border border-line bg-surface hover:bg-surface-2 text-fg font-medium transition cursor-pointer min-h-[30px]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === item._id}
                          onClick={(e) => handleConfirmDelete(e, item._id)}
                          className="px-2.5 py-1 text-xs rounded-lg bg-danger text-white hover:bg-danger/90 font-medium transition cursor-pointer flex items-center gap-1 min-h-[30px]"
                        >
                          {deletingId === item._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(item._id);
                      }}
                      aria-label="Delete check"
                      className="p-1.5 text-fg-muted hover:text-danger rounded-lg hover:bg-danger-soft transition cursor-pointer flex-none min-h-[32px] min-w-[32px] flex items-center justify-center opacity-60 group-hover:opacity-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Sheet>
  );
}
