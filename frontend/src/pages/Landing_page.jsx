import { useEffect, useRef } from "react";
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

const WHY_TRUST_POINTS = [
  {
    title: "Every verdict has sources",
    desc: "We link original sources so you can read them yourself.",
  },
  {
    title: "We show our confidence",
    desc: "Not every claim is black and white, so we tell you how sure we are.",
  },
  {
    title: "We admit when it's unclear",
    desc: "If the evidence is disputed, we say so instead of guessing.",
  },
];

export default function LandingPage() {
  usePageTitle("Sentinels of Truth — Check before you share");
  const location = useLocation();
  const howItWorksRef = useRef(null);
  const whyTrustRef = useRef(null);

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );

    if (howItWorksRef.current) observer.observe(howItWorksRef.current);
    if (whyTrustRef.current) observer.observe(whyTrustRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full bg-bg text-fg transition-colors">
      {/* 1. HERO SECTION: Full-featured Verifier as the Hero */}
      <section
        aria-label="Hero"
        className="pt-8 sm:pt-12 pb-10 sm:pb-14 px-4 sm:px-6 lg:px-8"
      >
        <QueryForm isLanding={true} />
      </section>

      {/* 2. HOW IT WORKS */}
      <section
        id="how-it-works"
        ref={howItWorksRef}
        aria-labelledby="how-it-works-heading"
        className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto scroll-mt-20"
      >
        <div className="reveal-header text-center max-w-2xl mx-auto mb-10 sm:mb-12">
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
          {HOW_IT_WORKS_STEPS.map((step, idx) => (
            <Card
              key={step.title}
              style={{ transitionDelay: `${idx * 120}ms` }}
              className="reveal-card min-h-[140px] sm:min-h-[160px] h-full p-6 sm:p-7 border border-line bg-surface rounded-2xl flex flex-col justify-between"
            >
              <div>
                <span className="text-xs sm:text-sm font-semibold tracking-wider tabular-nums text-[var(--accent)] mb-2 block">
                  0{idx + 1}
                </span>
                <h3 className="font-serif font-bold text-lg sm:text-xl text-fg mb-2">
                  {step.title}
                </h3>
                <p className="text-base text-fg-muted/95 dark:text-slate-300 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. WHY TRUST SENTINELS */}
      <section
        ref={whyTrustRef}
        aria-labelledby="why-trust-heading"
        className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto"
      >
        <div className="reveal-header text-center max-w-2xl mx-auto mb-10 sm:mb-12">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {WHY_TRUST_POINTS.map((item, idx) => (
            <Card
              key={item.title}
              style={{ transitionDelay: `${idx * 120}ms` }}
              className="reveal-card min-h-[140px] sm:min-h-[160px] h-full p-6 sm:p-7 border border-line bg-surface rounded-2xl flex flex-col justify-between"
            >
              <div>
                <h3 className="font-serif font-bold text-lg sm:text-xl text-fg mb-2">
                  {item.title}
                </h3>
                <p className="text-base text-fg-muted/95 dark:text-slate-300 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
