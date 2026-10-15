import usePageTitle from "../utils/usePageTitle";
import QueryForm from "../components/QueryForm";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import VerdictBadge from "../components/ui/VerdictBadge";
import ConfidenceMeter from "../components/ui/ConfidenceMeter";

const COMMON_FORWARDS = [
  "Is Earth flat?",
  "Do vaccines cause autism?",
  "Is the Great Wall of China visible from space?",
  "Do we use only 10% of our brain?",
  "Does lightning never strike the same place twice?",
  "Do goldfish have a 3-second memory?",
  "Is the Taj Mahal in Agra?",
  "Does drinking hot water prevent viruses?",
];

const HOW_IT_WORKS_STEPS = [
  {
    step: "1",
    title: "Paste it",
    desc: "Paste any statement, breaking headline, or forwarded rumor in plain language.",
  },
  {
    step: "2",
    title: "We gather the evidence",
    desc: "We cross-reference verified archives and search reputable public sources in real time.",
  },
  {
    step: "3",
    title: "Read the receipts",
    desc: "You get the verdict, confidence percentage, explanation, and primary links.",
  },
];

const FAQS = [
  {
    q: "Is it always accurate?",
    a: "No system is 100% infallible. We display the confidence score and direct source links so you can judge the primary reporting for yourself.",
  },
  {
    q: "Is it free to use?",
    a: "Yes. You can verify claims immediately without signing up. Signing in lets you access your check history across devices.",
  },
  {
    q: "Do you store my personal information?",
    a: "No personal names or account info are attached to checks. If you create an account via Clerk, only your private history log is saved for your own viewing.",
  },
  {
    q: "What languages are supported?",
    a: "It works best with English claims. Other languages can be checked against available translated web sources.",
  },
  {
    q: "Can I send the answer back on WhatsApp?",
    a: "Yes, every verdict includes a one-click share link formatted specifically for messaging apps.",
  },
];

