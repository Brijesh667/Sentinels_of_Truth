import { Link } from "react-router-dom";
import Logo from "./Logo";
import siteConfig from "../config/site";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-surface border-t border-line transition-colors duration-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & Tagline */}
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="inline-block">
              <Logo />
            </Link>
            <p className="text-sm text-fg-muted max-w-sm">
              {siteConfig.tagline}
            </p>
            <p className="text-xs text-fg-muted/80">
              Built by <span className="font-medium text-fg">{siteConfig.author}</span>
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-fg mb-3">
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-fg-muted hover:text-fg transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/app" className="text-fg-muted hover:text-fg transition-colors">
                  Verify
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-fg-muted hover:text-fg transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Project Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-fg mb-3">
              Project
            </h4>
            <ul className="space-y-2 text-sm">
              {siteConfig.github ? (
                <li>
                  <a
                    href={siteConfig.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fg-muted hover:text-fg transition-colors"
                  >
                    GitHub
                  </a>
                </li>
              ) : null}
              {siteConfig.linkedin ? (
                <li>
                  <a
                    href={siteConfig.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fg-muted hover:text-fg transition-colors"
                  >
                    LinkedIn
                  </a>
                </li>
              ) : null}
              {siteConfig.portfolio ? (
                <li>
                  <a
                    href={siteConfig.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fg-muted hover:text-fg transition-colors"
                  >
                    Portfolio
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-fg-muted">
          <p>
            AI can make mistakes. Check important things twice.
          </p>
          <p>
            &copy; {currentYear} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
