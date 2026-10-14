import QueryForm from "../components/QueryForm";
import usePageTitle from "../utils/usePageTitle";

export default function Home_page() {
  usePageTitle("Check a claim — Sentinels of Truth");

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Subtle background radial gradient decoration using primary color */}
      <div
        className="pointer-events-none absolute -top-10 left-12 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-primary/6 blur-3xl -z-10"
        aria-hidden="true"
      />
      <QueryForm />
    </div>
  );
}