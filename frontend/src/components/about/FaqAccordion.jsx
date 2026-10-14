export default function FaqAccordion({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-3 w-full">
      {items.map((item, idx) => (
        <details
          key={idx}
          className="group bg-surface border border-line rounded-2xl transition-colors duration-200 overflow-hidden"
        >
          <summary className="flex items-center justify-between p-5 sm:p-6 cursor-pointer list-none select-none text-left font-bold text-fg text-sm sm:text-base hover:bg-surface-2/60 transition-colors">
            <span className="pr-4">{item.q}</span>
            <span className="text-fg-muted group-hover:text-primary transition-transform duration-200 group-open:rotate-180 flex-none">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </span>
          </summary>
          <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-fg-muted leading-relaxed border-t border-line/60 pt-4">
            {item.a}
          </div>
        </details>
      ))}
    </div>
  );
}
