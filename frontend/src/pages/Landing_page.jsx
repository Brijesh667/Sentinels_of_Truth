import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import usePageTitle from "../utils/usePageTitle";
import QueryForm from "../components/QueryForm";
import Card from "../components/ui/Card";

const HOW_IT_WORKS_STEPS = [
  {
    title: "Paste it",
    desc: "Drop in any claim, headline, or forwarded message.",
  },
  {
    title: "We check it",
    desc: "We search trusted sources and compare the evidence.",
  },
  {
    title: "Get the verdict",
    desc: "See True, False, or Misleading, with a confidence score and source links.",
  },
];

export default function LandingPage() {
  usePageTitle("Sentinels of Truth — Check before you share");
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo === "how-it-works") {
      window.history.replaceState(null, "", "/how-it-works");
      setTimeout(() => {
        const el = document.getElementById("how-it-works");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [location.state]);

  return (
    <div className="w-full bg-bg text-fg transition-colors">
      {/* 1. HERO SECTION: Full-featured Verifier as the Hero */}
      <section
        aria-label="Hero"
        className="pt-10 sm:pt-14 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8"
      >
        <QueryForm isLanding={true} />
      </section>

      {/* 2. HOW IT WORKS */}
      <section
        id="how-it-works"
        aria-labelledby="how-it-works-heading"
        className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto scroll-mt-20"
      >
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2
            id="how-it-works-heading"
            className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-fg tracking-tight"
          >
            How it works
          </h2>
          <p className="text-sm sm:text-base text-fg-muted mt-2">
            From rumor to verdict in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <Card
              key={step.title}
              className="p-6 sm:p-7 border border-line bg-surface rounded-2xl flex flex-col justify-between"
            >
              <div>
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

      {/* 3. WHY TRUST SENTINELS */}
      <section
        aria-labelledby="why-trust-heading"
        className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto"
      >
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2
            id="why-trust-heading"
            className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-fg tracking-tight"
          >
            Why trust Sentinels
          </h2>
          <p className="text-sm sm:text-base text-fg-muted mt-2">
            No black boxes. Just evidence you can check.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="p-5 text-center sm:text-left">
            <h3 className="font-semibold text-sm text-fg mb-1">
              Every verdict has sources
            </h3>
            <p className="text-xs text-fg-muted leading-relaxed">
              We link original sources so you can read them yourself.
            </p>
          </Card>

          <Card className="p-5 text-center sm:text-left">
            <h3 className="font-semibold text-sm text-fg mb-1">
              We show our confidence
            </h3>
            <p className="text-xs text-fg-muted leading-relaxed">
              Not every claim is black and white, so we tell you how sure we are.
            </p>
          </Card>

          <Card className="p-5 text-center sm:text-left">
            <h3 className="font-semibold text-sm text-fg mb-1">
              We admit when it&apos;s unclear
            </h3>
            <p className="text-xs text-fg-muted leading-relaxed">
              If the evidence is disputed, we say so instead of guessing.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
