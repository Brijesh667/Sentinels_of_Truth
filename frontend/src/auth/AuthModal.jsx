import { useState, useEffect, useRef } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "./AuthContext";
import { useTheme } from "../theme/ThemeProvider";

export default function AuthModal({ isOpen, onClose, subtitle }) {
  const { login, signup, googleLogin } = useAuth();
  const { resolvedTheme } = useTheme();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const modalRef = useRef(null);
  const emailInputRef = useRef(null);

  // Reset form when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setFieldErrors({});
      setFormError("");
      setLoading(false);
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 50);
    } else {
      setPassword("");
    }
  }, [isOpen, mode]);

  // Focus trap & Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (password.length > 72) {
      errors.password = "Password cannot exceed 72 characters";
    }

    if (mode === "signup" && name.trim().length > 60) {
      errors.name = "Name cannot exceed 60 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;

    setLoading(true);
    try {
      if (mode === "login") {
        await login(email.trim(), password);
      } else {
        await signup(email.trim(), password, name.trim());
      }
      onClose();
    } catch (err) {
      setFormError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setFormError("");
    setLoading(true);
    try {
      if (!credentialResponse?.credential) {
        throw new Error("No Google credential returned");
      }
      await googleLogin(credentialResponse.credential);
      onClose();
    } catch (err) {
      setFormError(err.message || "Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setFieldErrors({});
    setFormError("");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-surface rounded-2xl shadow-2xl border border-line overflow-hidden relative transition-colors"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1.5 text-fg-muted hover:text-fg rounded-lg hover:bg-surface-2 transition cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-7 sm:p-8">
          <div className="text-center mb-6">
            <h2 id="auth-modal-title" className="text-2xl font-bold text-fg">
              {mode === "login" ? "Sign in to Sentinels" : "Create an account"}
            </h2>
            {subtitle ? (
              <p className="text-xs text-primary mt-2 font-medium bg-primary/10 py-1.5 px-3 rounded-lg border border-primary/25">
                {subtitle}
              </p>
            ) : (
              <p className="text-xs text-fg-muted mt-1">
                {mode === "login"
                  ? "Access your saved claims and verification history."
                  : "Start saving and organizing your fact checks."}
              </p>
            )}
          </div>

          {formError && (
            <div
              role="alert"
              className="mb-5 p-3 rounded-xl bg-danger-soft border border-danger/25 text-xs text-danger-fg flex items-start gap-2"
            >
              <span className="font-bold">⚠️</span>
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-fg uppercase tracking-wide mb-1">
                  Name <span className="text-fg-muted font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  maxLength={60}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-surface text-fg placeholder:text-fg-muted text-sm focus:outline-hidden focus:ring-2 focus:ring-primary caret-primary transition"
                />
                {fieldErrors.name && (
                  <p className="text-xs text-danger mt-1">{fieldErrors.name}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-fg uppercase tracking-wide mb-1">
                Email
              </label>
              <input
                ref={emailInputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-surface text-fg placeholder:text-fg-muted text-sm focus:outline-hidden focus:ring-2 caret-primary transition ${
                  fieldErrors.email
                    ? "border-danger focus:ring-danger"
                    : "border-line focus:ring-primary"
                }`}
              />
              {fieldErrors.email && (
                <p className="text-xs text-danger mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-fg uppercase tracking-wide">
                  Password
                </label>
                {mode === "signup" && (
                  <span className="text-[11px] text-fg-muted">Min 8 characters</span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "Create a password (min 8 chars)" : "Enter your password"}
                  required
                  className={`w-full px-3.5 py-2.5 pr-10 rounded-xl border bg-surface text-fg placeholder:text-fg-muted text-sm focus:outline-hidden focus:ring-2 caret-primary transition ${
                    fieldErrors.password
                      ? "border-danger focus:ring-danger"
                      : "border-line focus:ring-primary"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg text-xs font-medium cursor-pointer"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-danger mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-primary hover:bg-primary-hover text-primary-fg font-semibold text-sm rounded-xl shadow-xs transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{mode === "login" ? "Signing in..." : "Creating account..."}</span>
                </>
              ) : mode === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-line"></div>
            <span className="text-xs text-fg-muted uppercase font-medium">or</span>
            <div className="flex-1 h-px bg-line"></div>
          </div>

          {/* Google Login */}
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setFormError("Google sign-in failed. Please try again.")}
              shape="pill"
              theme={resolvedTheme === "dark" ? "filled_black" : "outline"}
              size="large"
              width="320"
              text={mode === "login" ? "signin_with" : "signup_with"}
            />
          </div>

          {/* Footer toggle */}
          <div className="mt-6 text-center text-xs text-fg-muted">
            {mode === "login" ? (
              <p>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="text-primary font-bold hover:underline cursor-pointer ml-1"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-primary font-bold hover:underline cursor-pointer ml-1"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
