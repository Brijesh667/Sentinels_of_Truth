import { useEffect, useState } from "react";
import { getVerdictConfig } from "../../utils/verdict.js";

export default function ConfidenceMeter({
  confidence = 0,
  status,
  className = "",
  showNotice = true,
}) {
  const [fillWidth, setFillWidth] = useState(0);
  const num = Math.min(100, Math.max(0, Math.round(Number(confidence) || 0)));
  const config = getVerdictConfig(status);

  useEffect(() => {
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReduced) {
      setFillWidth(num);
      return;
    }

    setFillWidth(0);
    const timeout = setTimeout(() => {
      setFillWidth(num);
    }, 50);

    return () => clearTimeout(timeout);
  }, [num]);

  const isLowConfidence = num < 60;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
        <span className="text-fg">
          We&apos;re <strong className={`font-semibold ${config.colorClass}`}>{num}% sure</strong>
        </span>
        {isLowConfidence && showNotice && (
          <span className="text-[11px] sm:text-xs text-warning font-medium">
            Low confidence. Check the sources yourself.
          </span>
        )}
      </div>

      <div
        className="w-full h-2 rounded-full bg-surface-2 overflow-hidden border border-line/60"
        role="progressbar"
        aria-valuenow={num}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={`Confidence score: ${num}%`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${config.barColor}`}
          style={{ width: `${fillWidth}%` }}
        />
      </div>
    </div>
  );
}
