import pineconeIndex from "../config/dataBase.js";
import crypto from "crypto";

function generateId(claim) {
  const normalizedClaim = claim
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");

  return crypto.createHash("sha256").update(normalizedClaim).digest("hex");
}
export default async function insertIntoPinecone(vector, alpha_response) {
  const id = generateId(alpha_response.data.claim);

  await pineconeIndex.upsert([
    {
      id,
      values: vector,
      metadata: {
        claim: alpha_response.data.claim,
        verification_status: alpha_response.data.verification_status,
        summary: alpha_response.data.summary,
        confidence: alpha_response.data.confidence,
        sources: JSON.stringify(alpha_response.data.sources || []),
        raw_data: JSON.stringify(alpha_response.data),
      },
    },
  ]);
}