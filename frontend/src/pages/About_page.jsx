import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
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
      <div className="max-w-3xl mx-auto space-y-10 sm:space-y-12 text-left">
        {/* Header (Left-aligned) */}
        <header className="space-y-4">
          <h1 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-fg tracking-tight">
            About{" "}
            <Link
              to="/"
              className="hover:underline hover:text-[var(--accent)] transition-colors cursor-pointer"
            >
              Sentinels of Truth
            </Link>
          </h1>
          <p className="text-base sm:text-lg text-fg-muted dark:text-slate-300 leading-relaxed max-w-2xl">
            Check any claim, headline, or forward in seconds. You get a verdict, the sources, and how sure we are.
          </p>
          <div className="pt-1">
            <Button
              variant="primary"
              size="sm"
              to="/"
              className="verify-submit-btn min-h-[42px] px-6 text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Check a claim</span>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Button>
          </div>
        </header>

        {/* Section: Why we built this */}
        <section aria-labelledby="why-we-built-this-heading" className="space-y-3">
          <h2 id="why-we-built-this-heading" className="font-serif font-bold text-2xl sm:text-3xl text-fg">
            Why we built this
          </h2>
          <p className="text-base text-fg-muted dark:text-slate-300 leading-relaxed">
            Rumors spread fast, and checking them takes time. We do the searching so you can see the evidence yourself.
          </p>
        </section>

        {/* Section: How we decide */}
        <section aria-labelledby="how-we-decide-heading" className="space-y-4">
          <h2 id="how-we-decide-heading" className="font-serif font-bold text-2xl sm:text-3xl text-fg">
            How we decide
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <Card className="p-6 border border-line bg-surface rounded-2xl">
              <span className="text-sm sm:text-base font-semibold tracking-wider tabular-nums text-[var(--accent)] mb-1.5 block">
                01
              </span>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-fg mb-2">
                Trusted sources first
              </h3>
              <p className="text-base text-fg-muted dark:text-slate-300 leading-relaxed">
                WHO, NASA, CDC, and established newsrooms. Not opinion blogs or random posts.
              </p>
            </Card>

            <Card className="p-6 border border-line bg-surface rounded-2xl">
              <span className="text-sm sm:text-base font-semibold tracking-wider tabular-nums text-[var(--accent)] mb-1.5 block">
                02
              </span>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-fg mb-2">
                Always linked
              </h3>
              <p className="text-base text-fg-muted dark:text-slate-300 leading-relaxed">
                Every verdict comes with sources you can open.
              </p>
            </Card>

            <Card className="p-6 border border-line bg-surface rounded-2xl">
              <span className="text-sm sm:text-base font-semibold tracking-wider tabular-nums text-[var(--accent)] mb-1.5 block">
                03
              </span>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-fg mb-2">
                Honest doubt
              </h3>
              <p className="text-base text-fg-muted dark:text-slate-300 leading-relaxed">
                If the evidence is unclear, we say Unclear.
              </p>
            </Card>
          </div>
        </section>

        {/* Section: What we can't check */}
        <section aria-labelledby="limits-heading" className="space-y-4">
          <h2 id="limits-heading" className="font-serif font-bold text-2xl sm:text-3xl text-fg">
            What we can&apos;t check
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="px-4 py-3.5 rounded-xl border border-line bg-surface text-base text-fg-muted dark:text-slate-300">
              Opinions and personal beliefs
            </div>
            <div className="px-4 py-3.5 rounded-xl border border-line bg-surface text-base text-fg-muted dark:text-slate-300">
              Private information
            </div>
            <div className="px-4 py-3.5 rounded-xl border border-line bg-surface text-base text-fg-muted dark:text-slate-300">
              Future predictions
            </div>
            <div className="px-4 py-3.5 rounded-xl border border-line bg-surface text-base text-fg-muted dark:text-slate-300">
              News in its first few minutes
            </div>
          </div>
        </section>

        {/* Section: Free to use */}
        <section
          id="usage-limits"
          aria-labelledby="free-to-use-heading"
          className="space-y-4 scroll-mt-20"
        >
          <h2 id="free-to-use-heading" className="font-serif font-bold text-2xl sm:text-3xl text-fg">
            Free to use
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Guest Tier */}
            <Card className="p-6 border border-line bg-surface rounded-2xl flex flex-col justify-between h-full space-y-3">
              <div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-2 text-fg-muted dark:text-slate-300 border border-line inline-block mb-3">
                  Guests
                </span>
                <div className="text-2xl sm:text-3xl font-bold font-serif text-fg">
                  2 checks <span className="text-sm font-sans font-normal text-fg-muted dark:text-slate-400">/ day</span>
                </div>
              </div>
            </Card>

            {/* Signed-in Users Tier (Highlighted border using accent) */}
            <Card className="p-6 border border-[var(--accent)]/60 bg-surface rounded-2xl flex flex-col justify-between h-full space-y-3">
              <div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30 inline-block mb-3">
                  Signed-in users
                </span>
                <div className="text-2xl sm:text-3xl font-bold font-serif text-fg">
                  20 checks <span className="text-sm font-sans font-normal text-fg-muted dark:text-slate-400">/ day</span>
                </div>
                <p className="text-base text-fg-muted dark:text-slate-300 mt-2">
                  With saved history
                </p>
              </div>
            </Card>
          </div>

          <p className="text-base text-fg-muted dark:text-slate-300 pt-1">
            Rate limit applied: 20-second gap between checks
          </p>
        </section>

        {/* Section: Open source */}
        <section aria-labelledby="open-source-heading" className="space-y-3">
          <h2 id="open-source-heading" className="font-serif font-bold text-2xl sm:text-3xl text-fg">
            Open source
          </h2>
          <p className="text-base text-fg-muted dark:text-slate-300 leading-relaxed">
            Built independently, with no ads.{" "}
            <a
              href="https://github.com/Brijesh667/Sentinels_of_Truth"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline font-medium"
            >
              View on GitHub
            </a>
          </p>
        </section>

        {/* Single subtle divider only before the final disclaimer line */}
        <div className="pt-8 border-t border-line">
          <p className="text-base text-fg-muted dark:text-slate-400 italic leading-relaxed">
            Sentinels gives evidence, not final truth. Always open the sources for important decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
