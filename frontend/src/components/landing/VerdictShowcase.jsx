import { useState, useEffect, useRef } from "react";
import landingFixtures from "../../data/landingFixtures";
import ResponseCard from "../ResponseCard";
import ThoughtLine from "../reactbits/ThoughtLine";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

const STAGES = [
  { stage: "checking_cache", steps: ["Checking the verified database"] },
  {
    stage: "searching",
    steps: [
      "Checking the verified database",
      "Searching the web for evidence",
    ],
  },
  {
    stage: "analyzing",
    steps: [
      "Checking the verified database",
      "Searching the web for evidence",
      "Weighing the evidence",
    ],
  },
];

export default function VerdictShowcase() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [hasTriggeredOnce, setHasTriggeredOnce] = useState(false);

  const containerRef = useRef(null);
  const tabListRef = useRef(null);
  const timerRef = useRef(null);

  const activeFixture = landingFixtures[selectedIdx];

  const runAnimation = (isShort = false) => {
    const prefersReduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    )?.matches;

    if (prefersReduced) {
      setIsPlaying(false);
      setShowResult(true);
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setIsPlaying(true);
    setShowResult(false);
    setStageIndex(0);

    const stepInterval = isShort ? 450 : 900;

    // Stage 1 -> 2
    timerRef.current = setTimeout(() => {
      setStageIndex(1);

      // Stage 2 -> 3
      timerRef.current = setTimeout(() => {
        setStageIndex(2);

        // Stage 3 -> Settle and reveal card
        timerRef.current = setTimeout(() => {
          setIsPlaying(false);
          setShowResult(true);
        }, stepInterval);
      }, stepInterval);
    }, stepInterval);
  };

  // IntersectionObserver to auto-play once when scrolled into view
  useEffect(() => {
    const el = containerRef.current;
    if (!el || hasTriggeredOnce) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setHasTriggeredOnce(true);
          runAnimation(false);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasTriggeredOnce]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleSelectTab = (idx) => {
    if (idx === selectedIdx && (isPlaying || showResult)) return;
    setSelectedIdx(idx);
    runAnimation(true);
  };

  // Keyboard navigation for accessible tablist
  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIdx = (selectedIdx + 1) % landingFixtures.length;
      handleSelectTab(nextIdx);
      const tabs = tabListRef.current?.querySelectorAll('[role="tab"]');
      tabs?.[nextIdx]?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIdx =
        (selectedIdx - 1 + landingFixtures.length) % landingFixtures.length;
      handleSelectTab(prevIdx);
      const tabs = tabListRef.current?.querySelectorAll('[role="tab"]');
      tabs?.[prevIdx]?.focus();
    }
  };

  return (
    <div ref={containerRef} className="w-full">
      {/* Top row: Section heading, badge, replay button */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <h2
              id="verdict-showcase-heading"
              className="text-2xl sm:text-3xl font-bold text-fg font-display tracking-tight"
            >
              See what a verdict looks like
            </h2>
            <Badge variant="neutral" size="sm">
              Example result (not a live check)
            </Badge>
          </div>
          <p className="text-sm text-fg-muted max-w-xl">
            Every check produces a transparent verdict card with evidence, confidence, and source links.
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => runAnimation(false)}
          disabled={isPlaying}
          className="self-start sm:self-auto text-xs min-h-[36px] gap-1.5"
        >
          <svg
            className={`w-3.5 h-3.5 ${isPlaying ? "animate-spin" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
          <span>Replay check</span>
        </Button>
      </div>

      {/* Tabs */}
      <div
        ref={tabListRef}
        role="tablist"
        aria-label="Example verification verdicts"
        onKeyDown={handleKeyDown}
        className="flex items-center gap-2 p-1 bg-surface-2 border border-line rounded-xl mb-6 overflow-x-auto max-w-full"
      >
        {landingFixtures.map((fixture, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <button
              key={fixture.id}
              role="tab"
              id={`tab-${fixture.id}`}
              aria-selected={isSelected}
              aria-controls={`tabpanel-${fixture.id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => handleSelectTab(idx)}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer whitespace-nowrap min-h-[38px] flex items-center justify-center ${
                isSelected
                  ? "bg-surface text-fg shadow-xs border border-line font-semibold"
                  : "text-fg-muted hover:text-fg hover:bg-surface/50"
              }`}
            >
              {fixture.tabLabel}
            </button>
          );
        })}
      </div>

      {/* Showcase Stage Card / Container */}
      <div
        id={`tabpanel-${activeFixture.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeFixture.id}`}
        className="min-h-[380px]"
      >
        {isPlaying ? (
          <div
            className="p-8 sm:p-12 bg-surface border border-line rounded-2xl shadow-xs transition-all flex flex-col justify-center min-h-[360px]"
            aria-live="polite"
          >
            <div className="mb-4">
              <span className="text-xs font-semibold text-fg-muted uppercase tracking-wider block mb-1">
                Checking claim
              </span>
              <p className="text-base sm:text-lg font-medium text-fg">
                &ldquo;{activeFixture.query}&rdquo;
              </p>
            </div>

            <div className="pt-4 border-t border-line">
              <ThoughtLine
                working={true}
                steps={STAGES[stageIndex].steps}
                label="Thinking"
                doneLabel="Thought for"
                glyph="sparkle"
                fontSize={16}
                breathPeriod={1.6}
                breathDepth={0.45}
                settleDuration={300}
                settleBlur={2}
                collapsible
                collapseOnSettle
                showTimer
              />
            </div>
          </div>
        ) : showResult ? (
          <div className="animate-in fade-in duration-500">
            <ResponseCard
              result={activeFixture.result}
              currentQuery={activeFixture.query}
              onCheckAnother={() => runAnimation(false)}
            />
          </div>
        ) : (
          <div className="p-8 bg-surface border border-line rounded-2xl min-h-[360px] flex items-center justify-center text-fg-muted text-sm italic">
            Preparing verification example...
          </div>
        )}
      </div>
    </div>
  );
}
