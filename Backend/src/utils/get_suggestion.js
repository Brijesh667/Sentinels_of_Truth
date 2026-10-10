import embedded from "./embedded.js";
import pineconeIndex from "../config/dataBase.js";

export default async function get_suggestion(query) {
  try {
    if (!query || !query.trim()) {
      return {
        success: false,
        suggestions: [],
        error: "Query is required",
      };
    }

    const vector = await embedded(query);

    const searchResult = await pineconeIndex.query({
      topK: 10,
      vector,
      includeMetadata: true,
    });

    const suggestions = searchResult.matches.map((match) => ({
      score: match.score,
      data: JSON.parse(match.metadata.raw_data),
    }));

    return {
      success: true,
      suggestions,
    };
  } catch (error) {
    return {
      success: false,
      suggestions: [],
      error: error.message || "Suggestion fetch failed",
    };
  }
}
