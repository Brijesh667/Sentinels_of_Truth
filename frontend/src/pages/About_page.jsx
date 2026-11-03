import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import usePageTitle from "../utils/usePageTitle";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function AboutPage() {
  usePageTitle("About — Sentinels of Truth");
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace("#", "");
      const el = document.getElementById(targetId);
      if (el) {
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
            Check any claim, headline, or forward in seconds. You get a verdict, the sources, and how sure we are.
          </p>
          <div className="pt-2">
            <Button variant="primary" size="sm" to="/" className="min-h-[40px] px-6 font-semibold">
              Check a claim
            </Button>
          </div>
        </header>

        {/* Section: Why we built this */}
        <section aria-labelledby="why-we-built-this-heading" className="space-y-4">
          <h2 id="why-we-built-this-heading" className="font-serif font-bold text-2xl text-fg">
            Why we built this
          </h2>
          <p className="text-fg-muted text-sm sm:text-base leading-relaxed">
            Rumors spread fast, and checking them takes time. We do the searching so you can see the evidence yourself.
          </p>
        </section>

        {/* Section: How we decide */}
        <section aria-labelledby="how-we-decide-heading" className="space-y-4">
          <h2 id="how-we-decide-heading" className="font-serif font-bold text-2xl text-fg">
            How we decide
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <Card className="p-5 border border-line bg-surface rounded-2xl space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="font-semibold text-base text-fg">
                  Trusted sources first
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-fg-muted leading-relaxed pl-8.5">
                WHO, NASA, CDC, and established newsrooms. Not opinion blogs or random posts.
              </p>
            </Card>

            <Card className="p-5 border border-line bg-surface rounded-2xl space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className="font-semibold text-base text-fg">
                  Always linked
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-fg-muted leading-relaxed pl-8.5">
                Every verdict comes with sources you can open.
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
                If the evidence is unclear, we say Unclear.
              </p>
            </Card>
          </div>
        </section>

        {/* Section: What we can't check */}
        <section aria-labelledby="limits-heading" className="space-y-4">
          <h2 id="limits-heading" className="font-serif font-bold text-2xl text-fg">
            What we can&apos;t check
          </h2>
          <Card className="p-5 sm:p-6 border border-line bg-surface-2/40 rounded-2xl">
            <ul className="space-y-2 text-xs sm:text-sm text-fg-muted list-disc list-inside leading-relaxed">
              <li>Opinions and personal beliefs</li>
              <li>Private information</li>
              <li>Future predictions</li>
              <li>News in its first few minutes</li>
            </ul>
          </Card>
        </section>

        {/* Section: Free to use */}
        <section
          id="usage-limits"
          aria-labelledby="free-to-use-heading"
          className="space-y-4 scroll-mt-20"
        >
          <h2 id="free-to-use-heading" className="font-serif font-bold text-2xl text-fg">
            Free to use
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Guest Tier */}
            <Card className="p-5 sm:p-6 border border-line bg-surface rounded-2xl space-y-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-2 text-fg-muted border border-line inline-block">
                Guests
              </span>
              <div className="text-2xl sm:text-3xl font-bold font-serif text-fg">
                2 checks <span className="text-xs sm:text-sm font-sans font-normal text-fg-muted">/ day</span>
              </div>
            </Card>

            {/* Signed-in Users Tier */}
            <Card className="p-5 sm:p-6 border border-primary/40 bg-primary/5 rounded-2xl space-y-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/25 inline-block">
                Signed-in users
              </span>
              <div className="text-2xl sm:text-3xl font-bold font-serif text-fg">
                20 checks <span className="text-xs sm:text-sm font-sans font-normal text-fg-muted">/ day</span>
              </div>
              <p className="text-xs sm:text-sm text-fg-muted">
                With saved history
              </p>
            </Card>
          </div>

          <p className="text-xs sm:text-sm text-fg-muted">
            Rate limit applied: 20-second gap between checks
          </p>
        </section>

        {/* Section: Open source */}
        <section aria-labelledby="open-source-heading" className="pt-6 border-t border-line space-y-3">
          <h2 id="open-source-heading" className="font-serif font-bold text-xl text-fg">
            Open source
          </h2>
          <p className="text-xs sm:text-sm text-fg-muted leading-relaxed">
            Built independently, with no ads.{" "}
            <a
              href="https://github.com/Brijesh667/Sentinels_of_Truth"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              View on GitHub
            </a>
          </p>
        </section>

        {/* Footer line */}
        <div className="pt-6 border-t border-line text-center">
          <p className="text-xs text-fg-muted italic leading-relaxed">
            Sentinels gives evidence, not final truth. Always open the sources for important decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
