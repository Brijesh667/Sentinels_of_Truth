import { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";
import SuggestionDropdown from "./SuggestionDropdown";
import ResponseCard from "./ResponseCard";
import DbStatusCard from "./DbStatusCard";

function QueryForm() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [result, setResult] = useState(null);
  const [dbResult, setDbResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value;

    if (value.length <= 200) {
      setQuery(value);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    // suggestion 
    setResult({
      data: suggestion.data,
    });
    setQuery(suggestion.text);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleSubmit = async () => {
    if (!query.trim()) {
      return;
    }

    setLoading(true);
    setResult(null);
    setDbResult(null);
    setShowSuggestions(false);
    setSuggestions([]);

    try {
      //alpha response
      const response = await axiosClient.post("/get/validate", {
        query: query,
      });

      console.log("Verification response:", response.data);

      // Show verification result
      setResult(response?.data);
      setLoading(false);

      // DB call
      if (response?.data?.data) {
        try {
          const saveResponse = await axiosClient.post("/db/save", response.data);
          console.log("DB save response:", saveResponse.data);
          setDbResult(saveResponse.data);
        } catch (error) {
          console.error("DB save failed:", error.message);
        }
      } else {
        console.log("No data to save to DB");
      }
    } catch (error) {
      console.error("Verification error:", error.message);
      setResult({
        response: "Something went wrong. Please try again.",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!query || query.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await axiosClient.post("/sug/suggestion", {
          query: query,
        });

        if (response.data) {

          let suggestionsArray = [];

          if (Array.isArray(response.data)) {
            suggestionsArray = response.data;
          } else if (
            response.data.suggestions &&
            Array.isArray(response.data.suggestions)
          ) {

            suggestionsArray = response.data.suggestions.map((item) => ({
              score: item.score,
              text: item.data.claim || item.data.text || JSON.stringify(item.data),
              data: item.data,
            }));
          }

          if (suggestionsArray.length > 0) {
            setSuggestions(suggestionsArray);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      } catch (error) {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    };

    const handleClickOutside = (e) => {
      // Hide suggestions 
      if (e.target.closest(".suggestion-container") === null) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative z-10 suggestion-container">
        <textarea
          value={query}
          onChange={handleInputChange}
          placeholder="Enter your fact claim here..."
          rows="4"
          className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm md:text-base"
        />

        <div className="text-right text-xs text-gray-500 mt-2 mb-3">
          {query.length}/200
        </div>

        {showSuggestions && (
          <SuggestionDropdown
            suggestions={suggestions}
            onSelectSuggestion={handleSuggestionClick}
          />
        )}
      </div>
      <div className="flex justify-end mt-3">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="relative z-20 px-8 py-3 h-fit bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition duration-200 font-medium disabled:bg-gray-400 whitespace-nowrap"
        >
          {loading ? "Checking..." : "Verify Fact"}
        </button>
      </div>

      <ResponseCard result={result} loading={loading} />
      <DbStatusCard dbResult={dbResult} />
    </div>
  );
}

export default QueryForm;
