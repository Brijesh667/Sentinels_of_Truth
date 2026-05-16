import { tavily } from "@tavily/core";
import * as dotenv from "dotenv";

dotenv.config();

const tvly = tavily({
  apiKey: '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'
  // apiKey: process.env.TAVILY_API_KEY
});

export default async function search(query) {
  try {
    const response = await tvly.search(query);

    return {
      success: true,
      sources: response.results.map((item) => ({
        title: item.title,
        content: item.content,
        url: item.url
      }))
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}