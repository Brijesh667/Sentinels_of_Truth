import { useEffect, useState } from "react";
import { getVerdictConfig } from "../../utils/verdict.js";

export default function ConfidenceMeter({
  confidence = 0,
  status,
  className = "",
  showNotice = true,
}) {
  const [animated, setAnimated] = useState(() => {
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
      return true;
    }
    return false;
  });

  const num = Math.min(100, Math.max(0, Math.round(Number(confidence) || 0)));
  const config = getVerdictConfig(status);

  useEffect(() => {
    if (animated) return;
    const raf = requestAnimationFrame(() => {
      setAnimated(true);
    });
    return () => cancelAnimationFrame(raf);
  }, [animated]);

  const isLowConfidence = num < 60;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-xs sm:text-sm font-medium flex-wrap gap-2">
        <span className="text-fg whitespace-nowrap">
          We&apos;re <strong className="font-semibold" style={{ color: config.varColor }}>{num}% sure</strong>
        </span>
        {isLowConfidence && showNotice && (
          <span className="text-[11px] sm:text-xs text-warning font-medium">
            Low confidence. Check the sources yourself.
          </span>
        )}
      </div>

      {/* 6px thin track, fully rounded, muted track */}
      <div
        className="w-full h-1.5 rounded-full bg-surface-2 overflow-hidden border border-line/50"
        role="progressbar"
        aria-valuenow={num}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={`Confidence score: ${num}%`}
      >
        <div
          className="h-full rounded-full origin-left motion-reduce:transition-none"
          style={{
            width: `${num}%`,
            transform: animated ? "scaleX(1)" : "scaleX(0)",
            transformOrigin: "left",
            transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
            background: config.varGradient,
          }}
        />
      </div>
    </div>
  );
}
