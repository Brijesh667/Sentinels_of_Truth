export default function Chip({
  children,
  onClick,
  active = false,
  className = "",
  disabled = false,
  type = "button",
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer select-none active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
        active
          ? "bg-primary text-primary-fg border border-primary shadow-xs"
          : "bg-surface text-fg border border-line hover:border-fg-muted/40 hover:bg-surface-2 shadow-2xs"
      } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
