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
      colorClass: "text-fg-muted",
      bgClass: "bg-surface-2",
      borderClass: "border-line",
      barColor: "bg-fg-muted",
      fillColor: "bg-surface-2",
    };
  }

  const s = String(status).toLowerCase().trim();

  if (s === "verified" || s === "true" || s === "real") {
    return {
      label: "True",
      tone: "success",
      variant: "success",
      colorClass: "text-success",
      bgClass: "bg-success-soft",
      borderClass: "border-success/30",
      barColor: "bg-success",
      fillColor: "bg-success-soft",
    };
  }

  if (s === "fake" || s === "false" || s === "debunked" || s === "untrue") {
    return {
      label: "False",
      tone: "danger",
      variant: "danger",
      colorClass: "text-danger",
      bgClass: "bg-danger-soft",
      borderClass: "border-danger/30",
      barColor: "bg-danger",
      fillColor: "bg-danger-soft",
    };
  }

  if (s === "misleading" || s === "partially_true" || s === "half_true" || s === "exaggerated") {
    return {
      label: "Misleading",
      tone: "warning",
      variant: "warning",
      colorClass: "text-warning",
      bgClass: "bg-warning-soft",
      borderClass: "border-warning/30",
      barColor: "bg-warning",
      fillColor: "bg-warning-soft",
    };
  }

  return {
    label: "Unclear",
    tone: "neutral",
    variant: "neutral",
    colorClass: "text-fg-muted",
    bgClass: "bg-surface-2",
    borderClass: "border-line",
    barColor: "bg-fg-muted",
    fillColor: "bg-surface-2",
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
