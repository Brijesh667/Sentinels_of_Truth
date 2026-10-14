export default function DbStatusCard({ dbResult }) {
  if (!dbResult) {
    return null;
  }

  const flagColors = {
    insert: "bg-primary-soft text-primary border-primary/25",
    update: "bg-warning-soft text-warning-fg border-warning/25",
    duplicate: "bg-warning-soft text-warning-fg border-warning/25",
    similar: "bg-primary-soft text-primary border-primary/25",
  };

  const borderColors = {
    insert: "border-primary",
    update: "border-warning",
    duplicate: "border-warning",
    similar: "border-primary",
  };

  const flagKey = dbResult?.flag?.toLowerCase() || "insert";
  const flagColor = flagColors[flagKey] || "bg-surface-2 text-fg-muted border-line";
  const borderColor = borderColors[flagKey] || "border-fg-muted";

  return (
    <div className={`mt-8 bg-surface p-6 sm:p-8 rounded-2xl shadow-xs border border-line border-l-4 ${borderColor} transition-colors`}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h2 className="text-2xl font-bold text-fg">Database Status</h2>
        <span className={`px-4 py-1.5 rounded-full font-semibold text-sm border ${flagColor}`}>
          {dbResult?.flag}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">
            Action
          </p>
          <p className="text-lg text-fg font-medium">
            {dbResult?.flag === "insert" && "Added"}
            {dbResult?.flag === "reject" && "Rejected"}
            {dbResult?.flag === "human_review" && "Need Human Review"}
          </p>
        </div>

        <div className="bg-surface-2 p-4 rounded-xl border border-line">
          <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">
            Details
          </p>
          <p className="text-fg-muted leading-relaxed">{dbResult?.reason}</p>
        </div>
      </div>
    </div>
  );
}
