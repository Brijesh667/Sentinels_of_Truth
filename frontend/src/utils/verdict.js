/**
 * Maps raw backend verification statuses to human-friendly editorial verdict labels.
 * Never uses "Fake" or "Verified" in user-facing labels.
 */
export function getVerdictConfig(status) {
  if (!status) {
    return {
      label: "Unclear",
      tone: "neutral",
      variant: "neutral",
      colorClass: "text-[var(--verdict-unclear)]",
      bgClass: "bg-[var(--verdict-unclear-bg)]",
      borderClass: "border-[var(--verdict-unclear-border)]",
      barColor: "bg-[var(--verdict-unclear)]",
      fillColor: "bg-[var(--verdict-unclear-bg)]",
      varColor: "var(--verdict-unclear)",
      varBg: "var(--verdict-unclear-bg)",
      varBorder: "var(--verdict-unclear-border)",
      varGlow: "var(--verdict-unclear-glow)",
      varGradient: "var(--verdict-unclear-gradient)",
    };
  }

  const s = String(status).toLowerCase().trim();

  if (s === "verified" || s === "true" || s === "real") {
    return {
      label: "True",
      tone: "success",
      variant: "success",
      colorClass: "text-[var(--verdict-true)]",
      bgClass: "bg-[var(--verdict-true-bg)]",
      borderClass: "border-[var(--verdict-true-border)]",
      barColor: "bg-[var(--verdict-true)]",
      fillColor: "bg-[var(--verdict-true-bg)]",
      varColor: "var(--verdict-true)",
      varBg: "var(--verdict-true-bg)",
      varBorder: "var(--verdict-true-border)",
      varGlow: "var(--verdict-true-glow)",
      varGradient: "var(--verdict-true-gradient)",
    };
  }

  if (s === "fake" || s === "false" || s === "debunked" || s === "untrue") {
    return {
      label: "False",
      tone: "danger",
      variant: "danger",
      colorClass: "text-[var(--verdict-false)]",
      bgClass: "bg-[var(--verdict-false-bg)]",
      borderClass: "border-[var(--verdict-false-border)]",
      barColor: "bg-[var(--verdict-false)]",
      fillColor: "bg-[var(--verdict-false-bg)]",
      varColor: "var(--verdict-false)",
      varBg: "var(--verdict-false-bg)",
      varBorder: "var(--verdict-false-border)",
      varGlow: "var(--verdict-false-glow)",
      varGradient: "var(--verdict-false-gradient)",
    };
  }

  if (s === "misleading" || s === "partially_true" || s === "half_true" || s === "exaggerated") {
    return {
      label: "Misleading",
      tone: "warning",
      variant: "warning",
      colorClass: "text-[var(--verdict-misleading)]",
      bgClass: "bg-[var(--verdict-misleading-bg)]",
      borderClass: "border-[var(--verdict-misleading-border)]",
      barColor: "bg-[var(--verdict-misleading)]",
      fillColor: "bg-[var(--verdict-misleading-bg)]",
      varColor: "var(--verdict-misleading)",
      varBg: "var(--verdict-misleading-bg)",
      varBorder: "var(--verdict-misleading-border)",
      varGlow: "var(--verdict-misleading-glow)",
      varGradient: "var(--verdict-misleading-gradient)",
    };
  }

  return {
    label: "Unclear",
    tone: "neutral",
    variant: "neutral",
    colorClass: "text-[var(--verdict-unclear)]",
    bgClass: "bg-[var(--verdict-unclear-bg)]",
    borderClass: "border-[var(--verdict-unclear-border)]",
    barColor: "bg-[var(--verdict-unclear)]",
    fillColor: "bg-[var(--verdict-unclear-bg)]",
    varColor: "var(--verdict-unclear)",
    varBg: "var(--verdict-unclear-bg)",
    varBorder: "var(--verdict-unclear-border)",
    varGlow: "var(--verdict-unclear-glow)",
    varGradient: "var(--verdict-unclear-gradient)",
  };
}

/**
 * Format origin text for result footer
 * verified_db -> "Checked before. Last verified {date}" (or "Checked before")
 * web_search -> "Fresh check"
 */
export function formatOriginLabel(origin, verifiedAt) {
  const isDb = origin === "verified_db" || origin === "cache";
  if (!isDb) {
    return "Fresh check";
  }

  if (verifiedAt) {
    try {
      const d = new Date(verifiedAt);
      if (!isNaN(d.getTime())) {
        const dateStr = new Intl.DateTimeFormat("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(d);
        return `Checked before. Last verified ${dateStr}`;
      }
    } catch {
      // ignore
    }
  }

  return "Checked before";
}
