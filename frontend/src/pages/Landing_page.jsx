import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../theme/ThemeProvider";
import MaskedHeading from "../components/reactbits/MaskedHeading";
import SpotlightCard from "../components/reactbits/SpotlightCard";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Reveal from "../components/ui/Reveal";
import usePageTitle from "../utils/usePageTitle";

// Lazy-load heavier below-the-fold component so the hero paints immediately
const VerdictShowcase = lazy(() =>
  import("../components/landing/VerdictShowcase")
);



const STEPS = [
  {
    num: "01",
    title: "You ask",
    desc: "Paste any claim, breaking news statement, or forwarded rumor in plain language.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.502 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.002z"
      />
    ),
  },
  {
    num: "02",
    title: "Check verified knowledge",
    desc: "If someone verified the same claim before, you get that answer instantly from the database.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
      />
    ),
  },
  {
    num: "03",
    title: "Search & weigh evidence",
    desc: "Live web search gathers sources, then AI evaluates evidence and calculates confidence.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v17.25m0 0l-4.5-4.5M12 20.25l4.5-4.5M4.5 7.5L12 3l7.5 4.5"
      />
    ),
  },
  {
    num: "04",
    title: "Remember & save history",
    desc: "Verified claims are stored to answer future queries instantly, and saved to your personal history.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    ),
  },
];

const FEATURES = [
  {
    title: "Instant answers for repeat claims",
    desc: "Repeated checks bypass web search and serve within milliseconds from our verified database.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
      />
    ),
  },
  {
    title: "Sources you can open",
    desc: "Every verdict links directly to live, primary sources with complete transparency.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
      />
    ),
  },
  {
    title: "Live progress and a Stop button",
    desc: "Watch verification stages live and abort requests anytime without waiting.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z"
      />
    ),
  },
  {
    title: "Contradiction and duplicate checks",
    desc: "Incoming claims are checked against existing knowledge to catch contradictions and duplicates.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v17.25m0 0l-4.5-4.5M12 20.25l4.5-4.5M4.5 7.5L12 3l7.5 4.5"
      />
    ),
  },
  {
    title: "Human review for uncertain cases",
    desc: "Ambiguous or contested claims are flagged for secondary inspection rather than guessing.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    ),
  },
  {
    title: "Your history, saved",
    desc: "Signed-in members automatically retain private check logs across devices and sessions.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
];

const TECH_BADGES = [
  "React",
  "Node/Express",
  "Gemini",
  "Pinecone",
  "Tavily",
  "MongoDB",
  "Clerk",
];

