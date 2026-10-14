export default function SuggestionDropdown({
  suggestions,
  onSelectSuggestion,
  onSelect,
}) {
  const handleSelect = onSelectSuggestion || onSelect;

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div
      role="listbox"
      aria-label="Fact suggestions"
      className="absolute top-full left-0 w-full bg-surface border border-line rounded-xl shadow-lg mt-2 z-50 max-h-60 overflow-y-auto transition-colors"
    >
      {suggestions.map((item, index) => {
        const displayText =
          typeof item === "string"
            ? item
            : item?.text ||
              (typeof item?.data === "string"
                ? item.data
                : item?.data?.claim || "");

        const triggerSelect = (e) => {
          if (e) {
            e.preventDefault();
            e.stopPropagation();
          }
          if (typeof handleSelect === "function") {
            handleSelect(item);
          }
        };

        return (
          <div
            key={index}
            role="option"
            tabIndex={0}
            onMouseDown={triggerSelect}
            onClick={triggerSelect}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                triggerSelect(e);
              }
            }}
            className="px-4 py-3 cursor-pointer hover:bg-surface-2 focus:bg-surface-2 focus:outline-hidden text-sm text-fg border-b border-line last:border-b-0 transition-colors min-h-[44px] flex items-center select-none"
          >
            {displayText}
          </div>
        );
      })}
    </div>
  );
}
