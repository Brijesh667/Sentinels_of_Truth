import { useEffect, useState, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";
import axiosClient from "../utils/axiosClient";
import { streamVerify } from "../utils/streamVerify";
import SuggestionDropdown from "./SuggestionDropdown";
import ResponseCard from "./ResponseCard";
import HistoryPanel from "./HistoryPanel";

function QueryForm() {
  const { getToken, isSignedIn } = useAuth();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("");
  const [isStopped, setIsStopped] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [historyTrigger, setHistoryTrigger] = useState(0);

  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Abort in-flight request on component unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;

    if (value.length <= 200) {
      setQuery(value);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setResult({
      data: suggestion.data,
    });
    setQuery(suggestion.text);
    setShowSuggestions(false);
    setSuggestions([]);
    setIsStopped(false);
  };

  const handleSelectHistory = (historyItem) => {
    if (historyItem.result) {
      setResult({
        data: historyItem.result,
        cached: historyItem.cached,
        took_ms: historyItem.tookMs,
      });
      setQuery(historyItem.claim || "");
      setIsStopped(false);
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
    setStage("");
    setIsStopped(true);
  };

  const handleSubmit = async () => {
    if (!query.trim() || cooldown > 0 || loading) {
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setIsStopped(false);
    setStage("");
    setResult(null);
    setShowSuggestions(false);
    setSuggestions([]);

    let token = null;
    if (isSignedIn) {
      try {
        token = await getToken();
      } catch (err) {
        console.warn("Could not retrieve Clerk token:", err);
      }
    }

    await streamVerify({
      query,
      token,
      signal: controller.signal,
      onProgress: (newStage) => {
        setStage(newStage);
      },
      onResult: async (alphaResponse) => {
        setLoading(false);
        setStage("");
        if (alphaResponse?.success === false) {
          setResult({
            error: alphaResponse.error || "Verification failed",
          });
          return;
        }
        setResult(alphaResponse);

        // Refresh user history list
        if (isSignedIn) {
          setHistoryTrigger((prev) => prev + 1);
        }
      },
      onError: (errorData) => {
        setLoading(false);
        setStage("");
        const errorMessage =
          errorData?.error || "Something went wrong. Please try again.";

        setResult({
          response: errorMessage,
          code: errorData?.code,
        });

        if (errorData?.code === "GAP") {
          const retryAfter = Number(errorData?.retryAfter) || 30;
          setCooldown(retryAfter);
        }
      },
    });
  };

  useEffect(() => {
    if (!query || query.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await axiosClient.post("/sug/suggestion", {
          query: query,
        });

        if (response.data) {
          let suggestionsArray = [];

          if (Array.isArray(response.data)) {
            suggestionsArray = response.data;
          } else if (
            response.data.suggestions &&
            Array.isArray(response.data.suggestions)
          ) {
            suggestionsArray = response.data.suggestions.map((item) => ({
              score: item.score,
              text: item.data.claim || item.data.text || JSON.stringify(item.data),
              data: item.data,
            }));
          }

          if (suggestionsArray.length > 0) {
            setSuggestions(suggestionsArray);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      } catch (error) {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    };

    const handleClickOutside = (e) => {
      if (e.target.closest(".suggestion-container") === null) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative z-10 suggestion-container">
        <textarea
          value={query}
          onChange={handleInputChange}
          placeholder="Enter your fact claim here..."
          rows="4"
          className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm md:text-base"
        />

        <div className="text-right text-xs text-gray-500 mt-2 mb-3">
          {query.length}/200
        </div>

        {showSuggestions && (
          <SuggestionDropdown
            suggestions={suggestions}
            onSelectSuggestion={handleSuggestionClick}
          />
        )}
      </div>

      <div className="flex justify-end mt-3 gap-3">
        {loading && (
          <button
            type="button"
            onClick={handleStop}
            className="px-6 py-3 h-fit bg-red-600 text-white rounded-xl hover:bg-red-700 transition duration-200 font-medium whitespace-nowrap cursor-pointer"
          >
            Stop
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading || cooldown > 0}
          className="relative z-20 px-8 py-3 h-fit bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition duration-200 font-medium disabled:bg-gray-400 whitespace-nowrap cursor-pointer"
        >
          {loading ? "Checking..." : cooldown > 0 ? `Wait (${cooldown}s)` : "Verify Fact"}
        </button>
      </div>

      <ResponseCard
        result={result}
        loading={loading}
        stage={stage}
        isStopped={isStopped}
      />

      <HistoryPanel
        onSelectHistory={handleSelectHistory}
        refreshTrigger={historyTrigger}
      />
    </div>
  );
}

export default QueryForm;
