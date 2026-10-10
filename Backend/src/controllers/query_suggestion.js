import get_suggestion from "../utils/get_suggestion.js";

const query_suggestion = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        error: "Query is required"
      });
    }

    const result = await get_suggestion(query);

    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Suggestion fetch failed"
    });
  }
};

export default query_suggestion;