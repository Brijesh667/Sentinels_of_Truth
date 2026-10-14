import { Link } from "react-router-dom";
import usePageTitle from "../utils/usePageTitle";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import siteConfig from "../config/site";

export default function AboutPage() {
  usePageTitle("About — Sentinels of Truth");

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
            <Button variant="primary" size="sm" to="/app" className="min-h-[40px] px-6 font-semibold">
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

        {/* Section 4: Creator Note */}
        <section aria-labelledby="creator-heading" className="pt-6 border-t border-line space-y-3">
          <h2 id="creator-heading" className="font-serif font-bold text-xl text-fg">
            Creator note
          </h2>
          <p className="text-xs sm:text-sm text-fg-muted leading-relaxed">
            Sentinels of Truth is built and maintained by{" "}
            <span className="font-medium text-fg">{siteConfig.author}</span>. The goal is to provide a public utility for thoughtful media literacy without advertisements, corporate spin, or sensationalism.
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