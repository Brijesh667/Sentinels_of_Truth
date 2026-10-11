import { tavily } from "@tavily/core";
import * as dotenv from "dotenv";

dotenv.config();

const tvly = tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

export default async function search(query, maxResults = 3, signal) {
  if (!query?.trim()) {
    return {
      success: false,
      error: "Query is required",
    };
  }

  if (signal?.aborted) {
    const err = new Error("Aborted");
    err.name = "AbortError";
    throw err;
  }

  try {
    const { results = [] } = await tvly.search(query, {
      max_results: maxResults,
      search_depth: "basic",
      signal,
    });

    if (signal?.aborted) {
      const err = new Error("Aborted");
      err.name = "AbortError";
      throw err;
    }

    return {
      success: true,
      sources: results.map(({ title, content, url }) => ({
        title,
        content,
        url,
      })),
    };
  } catch (error) {
    if (signal?.aborted || error.name === "AbortError") {
      const err = new Error("Aborted");
      err.name = "AbortError";
      throw err;
    }
    return {
      success: false,
      error: error.message || "Search failed",
    };
  }
}