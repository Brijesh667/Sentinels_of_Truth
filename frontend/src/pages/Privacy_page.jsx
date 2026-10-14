import { Link } from "react-router-dom";
import usePageTitle from "../utils/usePageTitle";
import Card from "../components/ui/Card";

export default function PrivacyPage() {
  usePageTitle("Privacy — Sentinels of Truth");

  return (
    <div className="w-full bg-bg text-fg py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-10 sm:space-y-12">
        {/* Header */}
        <header className="text-center space-y-3 pb-8 border-b border-line">
          <h1 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-fg tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-base sm:text-lg text-fg-muted max-w-xl mx-auto leading-relaxed">
            Plain language privacy commitments. No legal jargon or hidden trackers.
          </p>
        </header>

        <div className="space-y-8 text-sm sm:text-base leading-relaxed text-fg-muted">
          {/* Commitment 1: No tracking or ads */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-xl text-fg">
              1. No ad networks or behavioral tracking
            </h2>
            <p>
              Sentinels of Truth is built as a clean public utility. We do not use third-party advertising pixels, tracking cookies, data broker integrations, or behavioral profiling tools. Your browsing patterns and queries are never sold or shared with marketers.
            </p>
          </section>

          {/* Commitment 2: Private history */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-xl text-fg">
              2. Your check history belongs to you
            </h2>
            <p>
              If you choose to sign in, your verification history is tied strictly to your private account identifier. It is visible only to you when logged in. You can remove individual check entries or delete your entire verification history at any time with a single click.
            </p>
          </section>

          {/* Commitment 3: Anonymous public checks */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-xl text-fg">
              3. Anonymous public knowledge cache
            </h2>
            <p>
              To answer repeat questions instantly and save server resources, factual claim texts (such as &ldquo;Is the earth flat?&rdquo;) and their public source evidence are retained in an anonymous knowledge database. No usernames, email addresses, IP addresses, or personal accounts are ever linked to these cached checks.
            </p>
          </section>

          {/* Commitment 4: Secure authentication */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-xl text-fg">
              4. Authentication handled securely by Clerk
            </h2>
            <p>
              Account sign-in, Google authorization, and session security are managed by Clerk, an enterprise-grade identity platform. Sentinels of Truth never receives or stores your raw passwords or OAuth secrets.
            </p>
          </section>

          {/* Contact & updates */}
          <section className="pt-6 border-t border-line space-y-2">
            <h2 className="font-serif font-bold text-lg text-fg">
              Questions or requests?
            </h2>
            <p className="text-xs sm:text-sm">
              If you have any questions about this privacy notice or wish to request complete data deletion, reach out through our{" "}
              <Link to="/about" className="text-primary hover:underline font-medium">
                About page
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
