function SuggestionDropdown({ suggestions, onSelectSuggestion }) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-2 z-50 max-h-60 overflow-y-auto">
      {suggestions?.map((item, index) => {
       
        const displayText =
          typeof item === "string" ? item : item?.text || item?.data || "";

        return (
          <div
            key={index}
            onClick={() => onSelectSuggestion(item)}
            className="px-4 py-3 cursor-pointer hover:bg-gray-100 text-sm text-gray-700 border-b border-gray-100 last:border-b-0"
          >
            {displayText}
          </div>
        );
      })}
    </div>
  );
}

export default SuggestionDropdown;
