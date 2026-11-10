import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { motion } from "motion/react";
import sentinelsLogo from "../assets/sentinels_logo.png";
import ThemeToggle from "../components/ThemeToggle";
import Sheet from "../components/ui/Sheet";
import Button from "../components/ui/Button";
import { useAppAuth } from "../auth/useAppAuth";
import { DirectionAwareTabs } from "@/registry/cult-ui/direction-aware-tabs";

export default function Navbar() {
  const { isLoaded, isSignedIn, openSignIn } = useAppAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [activeTabId, setActiveTabId] = useState(() => {
    if (location.pathname === "/about") return 2;
    if (location.pathname === "/how-it-works" || location.hash === "#how-it-works") return 1;
    return 0;
  });

  const isManualScrollRef = useRef(false);
  const manualScrollTimerRef = useRef(null);

  // Sync route changes
  useEffect(() => {
    if (location.pathname === "/about") {
      setActiveTabId(2);
    } else if (location.pathname === "/how-it-works" || location.hash === "#how-it-works") {
      setActiveTabId(1);
    } else if (location.pathname === "/") {
      const el = document.getElementById("how-it-works");
      if (el) {
        const rect = el.getBoundingClientRect();
        const threshold = window.innerHeight * 0.45;
        if (rect.top <= threshold && rect.bottom >= 100) {
          setActiveTabId(1);
          return;
        }
      }
      setActiveTabId(0);
    }
  }, [location.pathname, location.hash]);

  // Scroll spy on home / landing page to detect when user scrolls to/from "How it works"
  useEffect(() => {
    if (location.pathname !== "/" && location.pathname !== "/how-it-works") {
      return;
    }

    const onScroll = () => {
      if (isManualScrollRef.current) return;

      const howItWorksEl = document.getElementById("how-it-works");
      if (!howItWorksEl) {
        if (window.scrollY < 200) {
          setActiveTabId(0);
        }
        return;
      }

      const rect = howItWorksEl.getBoundingClientRect();
      const threshold = window.innerHeight * 0.45;

      if (rect.top <= threshold && rect.bottom >= 120) {
        setActiveTabId(1);
      } else if (rect.top > threshold) {
        setActiveTabId(0);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (manualScrollTimerRef.current) clearTimeout(manualScrollTimerRef.current);
    };
  }, [location.pathname]);

  const handleHomeClick = (e) => {
    if (e) e.preventDefault();
    isManualScrollRef.current = true;
    if (manualScrollTimerRef.current) clearTimeout(manualScrollTimerRef.current);
    manualScrollTimerRef.current = setTimeout(() => {
      isManualScrollRef.current = false;
    }, 850);

    setActiveTabId(0);

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
    if (e) e.preventDefault();
    isManualScrollRef.current = true;
    if (manualScrollTimerRef.current) clearTimeout(manualScrollTimerRef.current);
    manualScrollTimerRef.current = setTimeout(() => {
      isManualScrollRef.current = false;
    }, 850);

    setActiveTabId(1);

    if (location.pathname !== "/" && location.pathname !== "/how-it-works") {
      navigate("/", { state: { scrollTo: "how-it-works" } });
    } else {
      const el = document.getElementById("how-it-works");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleAboutClick = () => {
    setActiveTabId(2);
    if (location.pathname !== "/about") {
      navigate("/about");
    }
  };

  const navTabs = [
    {
      id: 0,
      label: "Home",
      onClick: handleHomeClick,
    },
    {
      id: 1,
      label: "How it works",
      onClick: handleHowItWorksClick,
    },
    {
      id: 2,
      label: "About",
      onClick: handleAboutClick,
    },
  ];

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

        {/* Center Column: Direction-aware Nav Tabs (desktop only) */}
        <nav
          className="hidden md:flex items-center justify-self-center"
          aria-label="Main Navigation"
        >
          <DirectionAwareTabs
            tabs={navTabs}
            activeId={activeTabId}
            onTabClick={(id, tab) => tab.onClick?.()}
            showContent={false}
            layoutId="navbar-desktop-tabs"
            className="p-1 bg-surface-2/70 border border-line/70"
          />
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
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() =>
                openSignIn({
                  fallbackRedirectUrl: location.pathname || "/",
                })
              }
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-line bg-surface/90 dark:bg-surface-2/90 px-4 py-1.5 text-xs sm:text-sm font-semibold text-fg transition-all duration-300 hover:border-primary/60 hover:text-primary dark:hover:text-[#7df9ff] dark:hover:border-[#7df9ff]/50 hover:shadow-lg hover:shadow-primary/10 dark:hover:shadow-cyan-500/20 cursor-pointer shrink-0"
            >
              {/* Animated Sheen / Glint light that wipes across on hover */}
              <span className="absolute inset-0 -translate-x-[110%] group-hover:translate-x-[110%] transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/30 dark:via-cyan-400/30 to-transparent pointer-events-none" />

              <span className="relative z-10">Sign In</span>
            </motion.button>
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
        <nav className="flex flex-col gap-3 pt-2">
          <div className="w-full">
            <DirectionAwareTabs
              tabs={navTabs}
              activeId={activeTabId}
              onTabClick={(id, tab) => {
                setMobileMenuOpen(false);
                tab.onClick?.();
              }}
              showContent={false}
              layoutId="navbar-mobile-tabs"
              className="w-full justify-around bg-surface-2/80 border border-line"
            />
          </div>

          {!isSignedIn && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openSignIn({ fallbackRedirectUrl: location.pathname || "/" });
              }}
              className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-hover shadow-xs transition cursor-pointer"
            >
              <span>Sign In</span>
            </button>
          )}

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
        </nav>
      </Sheet>
    </header>
  );
}
