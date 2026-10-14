import { useNavigate } from "react-router-dom";

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
      className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current shrink-0"
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

  const sizeClasses = {
    sm: "min-h-[44px] px-3.5 py-2 text-xs font-medium rounded-lg",
    md: "min-h-[44px] px-4 py-2.5 text-sm font-medium rounded-xl",
    lg: "min-h-[48px] px-6 py-3 text-base font-semibold rounded-xl",
  };

  const variantClasses = {
    primary:
      "bg-primary text-primary-fg hover:bg-primary-hover shadow-xs active:scale-[0.98]",
    secondary:
      "bg-surface text-fg border border-line hover:bg-surface-2 shadow-xs active:scale-[0.98]",
    ghost:
      "bg-transparent text-fg-muted hover:text-fg hover:bg-surface-2 active:scale-[0.98]",
    danger:
      "bg-transparent text-danger border border-danger/40 hover:bg-danger-soft hover:border-danger shadow-xs active:scale-[0.98]",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={handleClick}
      className={`inline-flex items-center justify-center transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
        sizeClasses[size] || sizeClasses.md
      } ${variantClasses[variant] || variantClasses.primary} ${
        loading ? "cursor-wait opacity-80" : ""
      } ${className}`}
      style={style}
      {...rest}
    >
      {loading && spinner}
      {children}
    </button>
  );
}
