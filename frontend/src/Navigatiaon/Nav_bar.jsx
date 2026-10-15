import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { UserButton } from "@clerk/clerk-react";
import { useAppAuth } from "../auth/useAppAuth";
import ThemeToggle from "../components/ThemeToggle";
import Button from "../components/ui/Button";
import Sheet from "../components/ui/Sheet";
import sentinelsLogo from "../assets/sentinels_logo.png";

export default function Navbar() {
  const { isSignedIn, isLoaded, openSignIn } = useAppAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLanding = location.pathname === "/";

  const handleOpenHistory = () => {
    if (location.pathname !== "/") {
      navigate("/?openHistory=1");
    } else {
      window.dispatchEvent(new CustomEvent("sot:open-history"));
    }
  };

  const handleHowItWorksClick = (e) => {
    if (isLanding) {
      e.preventDefault();
      const el = document.getElementById("how-it-works");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-bg/85 backdrop-blur-md border-b border-line pt-[env(safe-area-inset-top,0px)] transition-colors duration-200 relative overflow-hidden">
      {/* Route change motion progress bar */}
      <motion.div
        key={location.pathname}
        initial={{ width: "0%", opacity: 1 }}
        animate={{ width: "100%", opacity: [1, 1, 0] }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="absolute top-0 left-0 h-[2px] bg-primary z-50 pointer-events-none"
      />

      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Left: Image Logo + Serif Title */}
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-xl group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Sentinels of Truth Home"
        >
          <img
            src={sentinelsLogo}
            alt="Sentinels of Truth logo"
            width={32}
            height={32}
            className="w-8 h-8 rounded-lg object-contain shadow-xs shrink-0"
          />
          <span className="font-serif font-bold text-lg text-fg tracking-tight">
            Sentinels of Truth
          </span>
        </Link>

        {/* Center: Editorial Nav Links with animated motion pill (desktop) */}
        <nav
          className="hidden md:flex items-center gap-1 p-1 rounded-full bg-surface-2/70 border border-line/70"
          aria-label="Main Navigation"
        >
          <motion.a
            href={isLanding ? "#how-it-works" : "/#how-it-works"}
            onClick={handleHowItWorksClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors rounded-full cursor-pointer select-none ${
              isLanding && location.hash === "#how-it-works"
                ? "text-fg font-semibold"
                : "text-fg-muted hover:text-fg"
            }`}
          >
            {isLanding && location.hash === "#how-it-works" && (
              <motion.span
                layoutId="navbar-pill"
                className="absolute inset-0 rounded-full bg-surface border border-line shadow-2xs -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
              />
            )}
            How it works
          </motion.a>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative"
          >
            <Link
              to="/about"
              className={`relative block px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors rounded-full select-none ${
                location.pathname === "/about"
                  ? "text-fg font-semibold"
                  : "text-fg-muted hover:text-fg"
              }`}
            >
              {location.pathname === "/about" && (
                <motion.span
                  layoutId="navbar-pill"
                  className="absolute inset-0 rounded-full bg-surface border border-line shadow-2xs -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                />
              )}
              About
            </Link>
          </motion.div>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <ThemeToggle />

          {!isLoaded ? (
            <div className="w-18 h-9" aria-hidden="true" />
          ) : isSignedIn ? (
            <div className="flex items-center">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-8 h-8 sm:w-9 sm:h-9 border border-line shadow-2xs",
                  },
                }}
              />
            </div>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                openSignIn({
                  fallbackRedirectUrl: location.pathname || "/",
                })
              }
              className="font-medium min-h-[40px]"
            >
              Sign In
            </Button>
          )}

          {/* Mobile Hamburger Button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-expanded={mobileMenuOpen}
              aria-label="Open navigation menu"
              className="p-2 rounded-xl text-fg-muted hover:text-fg hover:bg-surface-2 transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer using Sheet component */}
      <Sheet
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title="Sentinels of Truth"
        description="Public evidence-backed verification"
      >
        <nav className="flex flex-col gap-2 pt-2">
          <Link
            to="/"
            onClick={() => {
              setMobileMenuOpen(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2 px-3.5 py-3 rounded-xl text-sm font-semibold text-primary bg-primary/10 min-h-[44px]"
          >
            <span>Check a claim</span>
          </Link>
          {isSignedIn && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleOpenHistory();
              }}
              className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-medium text-fg hover:bg-surface-2 transition text-left cursor-pointer min-h-[44px]"
            >
              <svg className="w-4 h-4 text-fg-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>My History</span>
            </button>
          )}
          <a
            href={isLanding ? "#how-it-works" : "/#how-it-works"}
            onClick={(e) => {
              setMobileMenuOpen(false);
              handleHowItWorksClick(e);
            }}
            className="flex items-center px-3.5 py-3 rounded-xl text-sm font-medium text-fg hover:bg-surface-2 min-h-[44px]"
          >
            How it works
          </a>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center px-3.5 py-3 rounded-xl text-sm font-medium transition min-h-[44px] ${
              location.pathname === "/about"
                ? "bg-surface-2 text-fg font-semibold"
                : "text-fg hover:bg-surface-2"
            }`}
          >
            About
          </Link>
        </nav>
      </Sheet>
    </header>
  );
}