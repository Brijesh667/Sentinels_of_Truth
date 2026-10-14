export default function Badge({
  children,
  variant = "neutral",
  size = "md",
  className = "",
  ...rest
}) {
  const variantClasses = {
    neutral: "bg-surface-2 text-fg-muted border border-line",
    success: "bg-success-soft text-success-fg border border-success/25",
    danger: "bg-danger-soft text-danger-fg border border-danger/25",
    warning: "bg-warning-soft text-warning-fg border border-warning/25",
    primary: "bg-primary/10 text-primary border border-primary/25",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-0.5 text-xs",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full transition-colors ${
        sizeClasses[size] || sizeClasses.md
      } ${variantClasses[variant] || variantClasses.neutral} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
