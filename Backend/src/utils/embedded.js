import "../config/env.js";
import { GoogleGenAI } from "@google/genai";

let aiClient = null;

function getAi() {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GOOGLE_API_KEY,
    });
  }
  return aiClient;
}

export default async function embedded(textToEmbed) {
  const ai = getAi();
  const embedResult = await ai.models.embedContent({
    model: "gemini-embedding-2",
    contents: textToEmbed,
    config: {
      outputDimensionality: 768,
    },
  });

  return embedResult.embeddings[0].values;
}
