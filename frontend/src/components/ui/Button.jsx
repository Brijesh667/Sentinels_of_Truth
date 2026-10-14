import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../theme/ThemeProvider";
import SpecularButton from "../reactbits/SpecularButton";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  to,
  disabled = false,
  loading = false,
  type = "button",
  className = "",
  onClick,
  style,
  ...rest
}) {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hoverQuery = window.matchMedia("(hover: hover)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const check = () => {
      setCanHover(hoverQuery.matches && !motionQuery.matches);
    };

    check();
    hoverQuery.addEventListener("change", check);
    motionQuery.addEventListener("change", check);
    return () => {
      hoverQuery.removeEventListener("change", check);
      motionQuery.removeEventListener("change", check);
    };
  }, []);

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    if (onClick) onClick(e);
    if (to && !e.defaultPrevented) {
      navigate(to);
    }
  };

  const spinner = (
    <svg
      className="animate-spin -ml-0.5 mr-1.5 h-4 w-4 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );

  if (variant === "primary") {
    const isDark = resolvedTheme === "dark";
    return (
      <SpecularButton
        size={size}
        type={type}
        disabled={disabled || loading}
        onClick={handleClick}
        followMouse={canHover}
        tint="#2563eb"
        tintOpacity={0.95}
        baseColor="#1d4ed8"
        textColor="#ffffff"
        lineColor="#ffffff"
        glow={isDark ? 1 : 0.7}
        intensity={isDark ? 1 : 0.85}
        className={`${className} ${loading ? "opacity-75 cursor-wait" : ""}`}
        style={style}
        {...rest}
      >
        {loading && spinner}
        {children}
      </SpecularButton>
    );
  }

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-4 py-2.5 text-sm rounded-xl",
    lg: "px-6 py-3 text-base rounded-2xl",
  };

  const variantClasses = {
    secondary:
      "bg-surface text-fg border border-line hover:bg-surface-2 shadow-xs",
    ghost: "text-fg-muted hover:text-fg hover:bg-surface-2",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={handleClick}
      className={`inline-flex items-center justify-center font-medium transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${
        sizeClasses[size] || sizeClasses.md
      } ${variantClasses[variant] || variantClasses.secondary} ${
        loading ? "cursor-wait" : ""
      } ${className}`}
      style={style}
      {...rest}
    >
      {loading && spinner}
      {children}
    </button>
  );
}
