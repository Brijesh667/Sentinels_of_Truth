import "../config/env.js";
import { tavily } from "@tavily/core";

let tvlyClient = null;

function getTavily() {
  if (!tvlyClient) {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
      throw new Error("No API key provided. Please set the TAVILY_API_KEY environment variable.");
    }
    tvlyClient = tavily({ apiKey });
  }
  return tvlyClient;
}

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
    const client = getTavily();
    const { results = [] } = await client.search(query, {
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
      error: error.message || "Tavily search failed",
    };
  }
}
