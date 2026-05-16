import { GoogleGenAI } from "@google/genai";
import StartChat from "./alpha.js";
import pineconeIndex from "../config/dataBase.js";
import insertIntoPinecone from "../utils/SaveResponse.js";
import embedded from "../utils/embedded.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

async function getDecisionFromLLM(alpha_response, existingMatches) {
  const decision = await ai.models.generateContent({
    model: "gemini-2.5-flash",

    contents: `
You are a fact verification decision engine.

NEW RESPONSE:
${JSON.stringify(alpha_response.data)}

EXISTING VECTOR DB MATCHES:
${JSON.stringify(existingMatches)}

Rules:
1. If same claim / same meaning / same verdict -> reject
2. If contradictory meaning or verdict -> human_review
3. If genuinely new information -> insert
`,

    config: {
      responseMimeType: "application/json",

      responseSchema: {
        type: "OBJECT",
        properties: {
          flag: {
            type: "STRING",
            enum: ["insert", "reject", "human_review"]
          },
          reason: {
            type: "STRING"
          }
        },
        required: ["flag", "reason"]
      }
    }
  });

  return JSON.parse(decision.text);
}

async function processAlphaResponse(alpha_response) {
const textToEmbed = `
Claim: ${alpha_response.data.claim}
Status: ${alpha_response.data.verification_status}
Summary: ${alpha_response.data.summary}
`;

  const vector = await embedded(textToEmbed);

  // STEP 3: search pinecone
  const searchResult = await pineconeIndex.query({
    topK: 5,
    vector,
    includeMetadata: true,
  });

  // STEP 4: if no match -> direct insert
  if (searchResult.matches.length === 0) {
    await insertIntoPinecone(vector, alpha_response);

    return {
      flag: "insert",
      reason: "No similar vectors found",
    };
  }

  // STEP 5: extract useful metadata
  const existingMatches = searchResult.matches.map((match) => ({
    score: match.score,
    claim: match.metadata.claim,
    verification_status: match.metadata.verification_status,
    summary: match.metadata.summary,
    confidence: match.metadata.confidence,
  }));

  // STEP 6: ask LLM
  const decision = await getDecisionFromLLM(
    alpha_response,
    existingMatches
  );

  // STEP 7: action
  if (decision.flag === "insert") {
    await insertIntoPinecone(vector, alpha_response);
    console.log('data saved')
  }

  if (decision.flag === "reject") {
    return decision;
  }

  if (decision.flag === "human_review") {
    return decision;
  }

  return decision;
}



export default async function beta(obj) {
  console.log('beta called')
    const result = await processAlphaResponse(obj);
    return result;
}
