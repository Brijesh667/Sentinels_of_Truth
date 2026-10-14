import { Link } from "react-router-dom";
import usePageTitle from "../utils/usePageTitle";

export default function NotFoundPage() {
  usePageTitle("Page not found — Sentinels of Truth");

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-bg text-fg">
      <div className="text-center max-w-md">
        <p className="text-6xl font-extrabold text-primary mb-4 font-display">404</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-fg mb-3">
          Page Not Found
        </h1>
        <p className="text-fg-muted mb-8 text-sm sm:text-base">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-primary text-primary-fg font-semibold rounded-xl hover:bg-primary-hover transition duration-200 shadow-xs"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
