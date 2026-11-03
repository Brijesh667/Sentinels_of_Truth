import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { motion } from "motion/react";
import sentinelsLogo from "../assets/sentinels_logo.png";
import ThemeToggle from "../components/ThemeToggle";
import Sheet from "../components/ui/Sheet";
import Button from "../components/ui/Button";
import { useAppAuth } from "../auth/useAppAuth";

export default function Navbar() {
  const { isLoaded, isSignedIn, openSignIn } = useAppAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleHomeClick = (e) => {
    if (e) e.preventDefault();
    if (location.pathname !== "/" || location.search || location.hash || window.location.pathname !== "/") {
      navigate("/");
    }
    if (window.location.pathname !== "/" || window.location.search || window.location.hash) {
      window.history.pushState(null, "", "/");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenHistory = () => {
    if (location.pathname !== "/") {
      navigate("/?openHistory=1");
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("sot:open-history"));
      }, 150);
    } else {
      window.dispatchEvent(new CustomEvent("sot:open-history"));
    }
  };

  const handleHowItWorksClick = (e) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate("/how-it-works");
    } else {
      const el = document.getElementById("how-it-works");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full h-14 sm:h-16 bg-bg/85 backdrop-blur-md border-b border-line pt-[env(safe-area-inset-top,0px)] transition-colors duration-200 relative overflow-hidden">
      {/* Route change motion progress bar */}
      <motion.div
        key={location.pathname}
        initial={{ width: "0%", opacity: 1 }}
        animate={{ width: "100%", opacity: [1, 1, 0] }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="absolute top-0 left-0 h-[2px] bg-primary z-50 pointer-events-none"
      />

      {/* Main container: flex justify-between on mobile, 3-column grid on desktop for strictly centered nav pill */}
      <div className="max-w-6xl mx-auto h-full flex items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr] px-3 sm:px-6">
        {/* Left Column: Logo + App Name */}
        <div className="min-w-0 flex items-center justify-self-start">
          <Link
            to="/"
            onClick={handleHomeClick}
            className="flex items-center gap-2 sm:gap-2.5 rounded-xl group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--accent)] cursor-pointer min-w-0"
            aria-label="Sentinels of Truth Home"
          >
            <img
              src={sentinelsLogo}
              alt="Sentinels of Truth logo"
              width={32}
              height={32}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-contain shadow-xs shrink-0"
            />
            <span className="font-serif font-bold text-base sm:text-lg text-fg tracking-tight whitespace-nowrap min-w-0">
              Sentinels of Truth
            </span>
          </Link>
        </div>

        {/* Center Column: Nav pill (desktop only) */}
        <nav
          className="hidden md:flex items-center justify-self-center gap-1 p-1 rounded-full bg-surface-2/70 border border-line/70"
          aria-label="Main Navigation"
        >
          <motion.a
            href="/how-it-works"
            onClick={handleHowItWorksClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors rounded-full cursor-pointer select-none ${
              window.location.pathname === "/how-it-works" || location.hash === "#how-it-works"
                ? "text-fg font-semibold"
                : "text-fg-muted hover:text-fg"
            }`}
          >
            {(window.location.pathname === "/how-it-works" || location.hash === "#how-it-works") && (
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

        {/* Right Column: */}
        {/* Mobile: [Dark/Light mode button] [Profile icon] [3 line] */}
        {/* Desktop: [History] [Dark/Light mode button] [Profile / Sign In] */}
        <div className="flex items-center justify-self-end gap-1.5 sm:gap-2.5 shrink-0">
          {/* History icon: desktop only (on mobile, History is in the 3-line hamburger drawer) */}
          {isSignedIn && (
            <button
              type="button"
              onClick={handleOpenHistory}
              aria-label="History"
              title="History"
              className="hidden md:flex w-9 h-9 min-w-[36px] min-h-[36px] p-0 rounded-xl text-fg-muted dark:text-slate-400 hover:text-[var(--accent)] hover:bg-surface-2 transition-[color,background-color] duration-200 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 items-center justify-center shrink-0"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          )}

          {/* 1. Dark/light mode button */}
          <ThemeToggle className="w-8 h-8 sm:w-9 sm:h-9 min-w-[32px] sm:min-w-[36px] min-h-[32px] sm:min-h-[36px] p-0 flex items-center justify-center shrink-0" />

          {/* 2. Profile icon / Avatar */}
          {!isLoaded ? (
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-surface-2/60 animate-pulse shrink-0" aria-hidden="true" />
          ) : isSignedIn ? (
            <div className="flex items-center shrink-0">
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
            <>
              {/* Mobile: Profile icon button */}
              <button
                type="button"
                onClick={() =>
                  openSignIn({
                    fallbackRedirectUrl: location.pathname || "/",
                  })
                }
                aria-label="Profile / Sign In"
                title="Profile / Sign In"
                className="sm:hidden w-8 h-8 min-w-[32px] min-h-[32px] rounded-full border border-line bg-surface-2/70 hover:bg-surface-2 text-fg-muted hover:text-fg flex items-center justify-center transition cursor-pointer shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              {/* Desktop: Sign In text button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  openSignIn({
                    fallbackRedirectUrl: location.pathname || "/",
                  })
                }
                className="hidden sm:inline-flex font-medium min-h-[36px] sm:min-h-[38px] px-2.5 sm:px-3.5 text-xs sm:text-sm shrink-0"
              >
                Sign In
              </Button>
            </>
          )}

          {/* 3. Three-line hamburger button (Mobile only) */}
          <div className="md:hidden flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-expanded={mobileMenuOpen}
              aria-label="Open navigation menu"
              className="w-8 h-8 sm:w-9 sm:h-9 min-w-[32px] sm:min-w-[36px] min-h-[32px] sm:min-h-[36px] p-0 rounded-xl text-fg-muted hover:text-fg hover:bg-surface-2 transition cursor-pointer flex items-center justify-center shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        title={
          <Link
            to="/"
            onClick={(e) => {
              setMobileMenuOpen(false);
              handleHomeClick(e);
            }}
            className="hover:underline cursor-pointer"
          >
            Sentinels of Truth
          </Link>
        }
        description="Public evidence-backed verification"
      >
        <nav className="flex flex-col gap-2 pt-2">
          {isSignedIn && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleOpenHistory();
              }}
              className="flex items-center gap-2 px-3.5 py-3 rounded-xl text-sm font-medium text-fg hover:bg-surface-2 transition text-left cursor-pointer"
            >
              <svg className="w-4 h-4 text-fg-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>My History</span>
            </button>
          )}

          <a
            href="/how-it-works"
            onClick={(e) => {
              setMobileMenuOpen(false);
              handleHowItWorksClick(e);
            }}
            className="flex items-center gap-2 px-3.5 py-3 rounded-xl text-sm font-medium text-fg hover:bg-surface-2 transition"
          >
            <span>How it works</span>
          </a>

          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3.5 py-3 rounded-xl text-sm font-medium text-fg hover:bg-surface-2 transition"
          >
            <span>About</span>
          </Link>
        </nav>
      </Sheet>
    </header>
  );
}
