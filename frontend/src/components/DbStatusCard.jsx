function DbStatusCard({ dbResult }) {
  if (!dbResult) {
    return null;
  }

  const flagColors = {
    insert: "bg-blue-100 text-blue-800 border-blue-300",
    update: "bg-yellow-100 text-yellow-800 border-yellow-300",
    duplicate: "bg-orange-100 text-orange-800 border-orange-300",
    similar: "bg-purple-100 text-purple-800 border-purple-300",
  };

  const borderColors = {
    insert: "border-blue-500",
    update: "border-yellow-500",
    duplicate: "border-orange-500",
    similar: "border-purple-500",
  };

  const flagKey = dbResult?.flag?.toLowerCase() || "insert";
  const flagColor = flagColors[flagKey] || "bg-gray-100 text-gray-800 border-gray-300";
  const borderColor = borderColors[flagKey] || "border-gray-500";

  return (
    <div className={`mt-8 bg-white p-8 rounded-2xl shadow-lg border-l-4 ${borderColor}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Database Status</h2>
        <span className={`px-4 py-2 rounded-full font-semibold text-sm border ${flagColor}`}>
          {dbResult?.flag}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Action
          </p>
          <p className="text-lg text-gray-900 font-medium">
            {dbResult?.flag === "insert" && "Added"}
            {dbResult?.flag === "reject" && "Rejected"}
            {dbResult?.flag === "human_review" && "Need Human Review"}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Details
          </p>
          <p className="text-gray-700 leading-relaxed">{dbResult?.reason}</p>
        </div>
      </div>
    </div>
  );
}

export default DbStatusCard;
