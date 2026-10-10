import { tavily } from "@tavily/core";
import * as dotenv from "dotenv";

dotenv.config();

const tvly = tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

export default async function search(query, maxResults = 3) {
  if (!query?.trim()) {
    return {
      success: false,
      error: "Query is required",
    };
  }

  try {
    const { results = [] } = await tvly.search(query, {
      max_results: maxResults,
      search_depth: "basic",
    });

    return {
      success: true,
      sources: results.map(({ title, content, url }) => ({
        title,
        content,
        url,
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Search failed",
    };
  }
}