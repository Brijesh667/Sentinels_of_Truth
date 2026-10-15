import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import usePageTitle from "../utils/usePageTitle";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import siteConfig from "../config/site";

export default function AboutPage() {
  usePageTitle("About — Sentinels of Truth");
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace("#", "");
      const el = document.getElementById(targetId);
      if (el) {
        // slight delay to allow layout to settle
        const timeout = setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
        return () => clearTimeout(timeout);
      }
    }
  }, [location.hash]);

  return (
    <div className="w-full bg-bg text-fg py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-12 sm:space-y-16">
        {/* Header */}
        <header className="text-center space-y-3 pb-8 border-b border-line">
          <h1 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-fg tracking-tight">
            About Sentinels of Truth
          </h1>
          <p className="text-base sm:text-lg text-fg-muted max-w-xl mx-auto leading-relaxed">
            Public evidence-backed verification for doubtful claims, rumors, and forwards.
          </p>
          <div className="pt-2">
            <Button variant="primary" size="sm" to="/" className="min-h-[40px] px-6 font-semibold">
              Check a claim
            </Button>
          </div>
        </header>

        {/* Section 1: Why this exists */}
        <section aria-labelledby="why-exists-heading" className="space-y-4">
          <h2 id="why-exists-heading" className="font-serif font-bold text-2xl text-fg">
            Why this exists
          </h2>
          <div className="text-fg-muted text-sm sm:text-base leading-relaxed space-y-3">
            <p>
              Rumors, edited screenshots, and out-of-context headlines spread fast on messaging apps and social platforms. Finding out whether a claim is real usually takes tedious searching across multiple archives, fact-checking desks, and primary documents—time that most people simply don&apos;t have in their daily lives.
            </p>
            <p>
              Sentinels of Truth does that research legwork in seconds. When you paste a claim, we gather corroborating evidence from reputable institutions, weigh the findings, and present an honest verdict with direct links so you can inspect the sources yourself.
            </p>
          </div>
        </section>

        {/* Section 2: Our editorial standards */}
        <section aria-labelledby="standards-heading" className="space-y-4">
          <h2 id="standards-heading" className="font-serif font-bold text-2xl text-fg">
            Our editorial standards
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <Card className="p-5 border border-line bg-surface rounded-2xl space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="font-semibold text-base text-fg">
                  Reputable sources first
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-fg-muted leading-relaxed pl-8.5">
                We prioritize established scientific bodies (WHO, NASA, CDC), national statistical bureaus, public encyclopedias, and established newsrooms. Opinion blogs, unverified social posts, and uncorroborated commentary are disregarded.
              </p>
            </Card>

            <Card className="p-5 border border-line bg-surface rounded-2xl space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className="font-semibold text-base text-fg">
                  Total source transparency
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-fg-muted leading-relaxed pl-8.5">
                We never produce a verdict without linking the primary reporting or documentation behind it. You should never take our word for it—every claim breakdown gives you direct links to open and read.
              </p>
            </Card>

            <Card className="p-5 border border-line bg-surface rounded-2xl space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <h3 className="font-semibold text-base text-fg">
                  Honest doubt
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-fg-muted leading-relaxed pl-8.5">
                If the evidence is contradictory, disputed, or insufficient, we explicitly label the verdict as Unclear and report a lower confidence score. We do not invent consensus where none exists.
              </p>
            </Card>
          </div>
        </section>

        {/* Section 3: What we cannot verify */}
        <section aria-labelledby="limits-heading" className="space-y-4">
          <h2 id="limits-heading" className="font-serif font-bold text-2xl text-fg">
            What we cannot verify
          </h2>
          <Card className="p-5 sm:p-6 border border-line bg-surface-2/40 rounded-2xl space-y-3">
            <p className="text-xs sm:text-sm text-fg-muted leading-relaxed">
              To remain trustworthy, we are upfront about what this service is not designed to evaluate:
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-fg-muted list-disc list-inside leading-relaxed">
              <li><strong className="text-fg">Subjective opinions and personal beliefs</strong> (e.g. aesthetic taste, religious convictions, philosophical debates).</li>
              <li><strong className="text-fg">Personal private data</strong> (e.g. confidential correspondence, private individuals not in the public sphere).</li>
              <li><strong className="text-fg">Predictions about future events</strong> (e.g. stock market movements, election outcomes before they occur).</li>
              <li><strong className="text-fg">Breaking news in its first minutes</strong> before reliable reporting and corroborating sources are published.</li>
            </ul>
          </Card>
        </section>

        {/* Section 4: Usage Limits & Fair Use Policy */}
        <section
          id="usage-limits"
          aria-labelledby="rate-limits-heading"
          className="space-y-4 scroll-mt-20"
        >
          <div className="space-y-1">
            <h2 id="rate-limits-heading" className="font-serif font-bold text-2xl text-fg">
              Usage Limits & Rate Limiting
            </h2>
            <p className="text-xs sm:text-sm text-fg-muted">
              Deep, multi-source fact-checking requires intensive AI synthesis and live web retrieval. To keep the service fast, reliable, and free from automated spam, we enforce fair usage limits:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Guest Tier */}
            <Card className="p-5 sm:p-6 border border-line bg-surface rounded-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-2 text-fg-muted border border-line">
                    Guest Users
                  </span>
                  <span className="text-xs text-fg-muted font-mono">Without login</span>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold font-serif text-fg">
                    2 checks <span className="text-xs sm:text-sm font-sans font-normal text-fg-muted">/ day</span>
                  </div>
                  <p className="text-xs text-fg-muted mt-1">
                    Free instant access without creating an account (tracked per IP address).
                  </p>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-fg-muted pt-2 border-t border-line/60">
                  <li className="flex items-center gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span>2 full evidence-backed verifications daily</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span>Live search suggestions while typing</span>
                  </li>
                  <li className="flex items-center gap-2 text-fg-muted/70">
                    <span className="text-fg-muted/50">✕</span>
                    <span>Search history is not saved</span>
                  </li>
                  <li className="flex items-center gap-2 text-fg-muted/70">
                    <span className="text-fg-muted/50">✕</span>
                    <span>Login required after 2 free checks</span>
                  </li>
                </ul>
              </div>
              <div className="pt-2">
                <p className="text-[11px] text-fg-muted bg-surface-2/60 p-2.5 rounded-xl border border-line/50">
                  ⚡ <strong>Cooldown:</strong> 20s gap between queries to prevent rapid requests.
                </p>
              </div>
            </Card>

            {/* Registered User Tier */}
            <Card className="p-5 sm:p-6 border border-primary/40 bg-primary/5 rounded-2xl flex flex-col justify-between space-y-4 relative overflow-hidden">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/25">
                    Logged-in Users
                  </span>
                  <span className="text-xs text-primary font-medium">Free Account</span>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold font-serif text-fg">
                    20 checks <span className="text-xs sm:text-sm font-sans font-normal text-fg-muted">/ day</span>
                  </div>
                  <p className="text-xs text-fg-muted mt-1">
                    Full personal access and history tracking for signed-in members.
                  </p>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-fg-muted pt-2 border-t border-primary/15">
                  <li className="flex items-center gap-2 text-fg">
                    <span className="text-primary font-bold">✓</span>
                    <span>20 comprehensive verifications per 24 hours</span>
                  </li>
                  <li className="flex items-center gap-2 text-fg">
                    <span className="text-primary font-bold">✓</span>
                    <span>Persistent search & verification history</span>
                  </li>
                  <li className="flex items-center gap-2 text-fg">
                    <span className="text-primary font-bold">✓</span>
                    <span>One-click history review and deletion</span>
                  </li>
                  <li className="flex items-center gap-2 text-fg">
                    <span className="text-primary font-bold">✓</span>
                    <span>Daily quota automatically resets every 24 hours</span>
                  </li>
                </ul>
              </div>
              <div className="pt-2">
                <p className="text-[11px] text-fg-muted bg-surface/70 p-2.5 rounded-xl border border-primary/20">
                  ⚡ <strong>Cooldown:</strong> 20s gap between queries to prevent rapid requests.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Section 5: Creator Note */}
        <section aria-labelledby="creator-heading" className="pt-6 border-t border-line space-y-3">
          <h2 id="creator-heading" className="font-serif font-bold text-xl text-fg">
            Creator note
          </h2>
          <p className="text-xs sm:text-sm text-fg-muted leading-relaxed">
            Sentinels of Truth is built and maintained as an independent open-source project. The goal is to provide a public utility for thoughtful media literacy without advertisements, corporate spin, or sensationalism.
          </p>
          {siteConfig.github && (
            <p className="text-xs text-fg-muted">
              For technical architecture, source code, and inspection, visit the{" "}
              <a
                href={siteConfig.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                GitHub repository
              </a>
              .
            </p>
          )}
        </section>
      </div>
    </div>
  );
}