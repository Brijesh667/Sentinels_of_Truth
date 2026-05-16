import * as dotenv from "dotenv";
dotenv.config();
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export default async function embedded(textToEmbed) {
  const embedResult = await ai.models.embedContent({
    model: "gemini-embedding-2",
    contents: textToEmbed,
    config: {
      outputDimensionality: 768,
    },
  });

  return embedResult.embeddings[0].values;
}   