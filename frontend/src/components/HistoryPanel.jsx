import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";

const RAW_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const BACKEND_URL = RAW_URL.replace(/\/+$/, "");

function HistoryPanel({ onSelectHistory, refreshTrigger }) {
  const { getToken, isSignedIn } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    if (!isSignedIn) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
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
  }, [getToken, isSignedIn]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, refreshTrigger]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      const token = await getToken();
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

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">My Verification History</h3>
        <button
          onClick={fetchHistory}
          disabled={loading}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

      {history.length === 0 && !loading ? (
        <p className="text-sm text-gray-500 italic py-2">No verification history yet.</p>
      ) : (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {history.map((item) => {
            const status = item.result?.verification_status?.toLowerCase();
            const isReal = status === "verified" || status === "true" || status === "real";
            const badgeClass = isReal
              ? "bg-green-100 text-green-800 border-green-200"
              : "bg-red-100 text-red-800 border-red-200";

            return (
              <div
                key={item._id}
                onClick={() => onSelectHistory(item)}
                className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition cursor-pointer group"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {item.claim}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border font-medium ${badgeClass}`}
                    >
                      {item.result?.verification_status || "Result"}
                    </span>
                    {item.cached && (
                      <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">
                        cached
                      </span>
                    )}
                    <span className="text-[11px] text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleDelete(e, item._id)}
                  title="Delete item"
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                >
                  <svg
                    className="w-4 h-4"
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
        </div>
      )}
    </div>
  );
}

export default HistoryPanel;