export default function LandingPage() {
  usePageTitle("Sentinels of Truth — Check before you share");

  const handleCardClick = (text) => {
    window.dispatchEvent(new CustomEvent("sot:set-claim", { detail: text }));
  };

  return (
    <div className="w-full bg-bg text-fg transition-colors">
      {/* 1. HERO SECTION: Full-featured Verifier as the Hero */}
      <section
        aria-label="Hero"
        className="pt-10 sm:pt-14 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 border-b border-line"
      >
        <QueryForm isLanding={true} />
      </section>

      {/* 2. "WHAT YOU GET" EDITORIAL PROOF SECTION */}
      <section
        aria-labelledby="what-you-get-heading"
        className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-b border-line"
      >
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2
            id="what-you-get-heading"
            className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-fg tracking-tight"
          >
            Not just &ldquo;true&rdquo; or &ldquo;false&rdquo;. The proof, too.
          </h2>
          <p className="text-sm sm:text-base text-fg-muted mt-2">
            Every check gives you a complete, transparent breakdown.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Mock Editorial Verdict Card */}
          <div className="lg:col-span-7">
            <Card className="p-6 sm:p-7 border border-line bg-surface rounded-2xl shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-line flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <Badge variant="neutral" size="sm">
                    Fresh check
                  </Badge>
                  <span className="text-xs text-fg-muted">1.3s</span>
                </div>
                <VerdictBadge status="fake" size="sm" />
              </div>

              {/* Claim Statement */}
              <div>
                <span className="text-xs font-semibold text-fg-muted uppercase tracking-wider block mb-1">
                  Checked claim
                </span>
                <p className="text-base sm:text-lg font-medium text-fg">
                  The Great Wall of China is visible from space with the naked eye
                </p>
              </div>

              {/* Confidence Score Bar */}
              <div className="pt-1">
                <ConfidenceMeter confidence={94} status="fake" />
              </div>

              {/* 2-Sentence Plain Explanation */}
              <div>
                <span className="text-xs font-semibold text-fg-muted uppercase tracking-wider block mb-1">
                  Summary
                </span>
                <p className="text-sm text-fg leading-relaxed">
                  Astronauts and orbital imagery confirm that the Great Wall cannot be distinguished from low Earth orbit with the unaided eye. Because it is only a few meters wide and made of indigenous stone that matches the surrounding terrain, it produces virtually no optical contrast against the landscape.
                </p>
              </div>

              {/* 2 Real Source Links */}
              <div className="pt-1 space-y-2">
                <span className="text-xs font-semibold text-fg-muted uppercase tracking-wider block">
                  Cited sources
                </span>
                <div className="space-y-1.5">
                  <a
                    href="https://www.nasa.gov/vision/space/workinginspace/great_wall.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-surface-2 border border-line hover:border-primary/40 text-xs transition-colors group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-semibold text-fg group-hover:text-primary">
                        NASA
                      </span>
                      <span className="text-fg-muted truncate">
                        nasa.gov/vision/space/workinginspace/great_wall
                      </span>
                    </div>
                    <svg className="w-3.5 h-3.5 text-fg-muted group-hover:text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>

                  <a
                    href="https://www.britannica.com/story/is-the-great-wall-of-china-visible-from-space"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-surface-2 border border-line hover:border-primary/40 text-xs transition-colors group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-semibold text-fg group-hover:text-primary">
                        Encyclopaedia Britannica
                      </span>
                      <span className="text-fg-muted truncate">
                        britannica.com/story/is-the-great-wall-of-china...
                      </span>
                    </div>
                    <svg className="w-3.5 h-3.5 text-fg-muted group-hover:text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: 5 Numbered Editorial Callouts */}
          <div className="lg:col-span-5 space-y-4">
            {[
              {
                num: "1",
                title: "A clear verdict",
                desc: "True, False, or Misleading—no vague corporate jargon or non-answers.",
              },
              {
                num: "2",
                title: "How sure we are",
                desc: "Transparent confidence scoring based on source consensus and evidence depth.",
              },
              {
                num: "3",
                title: "Plain explanation",
                desc: "The factual context summarized in 2 to 3 readable, direct sentences.",
              },
              {
                num: "4",
                title: "Sources you can open",
                desc: "Direct links to reputable institutions, encyclopedias, and verified reporting.",
              },
              {
                num: "5",
                title: "One-tap sharing",
                desc: "Easily copy or forward the breakdown back to the person who sent you the rumor.",
              },
            ].map((item) => (
              <div
                key={item.num}
                className="flex items-start gap-3.5 p-3.5 rounded-xl bg-surface border border-line"
              >
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary font-serif font-bold text-sm flex items-center justify-center shrink-0 border border-primary/20">
                  {item.num}
                </span>
                <div>
                  <h3 className="font-semibold text-sm text-fg">
                    {item.title}
                  </h3>
                  <p className="text-xs text-fg-muted mt-0.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section
        id="how-it-works"
        aria-labelledby="how-it-works-heading"
        className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-b border-line scroll-mt-20"
      >
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2
            id="how-it-works-heading"
            className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-fg tracking-tight"
          >
            Three simple steps to the facts
          </h2>
          <p className="text-sm sm:text-base text-fg-muted mt-2">
            No complex jargon. From rumor to verified receipts in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <Card
              key={step.step}
              className="p-6 sm:p-7 border border-line bg-surface rounded-2xl flex flex-col justify-between"
            >
              <div>
                <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-serif font-bold text-base flex items-center justify-center border border-primary/25 mb-4">
                  {step.step}
                </span>
                <h3 className="font-serif font-bold text-lg text-fg mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-fg-muted leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. COMMON FORWARDS GRID ("Not sure where to start?") */}
      <section
        aria-labelledby="common-forwards-heading"
        className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-b border-line"
      >
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <h2
            id="common-forwards-heading"
            className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-fg tracking-tight"
          >
            Not sure where to start?
          </h2>
          <p className="text-sm sm:text-base text-fg-muted mt-2">
            Click any common rumor below to inspect it in the verifier.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COMMON_FORWARDS.map((claimText, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleCardClick(claimText)}
              className="p-4 sm:p-5 rounded-2xl bg-surface border border-line text-left hover:border-primary/50 hover:bg-surface-2 transition-all cursor-pointer group flex flex-col justify-between min-h-[110px]"
            >
              <p className="text-sm font-medium text-fg group-hover:text-primary transition-colors leading-snug">
                &ldquo;{claimText}&rdquo;
              </p>
              <div className="flex items-center gap-1.5 text-xs text-primary font-medium mt-3">
                <span>Check claim</span>
                <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 5. TRANSPARENCY & LIMITATIONS ("We show our work") */}
      <section
        aria-labelledby="transparency-heading"
        className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-b border-line"
      >
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2
            id="transparency-heading"
            className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-fg tracking-tight"
          >
            We show our work
          </h2>
          <p className="text-sm sm:text-base text-fg-muted mt-2">
            Honest, accountable fact-checking with zero black boxes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="p-5 rounded-2xl bg-surface border border-line text-center sm:text-left">
            <div className="w-8 h-8 rounded-lg bg-success-soft text-success flex items-center justify-center mb-3 mx-auto sm:mx-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-semibold text-sm text-fg mb-1">
              Primary citations
            </h3>
            <p className="text-xs text-fg-muted leading-relaxed">
              We link primary sources for every check so you can read the documents directly.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-line text-center sm:text-left">
            <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center mb-3 mx-auto sm:mx-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-sm text-fg mb-1">
              Clear confidence
            </h3>
            <p className="text-xs text-fg-muted leading-relaxed">
              We state our confidence percentage clearly instead of pretending every query is simple.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-line text-center sm:text-left">
            <div className="w-8 h-8 rounded-lg bg-warning-soft text-warning flex items-center justify-center mb-3 mx-auto sm:mx-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-semibold text-sm text-fg mb-1">
              Disputed claims
            </h3>
            <p className="text-xs text-fg-muted leading-relaxed">
              We say so when the evidence is disputed or unclear, never inventing consensus.
            </p>
          </div>
        </div>

        {/* Honest footnote */}
        <div className="p-4 rounded-xl bg-surface-2 border border-line text-center max-w-2xl mx-auto">
          <p className="text-xs text-fg-muted italic leading-relaxed">
            AI can make mistakes. For medical, legal, or high-stakes decisions, always open the cited sources and read primary documentation.
          </p>
        </div>
      </section>

      {/* 6. PLAIN LANGUAGE FAQ (Native <details> Accordion) */}
      <section
        aria-labelledby="faq-heading"
        className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-b border-line"
      >
        <div className="text-center mb-12">
          <h2
            id="faq-heading"
            className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-fg tracking-tight"
          >
            Frequently asked questions
          </h2>
          <p className="text-sm sm:text-base text-fg-muted mt-2">
            Common questions about accuracy, privacy, and how checks work.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <details
              key={idx}
              className="group bg-surface border border-line rounded-2xl p-4 sm:p-5 transition-colors open:bg-surface-2/40"
            >
              <summary className="flex items-center justify-between font-semibold text-sm sm:text-base text-fg cursor-pointer list-none select-none">
                <span>{faq.q}</span>
                <span className="text-fg-muted group-open:rotate-180 transition-transform ml-4 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <p className="text-xs sm:text-sm text-fg-muted mt-3 pt-3 border-t border-line/60 leading-relaxed">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