export default function LandingPage() {
  usePageTitle("Sentinels of Truth — Check a claim");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="w-full bg-bg text-fg transition-colors">
      {/* 1. HERO SECTION */}
      <section
        aria-label="Hero"
        className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 lg:px-8 border-b border-line"
      >
        {/* Subtle radial background decoration */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-primary/6 rounded-full blur-3xl -z-10"
          aria-hidden="true"
        />

        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
          {/* MaskedHeading Headline */}
          <div className="w-full mb-6">
            <MaskedHeading
              tag="h1"
              text={`Sift signal from noise.\nVerify truth with evidence\nin seconds.`}
              src="/hero-mesh.svg"
              align="center"
              weight={800}
              textScale={0.052}
              lineHeight={1.12}
              brightness={isDark ? 1.15 : 0.85}
              saturation={isDark ? 1.25 : 1.45}
              parallax={18}
              drift={14}
              reveal="rise"
              duration={1.0}
              className="font-display tracking-tight text-fg"
              aria-label="Sift signal from noise. Verify truth with evidence in seconds."
            />
          </div>

          {/* Subtext */}
          <p className="text-base sm:text-lg md:text-xl text-fg-muted max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-normal">
            Got a forward that sounds off? Paste it here. We check it against live
            sources, show the evidence, and tell you how sure we are.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md mx-auto mb-10">
            {/* Primary CTA: SpecularButton via Button variant="primary" */}
            <Button
              variant="primary"
              size="lg"
              to="/app"
              className="w-full sm:w-auto min-h-[48px] px-8 text-base font-semibold"
            >
              Verify a claim
            </Button>

            {/* Secondary CTA */}
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-2xl border border-line bg-surface text-fg hover:bg-surface-2 font-medium text-sm sm:text-base transition-colors shadow-xs"
            >
              See how it works
            </a>
          </div>

        </div>
      </section>

      {/* 2. SEE WHAT A VERDICT LOOKS LIKE */}
      <section
        aria-labelledby="verdict-showcase-heading"
        className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-b border-line"
      >
        <Reveal>
          <Suspense
            fallback={
              <div className="w-full h-80 rounded-2xl bg-surface-2/60 animate-pulse border border-line flex items-center justify-center text-xs text-fg-muted">
                Loading verdict showcase...
              </div>
            }
          >
            <VerdictShowcase />
          </Suspense>
        </Reveal>
      </section>

      {/* 3. HOW IT WORKS */}
      <section
        id="how-it-works"
        aria-labelledby="how-it-works-heading"
        className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-b border-line scroll-mt-20"
      >
        <Reveal>
          <div className="text-center mb-12 sm:mb-16">
            <h2
              id="how-it-works-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-fg font-display tracking-tight"
            >
              How it works
            </h2>
            <p className="text-sm sm:text-base text-fg-muted mt-2 max-w-xl mx-auto">
              From an unverified forwarded claim to an evidence-backed answer in four transparent steps.
            </p>
          </div>

          {/* 4 Steps using SpotlightCard effect */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {STEPS.map((step) => (
              <SpotlightCard
                key={step.num}
                theme={isDark ? "dark" : "light"}
                spotlightColor={isDark ? "#38bdf8" : "#2563eb"}
                intensity={isDark ? 0.22 : 0.12}
                spotlightSize={260}
                softness={0.7}
                borderGlow={0.65}
                proximity={90}
                smoothing={0.28}
                flare={true}
                className="flex flex-col justify-between h-full p-6 sm:p-7 border border-line rounded-2xl transition-all"
                style={{
                  "--spotlight-card-surface": "var(--color-surface)",
                  "--spotlight-card-border": "var(--color-line)",
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/25 font-bold font-mono text-sm flex items-center justify-center">
                      {step.num}
                    </span>
                    <span className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center text-primary">
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        {step.icon}
                      </svg>
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-fg font-display mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-fg-muted leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </Reveal>
      </section>

      {/* 4. WHY IT'S DIFFERENT (FEATURE GRID) */}
      <section
        aria-labelledby="why-different-heading"
        className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-b border-line"
      >
        <Reveal>
          <div className="text-center mb-12 sm:mb-16">
            <h2
              id="why-different-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-fg font-display tracking-tight"
            >
              Why it&apos;s different
            </h2>
            <p className="text-sm sm:text-base text-fg-muted mt-2 max-w-xl mx-auto">
              Engineered for fast verification, citation integrity, and long-term accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {FEATURES.map((item, idx) => (
              <Card
                key={idx}
                className="p-5 sm:p-6 hover:-translate-y-1 transition duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </svg>
                </div>
                <h3 className="text-base font-bold text-fg mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-fg-muted leading-relaxed">
                  {item.desc}
                </p>
              </Card>
            ))}
          </div>
        </Reveal>
      </section>

      {/* 5. BUILT WITH */}
      <section
        aria-label="Built with"
        className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center"
      >
        <Reveal>
          <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-4">
            Built with
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {TECH_BADGES.map((badge, idx) => (
              <Badge
                key={idx}
                variant="neutral"
                size="md"
                className="px-3 py-1 font-medium text-xs text-fg-muted hover:text-fg transition-colors"
              >
                {badge}
              </Badge>
            ))}
          </div>
        </Reveal>
      </section>
    </div>
  );
}
