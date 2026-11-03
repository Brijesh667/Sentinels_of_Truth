import { getVerdictConfig } from "../../utils/verdict.js";

export default function VerdictBadge({
  status,
  size = "md",
  className = "",
  showIcon = false,
}) {
  const config = getVerdictConfig(status);

  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs font-semibold",
    md: "px-4 py-1.5 text-base font-semibold",
    lg: "px-5 py-2 text-lg font-semibold",
  };

  const iconSize = size === "lg" ? "w-5 h-5" : size === "sm" ? "w-3.5 h-3.5" : "w-4.5 h-4.5";

  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 rounded-full border transition-colors shadow-2xs ${
        sizeClasses[size] || sizeClasses.md
      } ${className}`}
      style={{
        backgroundColor: config.varBg,
        borderColor: config.varBorder,
        color: config.varColor,
      }}
    >
      {showIcon && config.tone === "success" && (
        <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}

      {showIcon && config.tone === "danger" && (
        <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}

      {showIcon && config.tone === "warning" && (
        <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      )}

      {showIcon && config.tone === "neutral" && (
        <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m.08 4h.01" />
        </svg>
      )}

      <span>{config.label}</span>
    </span>
  );
}
