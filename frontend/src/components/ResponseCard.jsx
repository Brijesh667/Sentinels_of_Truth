function ResponseCard({ result, loading }) {
  if (loading) {
    return (
      <div className="mt-8 bg-white p-8 rounded-2xl shadow-lg">
        <div className="flex items-center justify-center gap-3">
          <div className="w-5 h-5 bg-blue-500 rounded-full animate-pulse"></div>
          <p className="text-center text-gray-600 font-medium">Checking fact...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  if (result.response) {
    return (
      <div className="mt-8 bg-white p-8 rounded-2xl shadow-lg border-l-4 border-yellow-500">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Response</h2>
        <p className="text-gray-700 leading-relaxed">{result.response}</p>
      </div>
    );
  }

  if (result.data) {
    const isReal =
      result.data.verification_status?.toLowerCase() === "true" ||
      result.data.verification_status?.toLowerCase() === "real";

    const statusColor = isReal
      ? "bg-green-100 text-green-800 border-green-300"
      : "bg-red-100 text-red-800 border-red-300";

    const statusBgColor = isReal ? "border-green-500" : "border-red-500";

    const confidenceColor =
      result.data.confidence >= 70
        ? "bg-green-500"
        : result.data.confidence >= 40
        ? "bg-yellow-500"
        : "bg-red-500";

    return (
      <div className={`mt-8 bg-white p-8 rounded-2xl shadow-lg border-l-4 ${statusBgColor}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Verification Result</h2>
          <span className={`px-4 py-2 rounded-full font-semibold text-sm border ${statusColor}`}>
            {result.data.verification_status}
          </span>
        </div>

        <div className="space-y-5">
          {/* Claim */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Claim
            </p>
            <p className="text-gray-900 font-medium text-lg">{result.data.claim}</p>
          </div>

          
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Confidence Score
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full ${confidenceColor} transition-all duration-500`}
                  style={{ width: `${result.data.confidence}%` }}
                ></div>
              </div>
              <span className="text-2xl font-bold text-gray-900 min-w-fit">
                {result.data.confidence}%
              </span>
            </div>
          </div>

          
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Summary
            </p>
            <p className="text-gray-700 leading-relaxed">{result.data.summary}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Sources
            </p>
            {result?.data?.sources?.length > 0 ? (
              <div className="space-y-2">
                {result.data.sources.map((source, index) => (
                  <a
                    key={index}
                    href={source}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors group"
                  >
                    <span className="text-blue-600 text-xl">🔗</span>
                    <span className="text-blue-600 text-sm truncate group-hover:underline flex-1">
                      {source}
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic bg-gray-50 p-3 rounded-lg">
                No sources available
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default ResponseCard;
