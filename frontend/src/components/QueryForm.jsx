import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useAppAuth } from "../auth/useAppAuth";
import axiosClient from "../utils/axiosClient";
import { streamVerify } from "../utils/streamVerify";
import SuggestionDropdown from "./SuggestionDropdown";
import ResponseCard from "./ResponseCard";
import HistorySheet from "./HistorySheet";
import ThoughtLine from "./reactbits/ThoughtLine";
import Button from "./ui/Button";
import Chip from "./ui/Chip";

const EXAMPLE_CHIPS = [
  "Is Earth flat?",
  "Do vaccines cause autism?",
  "Do we use only 10% of our brain?",
  "Is the Taj Mahal in Agra?",
];

const STAGE_LABELS = {
  checking_cache: "Checking verified records...",
  searching: "Searching reputable sources...",
  analyzing: "Weighing the evidence...",
};

export default function QueryForm({
  isLanding = false,
  title,
  subtitle,
} = {}) {
  const { isSignedIn, openSignIn } = useAppAuth();
  const location = useLocation();

  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
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
  const [historySheetOpen, setHistorySheetOpen] = useState(false);
  const [isSlowColdStart, setIsSlowColdStart] = useState(false);

  const abortControllerRef = useRef(null);
  const textareaRef = useRef(null);
  const autoRunHandledRef = useRef(false);
  const coldStartTimerRef = useRef(null);
  const handleSubmitRef = useRef();

  // Auto-grow textarea
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

  // Listen for external claim select (e.g. from cards on landing page)
  useEffect(() => {
    const handler = (e) => {
      const text = e.detail;
      if (text && typeof text === "string") {
        const clean = text.slice(0, 300);
        setQuery(clean);
        if (textareaRef.current) {
          textareaRef.current.value = clean;
          adjustTextareaHeight();
          textareaRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
          textareaRef.current.focus();
        }
        handleSubmitRef.current?.(clean);
      }
    };
    window.addEventListener("sot:set-claim", handler);
    return () => window.removeEventListener("sot:set-claim", handler);
  }, [adjustTextareaHeight]);

  // Handle location state prefill / auto-run or ?q= query param
  useEffect(() => {
    if (autoRunHandledRef.current) return;

    const searchParams = new URLSearchParams(location.search);
    const qParam = searchParams.get("q");
    const incomingText = location.state?.claim || qParam;

    if (incomingText) {
      autoRunHandledRef.current = true;
      const cleanClaim = String(incomingText).slice(0, 300);
      setQuery(cleanClaim);

      if (location.state?.autorun) {
        setTimeout(() => {
          handleSubmit(cleanClaim);
        }, 120);
      } else {
        setTimeout(() => {
          adjustTextareaHeight();
          textareaRef.current?.focus();
        }, 80);
      }

      try {
        window.history.replaceState({}, document.title);
      } catch {}
    }
  }, [location.state, location.search, adjustTextareaHeight]);

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
      if (coldStartTimerRef.current) {
        clearTimeout(coldStartTimerRef.current);
      }
    };
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
    let rawData = suggestion?.data;
    if (typeof rawData === "string") {
      try {
        rawData = JSON.parse(rawData);
      } catch {}
    }

    const claimText =
      typeof suggestion === "string"
        ? suggestion
        : suggestion?.text ||
          rawData?.claim ||
          rawData?.text ||
          "";

    setShowSuggestions(false);
    setSuggestions([]);
    setQuery("");

    if (rawData && (rawData.verification_status || rawData.summary)) {
      let sources = rawData.sources;
      if (typeof sources === "string") {
        try {
          sources = JSON.parse(sources);
        } catch {}
      }

      setResult({
        data: {
          ...rawData,
          sources: Array.isArray(sources) ? sources : [],
        },
        origin: "verified_db",
        cached: true,
        query: claimText,
        isFromDbSuggestion: true,
      });
      setSubmittedQuery(claimText);
      setIsStopped(false);
      setLoading(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } else if (claimText) {
      handleSubmit(claimText);
    }
  };

  const handleReverify = (overrideQuery) => {
    const textToReverify = (
      typeof overrideQuery === "string"
        ? overrideQuery
        : submittedQuery || result?.query || result?.data?.claim || query
    ).trim();
    if (!textToReverify) return;

    setQuery(textToReverify);
    if (textareaRef.current) {
      textareaRef.current.value = textToReverify;
      setTimeout(adjustTextareaHeight, 0);
    }

    handleSubmit(textToReverify, { skipCache: true });
  };

  const handleSelectHistory = (historyItem) => {
    if (historyItem) {
      setResult(historyItem);
      const histText = historyItem.query || historyItem.claim || "";
      setSubmittedQuery(histText);
      setQuery("");
      setIsStopped(false);
      setLoading(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (coldStartTimerRef.current) {
      clearTimeout(coldStartTimerRef.current);
    }
    setLoading(false);
    setIsSlowColdStart(false);
    setStage("");
    setIsStopped(true);
  };

  const handleSubmit = async (overrideQuery, options = {}) => {
    handleSubmitRef.current = handleSubmit;
    const textToSubmit = (typeof overrideQuery === "string" ? overrideQuery : query).trim();
    if (!textToSubmit || cooldown > 0 || loading || isDailyLimitReached) {
      return;
    }

    const skipCache = Boolean(options?.skipCache);

    setSubmittedQuery(textToSubmit);
    setQuery("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setIsStopped(false);
    setIsSlowColdStart(false);
    setStage(skipCache ? "searching" : "checking_cache");
    setSteps([
      skipCache
        ? "Searching reputable sources..."
        : "Checking verified records...",
    ]);
    setResult(null);
    setShowSuggestions(false);
    setSuggestions([]);

    // 5-second cold start grace timer
    if (coldStartTimerRef.current) clearTimeout(coldStartTimerRef.current);
    coldStartTimerRef.current = setTimeout(() => {
      setIsSlowColdStart(true);
    }, 5000);

    await streamVerify({
      query: textToSubmit,
      skipCache,
      signal: controller.signal,
      onProgress: (newStage) => {
        if (coldStartTimerRef.current) clearTimeout(coldStartTimerRef.current);
        setIsSlowColdStart(false);

        setStage(newStage);
        const stageLabel =
          STAGE_LABELS[newStage] ||
          (newStage === "checking_cache"
            ? "Checking verified records..."
            : newStage === "searching"
            ? "Searching reputable sources..."
            : "Weighing the evidence...");
        setSteps((prev) =>
          prev.includes(stageLabel) ? prev : [...prev, stageLabel]
        );
      },
      onResult: async (alphaResponse) => {
        if (coldStartTimerRef.current) clearTimeout(coldStartTimerRef.current);
        setLoading(false);
        setIsSlowColdStart(false);
        setStage("");

        if (alphaResponse?.success === false) {
          setResult({
            error: alphaResponse.error || "Verification failed. Please try again.",
            took_ms: alphaResponse.took_ms,
            query: textToSubmit,
          });
          return;
        }

        setResult(alphaResponse);

        if (!isSignedIn && alphaResponse?.guestRemaining === 0) {
          setTimeout(() => {
            openSignIn();
          }, 800);
        }

        if (isSignedIn) {
          setHistoryTrigger((prev) => prev + 1);
        }
      },
      onError: (errorData, status) => {
        if (coldStartTimerRef.current) clearTimeout(coldStartTimerRef.current);
        setLoading(false);
        setIsSlowColdStart(false);
        setStage("");

        if (errorData?.code === "LOGIN_REQUIRED") {
          openSignIn();
          return;
        }

        if (errorData?.code === "GAP" && errorData.retryAfterSeconds) {
          setCooldown(errorData.retryAfterSeconds);
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
          errorData?.error || "We couldn't reach the verification service. Please try again.";

        setResult({
          response: errorMessage,
          code: errorData?.code,
          query: textToSubmit,
        });
      },
    });
  };

  // Autocomplete suggestion fetcher
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

  // Click outside to dismiss suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.closest(".suggestion-container") === null) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const showChips = !query.trim() && !result && !loading && !isStopped;

  return (
    <div className={`max-w-2xl sm:max-w-3xl mx-auto space-y-6 ${isLanding ? "px-0 py-0" : "px-4 py-8"}`}>
      {/* 1. Header & Top Action Bar */}
      {isLanding ? (
        <div className="text-center max-w-3xl mx-auto space-y-3 pb-2">
          <h1 className="font-serif font-semibold text-3xl sm:text-5xl md:text-6xl text-fg tracking-tight leading-[1.15]">
            {title || "Is it true? Check before you share."}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-fg-muted max-w-xl mx-auto leading-relaxed font-normal">
            {subtitle || "Paste a claim, news headline, or WhatsApp forward. Get a clear verdict, the sources behind it, and how sure we are."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-line">
          <div>
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-fg tracking-tight">
              {title || "Check a claim"}
            </h1>
            <p className="text-sm sm:text-base text-fg-muted mt-1 leading-relaxed">
              {subtitle || "Paste a claim or forward. We'll cross-reference live sources and show the receipts."}
            </p>
          </div>

          <div className="shrink-0 flex items-center">
            {isSignedIn ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setHistorySheetOpen(true)}
                className="gap-2 text-xs sm:text-sm font-medium min-h-[40px] px-3.5"
              >
                <svg className="w-4 h-4 text-fg-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>History</span>
              </Button>
            ) : (
              <button
                type="button"
                onClick={() => openSignIn()}
                className="text-xs text-primary hover:underline font-medium cursor-pointer"
              >
                
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. Input Box */}
      <div className="relative z-10 suggestion-container bg-surface border border-line rounded-2xl p-4 sm:p-5 shadow-xs focus-within:border-fg-muted/40 focus-within:ring-0 focus-within:outline-none">
        <label htmlFor="claim-input" className="sr-only">
          Claim or statement to verify
        </label>
        <textarea
          id="claim-input"
          ref={textareaRef}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={
            isLanding
              ? "e.g. Does drinking hot water cure COVID-19? or paste any forwarded rumor..."
              : "Is it true that...?"
          }
          rows={3}
          maxLength={300}
          className="w-full bg-transparent text-fg outline-none focus:outline-none focus:ring-0 focus-visible:outline-none text-base sm:text-lg placeholder:text-fg-muted/70 caret-primary resize-none leading-relaxed"
          style={{ fontSize: "16px" }}
        />

        {/* Input Footer: shortcut hint, counter & buttons */}
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-line/60 text-xs gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            {isLanding && (
              <span className="text-xs text-fg-muted hidden sm:inline">
                No account needed to try.
              </span>
            )}
            <span className="text-fg-muted hidden sm:inline">
              Ctrl + Enter to check
            </span>
            <div
              className={
                query.length >= 300
                  ? "text-danger font-semibold"
                  : query.length >= 270
                  ? "text-warning font-medium"
                  : "text-fg-muted"
              }
              aria-live="polite"
            >
              {query.length}/300
            </div>
          </div>

          <div className="flex items-center gap-2">
            {loading ? (
              <Button
                variant="danger"
                size="sm"
                onClick={handleStop}
                className="min-h-[40px] px-4 font-semibold text-xs sm:text-sm gap-1.5"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
                <span>Stop</span>
              </Button>
            ) : cooldown > 0 ? (
              <span className="inline-flex items-center px-4 py-2 rounded-xl bg-surface-2 border border-line text-xs font-semibold text-warning min-h-[40px]">
                Wait {cooldown}s
              </span>
            ) : isDailyLimitReached ? (
              <span className="inline-flex items-center px-4 py-2 rounded-xl bg-surface-2 border border-line text-xs font-semibold text-danger min-h-[40px]">
                Daily limit reached
              </span>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSubmit()}
                disabled={!query.trim()}
                className="min-h-[40px] px-5 font-semibold text-xs sm:text-sm gap-2"
              >
                <span>{isLanding ? "Check it" : "Verify"}</span>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Button>
            )}
          </div>
        </div>

        {/* Suggestion Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <SuggestionDropdown
            suggestions={suggestions}
            onSelect={handleSuggestionClick}
            onSelectSuggestion={handleSuggestionClick}
            visible={showSuggestions}
          />
        )}
      </div>

      {/* Quick Sample Chips (When idle) */}
      {showChips && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-fg-muted font-medium mr-1">
            Try one:
          </span>
          {EXAMPLE_CHIPS.map((chipText) => (
            <Chip
              key={chipText}
              onClick={() => handleChipClick(chipText)}
              className="text-xs sm:text-sm"
            >
              {chipText}
            </Chip>
          ))}
        </div>
      )}

      {/* 3. Real-Time Verification Progress (ThoughtLine) */}
      {loading && (
        <div className="p-6 bg-surface border border-line rounded-2xl shadow-xs space-y-3 animate-in fade-in duration-300">
          <ThoughtLine
            working={true}
            steps={steps}
            label="Verifying"
            doneLabel="Verified in"
            glyph="sparkle"
            fontSize={15}
            breathPeriod={1.6}
            breathDepth={0.45}
            settleDuration={300}
            settleBlur={2}
            collapsible
            collapseOnSettle
            showTimer
          />

          {isSlowColdStart && (
            <p className="text-xs text-fg-muted/80 italic pt-2 border-t border-line/60">
              Connecting to verification service. The initial check can take a moment...
            </p>
          )}
        </div>
      )}

      {/* 4. Verdict Card Result */}
      <ResponseCard
        result={result}
        isStopped={isStopped}
        currentQuery={submittedQuery}
        onReverify={handleReverify}
        onCheckAnother={() => {
          setResult(null);
          setIsStopped(false);
          setQuery("");
          setSubmittedQuery("");
          textareaRef.current?.focus();
        }}
      />

      {/* 5. History Slide-Over Drawer */}
      <HistorySheet
        isOpen={historySheetOpen}
        onClose={() => setHistorySheetOpen(false)}
        onSelectHistory={handleSelectHistory}
        refreshTrigger={historyTrigger}
      />
    </div>
  );
}
