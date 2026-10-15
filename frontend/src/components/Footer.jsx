import { Link, useLocation, useNavigate } from "react-router-dom";
import siteConfig from "../config/site";

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleVerifyClick = (e) => {
    e.preventDefault();
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      const input = document.querySelector("#claim-input");
      if (input) input.focus();
    } else {
      navigate("/");
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        const input = document.querySelector("#claim-input");
        if (input) input.focus();
      }, 100);
    }
  };

  return (
    <footer className="w-full bg-surface border-t border-line transition-colors duration-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          {/* Left: Honest reminder */}
          <div>
            <p className="text-xs text-fg-muted">
              AI can make mistakes. Check primary sources.
            </p>
          </div>

          {/* Center: Essential links */}
          <nav className="flex items-center justify-center gap-6 text-sm" aria-label="Footer links">
            <Link
              to="/"
              onClick={handleVerifyClick}
              className="text-fg-muted hover:text-fg transition-colors"
            >
              Verify a claim
            </Link>
            <Link
              to="/about"
              className="text-fg-muted hover:text-fg transition-colors"
            >
              About
            </Link>
            <Link
              to="/privacy"
              className="text-fg-muted hover:text-fg transition-colors"
            >
              Privacy
            </Link>
          </nav>

          {/* Right: Open source link */}
          <div className="text-xs text-fg-muted">
            {siteConfig.github && (
              <a
                href={siteConfig.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                GitHub
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
