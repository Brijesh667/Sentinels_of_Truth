import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "../auth/AuthContext";
import axiosClient from "../utils/axiosClient";
import { streamVerify } from "../utils/streamVerify";
import Header from "./Header";
import SuggestionDropdown from "./SuggestionDropdown";
import ResponseCard from "./ResponseCard";
import HistoryPanel from "./HistoryPanel";
import ThoughtLine from "./reactbits/ThoughtLine";
import Button from "./ui/Button";

const EXAMPLE_CHIPS = [
  "Is Earth flat?",
  "Do vaccines cause autism?",
  "Is the Great Wall of China visible from space?",
  "Do we use only 10% of our brain?",
  "Is the Taj Mahal in Agra?",
  "Does drinking hot water cure COVID-19?",
];

const STAGE_LABELS = {
  checking_cache: "Checking the verified database",
  searching: "Searching the web for evidence",
  analyzing: "Weighing the evidence",
};

export default function QueryForm() {
  const { getAccessToken, isSignedIn, refreshSession, openAuthModal } = useAuth();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("");
  const [steps, setSteps] = useState([]);
  const [isStopped, setIsStopped] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isDailyLimitReached, setIsDailyLimitReached] = useState(false);
  const [historyTrigger, setHistoryTrigger] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  const abortControllerRef = useRef(null);
  const textareaRef = useRef(null);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mq.matches);
    const handler = (e) => setIsReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Countdown timer for GAP rate limit
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Abort on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Textarea auto-grow between 3 and 8 rows (approx 96px to 220px)
  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const minHeight = 96;
    const maxHeight = 220;
    const scrollH = el.scrollHeight;
    const clampedH = Math.min(Math.max(scrollH, minHeight), maxHeight);
    el.style.height = `${clampedH}px`;
    el.style.overflowY = scrollH > maxHeight ? "auto" : "hidden";
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value.length <= 300) {
      setQuery(value);
      setTimeout(adjustTextareaHeight, 0);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleChipClick = (chip) => {
    setQuery(chip);
    if (textareaRef.current) {
      textareaRef.current.focus();
      setTimeout(adjustTextareaHeight, 0);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setResult({
      data: suggestion.data,
      origin: "verified_db",
      cached: true,
      query: suggestion.text,
    });
    setQuery(suggestion.text);
    setShowSuggestions(false);
    setSuggestions([]);
    setIsStopped(false);
    setTimeout(adjustTextareaHeight, 0);
  };

  const handleSelectHistory = (historyItem) => {
    if (historyItem) {
      setResult(historyItem);
      setQuery(historyItem.query || historyItem.claim || "");
      setIsStopped(false);
      setLoading(false);
      setTimeout(adjustTextareaHeight, 0);
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
    if (!query.trim() || cooldown > 0 || loading || isDailyLimitReached) {
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setIsStopped(false);
    setStage("checking_cache");
    setSteps(["Checking the verified database"]);
    setResult(null);
    setShowSuggestions(false);
    setSuggestions([]);

    let token = null;
    if (isSignedIn) {
      try {
        token = await getAccessToken();
      } catch (err) {
        console.warn("Could not retrieve access token:", err);
      }
    }

    await streamVerify({
      query: query.trim(),
      token,
      signal: controller.signal,
      retryOnExpired: async () => {
        try {
          const res = await refreshSession();
          return res?.accessToken || null;
        } catch {
          return null;
        }
      },
      onProgress: (newStage) => {
        setStage(newStage);
        const stageLabel =
          STAGE_LABELS[newStage] ||
          (newStage === "checking_cache"
            ? "Checking the verified database"
            : newStage === "searching"
            ? "Searching the web for evidence"
            : "Weighing the evidence");
        setSteps((prev) =>
          prev.includes(stageLabel) ? prev : [...prev, stageLabel]
        );
      },
      onResult: async (alphaResponse) => {
        setLoading(false);
        setStage("");
        if (alphaResponse?.success === false) {
          setResult({
            error: alphaResponse.error || "Verification failed",
            took_ms: alphaResponse.took_ms,
            query: query.trim(),
          });
          return;
        }
        setResult(alphaResponse);

        // Auto-open AuthModal after guest's last free check
        if (!isSignedIn && alphaResponse?.guestRemaining === 0) {
          setTimeout(() => {
            openAuthModal({
              subtitle:
                "You've used your 2 free checks. Sign in to continue. Your results will be saved to your history.",
            });
          }, 800);
        }

        // Refresh user history list
        if (isSignedIn) {
          setHistoryTrigger((prev) => prev + 1);
        }
      },
      onError: (errorData, status) => {
        setLoading(false);
        setStage("");

        if (errorData?.code === "LOGIN_REQUIRED") {
          openAuthModal({
            subtitle:
              "You've used your 2 free checks. Sign in to continue. Your results will be saved to your history.",
          });
          return;
        }

        if (errorData?.code === "GAP") {
          const retryAfter = Number(errorData?.retryAfter) || 30;
          setCooldown(retryAfter);
          return;
        }

        if (errorData?.code === "DAILY_LIMIT") {
          setIsDailyLimitReached(true);
          return;
        }

        if (status === 429) {
          return;
        }

        const errorMessage =
          errorData?.error || "Something went wrong. Please try again.";

        setResult({
          response: errorMessage,
          code: errorData?.code,
          query: query.trim(),
        });
      },
    });
  };

  // Autocomplete suggestions
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await axiosClient.post("/sug/suggestion", {
          query: query.trim(),
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
              text:
                item.data.claim || item.data.text || JSON.stringify(item.data),
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
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside suggestions listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.closest(".suggestion-container") === null) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const showChips =
    !query.trim() && !result && !loading && !isStopped;

  // Character counter color classes
  const counterClass =
    query.length >= 300
      ? "text-danger font-semibold"
      : query.length >= 270
      ? "text-warning font-medium"
      : "text-fg-muted";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8 items-start">
      {/* Main Column */}
      <div className="min-w-0 space-y-6">
        <Header />

        {/* Input Card */}
        <div className="relative z-10 suggestion-container bg-surface border border-line rounded-2xl p-4 sm:p-5 shadow-xs transition-colors">
          <label htmlFor="claim-input" className="sr-only">
            Claim or statement to verify
          </label>
          <textarea
            id="claim-input"
            ref={textareaRef}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Is it true that...?"
            rows={3}
            maxLength={300}
            className="w-full bg-transparent text-fg outline-hidden text-base sm:text-lg placeholder:text-fg-muted caret-primary resize-none transition-colors leading-relaxed"
          />

          {/* Bottom row of input card: hints, counter & action button */}
          <div className="flex items-center justify-between pt-3 border-t border-line text-xs gap-3">
            <div className="flex items-center gap-3">
              <span className="text-fg-muted hidden sm:inline">
                Ctrl + Enter to check
              </span>
              <div className={counterClass} aria-live="polite">
                {query.length}/300
              </div>
            </div>

            <div className="flex items-center gap-2">
              {loading ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleStop}
                  className="text-danger border-danger/40 hover:bg-danger-soft hover:border-danger/60 min-h-[36px] px-3.5 gap-1.5 font-semibold text-xs sm:text-sm cursor-pointer shadow-xs"
                >
                  <svg
                    className="w-3.5 h-3.5 fill-current flex-shrink-0"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <rect x="5" y="5" width="14" height="14" rx="2" />
                  </svg>
                  <span>Stop</span>
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubmit}
                  disabled={
                    cooldown > 0 ||
                    isDailyLimitReached ||
                    !query.trim()
                  }
                  className="min-h-[36px] px-4 font-semibold text-xs sm:text-sm"
                >
                  {isDailyLimitReached
                    ? "Daily limit reached"
                    : cooldown > 0
                    ? `Wait (${cooldown}s)`
                    : "Verify Fact"}
                </Button>
              )}
            </div>
          </div>

          {/* Autocomplete suggestion dropdown */}
          {showSuggestions && (
            <SuggestionDropdown
              suggestions={suggestions}
              onSelectSuggestion={handleSuggestionClick}
            />
          )}
        </div>

        {/* Example chips */}
        {showChips && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider">
              Try an example
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium text-fg bg-surface border border-line hover:border-primary hover:bg-surface-2 transition cursor-pointer min-h-[36px]"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Progress with ThoughtLine */}
        {loading && (
          <div
            className="p-6 bg-surface border border-line rounded-2xl shadow-xs transition-colors"
            aria-live="polite"
          >
            <ThoughtLine
              working={loading}
              steps={steps}
              label="Thinking"
              doneLabel="Thought for"
              glyph="sparkle"
              fontSize={16}
              breathPeriod={1.6}
              breathDepth={isReducedMotion ? 0 : 0.45}
              settleDuration={350}
              settleBlur={isReducedMotion ? 0 : 2}
              collapsible
              collapseOnSettle
              showTimer
            />
          </div>
        )}

        {/* Verification Result Card */}
        <ResponseCard
          result={result}
          isStopped={isStopped}
          currentQuery={query}
          onCheckAnother={() => {
            setResult(null);
            setIsStopped(false);
            if (textareaRef.current) {
              textareaRef.current.focus();
            }
          }}
        />
      </div>

      {/* History Column (Sticky on desktop lg+, Collapsible underneath on mobile <lg) */}
      <aside className="lg:sticky lg:top-20">
        <HistoryPanel
          onSelectHistory={handleSelectHistory}
          refreshTrigger={historyTrigger}
        />
      </aside>
    </div>
  );
}
