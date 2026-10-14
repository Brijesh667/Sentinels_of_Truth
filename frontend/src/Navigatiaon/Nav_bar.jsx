import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useTheme } from "../theme/ThemeProvider";
import AuthModal from "../auth/AuthModal";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import GooeyNav from "../components/reactbits/GooeyNav";
import Button from "../components/ui/Button";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Verify", href: "/app" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const {
    user,
    isSignedIn,
    isLoaded,
    logout,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    authModalSubtitle,
  } = useAuth();

  const { resolvedTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const hamburgerBtnRef = useRef(null);

  // Compute active nav index from current route
  const getActiveIndex = () => {
    const path = location.pathname;
    if (path === "/") return 0;
    if (path.startsWith("/app")) return 1;
    if (path.startsWith("/about")) return 2;
    return 0;
  };

  const activeIndex = getActiveIndex();

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        hamburgerBtnRef.current &&
        !hamburgerBtnRef.current.contains(e.target)
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const userInitial = (user?.name?.[0] || user?.email?.[0] || "U").toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-bg/80 backdrop-blur-md border-b border-line pt-[env(safe-area-inset-top,0px)] transition-colors duration-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-6 py-3">
          {/* Left: Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 rounded-xl focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Sentinels of Truth Home"
          >
            <Logo />
          </Link>

          {/* Center: GooeyNav (desktop: md and up) */}
          <div className="hidden md:flex items-center justify-center">
            <GooeyNav
              items={NAV_ITEMS}
              activeIndex={activeIndex}
              onChange={(index, item) => {
                navigate(item.href);
              }}
              theme={resolvedTheme === "dark" ? "dark" : "light"}
              frame={true}
              size="sm"
              particleCount={8}
            />
          </div>

          {/* Right: ThemeToggle + Auth Area + Mobile Hamburger */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <ThemeToggle />

            {!isLoaded ? (
              <div className="w-20 h-9" aria-hidden="true" />
            ) : isSignedIn && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-surface-2 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user.name || "User avatar"}
                      className="w-9 h-9 rounded-full object-cover border border-line shadow-xs"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-primary text-primary-fg font-bold text-sm flex items-center justify-center shadow-xs">
                      {userInitial}
                    </div>
                  )}
                  <span className="hidden lg:inline text-sm font-semibold text-fg max-w-[120px] truncate">
                    {user.name || user.email?.split("@")[0]}
                  </span>
                  <svg
                    className={`w-4 h-4 text-fg-muted transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 bg-surface rounded-2xl shadow-xl border border-line py-2 z-50 animate-fadeIn"
                  >
                    <div className="px-4 py-2.5 border-b border-line">
                      <p className="text-sm font-bold text-fg truncate">
                        {user.name || "Member"}
                      </p>
                      <p className="text-xs text-fg-muted truncate">{user.email}</p>
                    </div>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate("/app");
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-fg hover:bg-surface-2 hover:text-primary transition flex items-center gap-2 cursor-pointer"
                    >
                      <span>📜</span>
                      <span>My history</span>
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={async () => {
                        setDropdownOpen(false);
                        await logout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger-soft transition flex items-center gap-2 cursor-pointer border-t border-line mt-1"
                    >
                      <span>🚪</span>
                      <span>Log out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => openAuthModal()}
                className="font-semibold"
              >
                Sign In
              </Button>
            )}

            {/* Mobile Hamburger Button (below md) */}
            <div className="md:hidden">
              <button
                ref={hamburgerBtnRef}
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
                className="p-2 rounded-xl text-fg-muted hover:text-fg hover:bg-surface-2 transition cursor-pointer"
              >
                {mobileMenuOpen ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu (below md) */}
        {mobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden border-t border-line bg-surface/98 backdrop-blur-lg px-4 py-3 shadow-lg transition-colors"
          >
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item, idx) => {
                const isActive = activeIndex === idx;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-fg hover:bg-surface-2 hover:text-primary"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        subtitle={authModalSubtitle}
      />
    </>
  );
}