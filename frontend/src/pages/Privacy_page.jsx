import usePageTitle from "../utils/usePageTitle";

export default function PrivacyPage() {
  usePageTitle("Privacy Policy — Sentinels of Truth");

  return (
    <div className="w-full bg-bg text-fg py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-10 sm:space-y-12">
        {/* Header */}
        <header className="text-center pb-8 border-b border-line">
          <h1 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-fg tracking-tight">
            Privacy Policy
          </h1>
        </header>

        <div className="space-y-8 text-sm sm:text-base leading-relaxed text-fg-muted">
          {/* Section: No ads, no selling data */}
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-xl text-fg">
              No ads, no selling data
            </h2>
            <p>
              We don&apos;t show ads, sell your data, or track you across the web.
            </p>
          </section>

          {/* Section: Your history is private */}
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-xl text-fg">
              Your history is private
            </h2>
            <p>
              If you sign in, your check history is visible only to you. You can delete it anytime.
            </p>
          </section>

          {/* Section: What we save */}
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-xl text-fg">
              What we save
            </h2>
            <p>
              Claims you check may be saved without your name or email, so repeat questions get faster answers. Don&apos;t paste personal information into a claim.
            </p>
          </section>

          {/* Section: Daily limits */}
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-xl text-fg">
              Daily limits
            </h2>
            <p>
              We use your IP address only to enforce daily check limits.
            </p>
          </section>

          {/* Section: Sign-in */}
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-xl text-fg">
              Sign-in
            </h2>
            <p>
              Sign-in is handled by Clerk. We never see or store your password.
            </p>
          </section>

          {/* Section: Contact */}
          <section className="pt-6 border-t border-line space-y-2">
            <h2 className="font-serif font-bold text-lg text-fg">
              Contact
            </h2>
            <p className="text-xs sm:text-sm">
              For questions or data deletion, open an issue on{" "}
              <a
                href="https://github.com/Brijesh667/Sentinels_of_Truth/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                GitHub
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
