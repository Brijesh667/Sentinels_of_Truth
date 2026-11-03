import { getPublisherInfo } from "../../utils/publishers.js";

function parseSourceUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  try {
    const url = new URL(rawUrl.trim());
    if (url.protocol === "http:" || url.protocol === "https:") {
      const fullPath = url.pathname + url.search;
      const truncatedPath =
        fullPath.length > 34 ? fullPath.slice(0, 31) + "..." : fullPath;
      const publisher = getPublisherInfo(url.hostname);

      return {
        href: url.href,
        hostname: publisher.hostname,
        publisherName: publisher.name,
        path: truncatedPath !== "/" ? truncatedPath : "",
      };
    }
  } catch {
    // ignore invalid URL
  }
  return null;
}

export default function SourceList({ sources = [], className = "" }) {
  if (!Array.isArray(sources) || sources.length === 0) {
    return null;
  }

  const validSources = sources.map(parseSourceUrl).filter(Boolean);

  if (validSources.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
        Sources ({validSources.length})
      </h3>
      {/* Two-column grid on desktop, 1 column on mobile. Equal card heights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {validSources.map((source, idx) => (
          <a
            key={`${source.href}-${idx}`}
            href={source.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between p-3 rounded-xl border border-line bg-surface hover:border-[var(--accent)] hover:-translate-y-[1px] motion-reduce:hover:translate-y-0 transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--accent)] shadow-2xs h-full"
          >
            <div className="min-w-0 pr-2.5 flex flex-col justify-center">
              <span className="text-sm font-semibold text-fg truncate">
                {source.publisherName}
              </span>
              <span className="text-xs text-fg-muted truncate">
                {source.hostname}{source.path}
              </span>
            </div>

            <svg
              className="w-4 h-4 text-fg-muted/70 group-hover:text-[var(--accent)] shrink-0 transition-colors duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
}
