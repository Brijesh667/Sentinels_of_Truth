import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import embedded from "./embedded.js";
import pineconeIndex from "../config/dataBase.js";

const TIME_SENSITIVE_REGEX =
  /\b(today|current|currently|latest|now|right now|this year|recent|aaj|abhi)\b/i;

const polaritySchema = z.object({
  same_claim: z.boolean(),
});

async function checkPolarity(query, cachedClaim, signal) {
  const provider = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
  });
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const result = await generateObject({
    model: provider(modelName),
    schema: polaritySchema,
    abortSignal: signal,
    system: `You compare two claims and decide if they represent the exact same claim with the exact same meaning and polarity.
Return same_claim = true ONLY if:
1. Both claims assert the exact same proposition with the same factual meaning and polarity.
2. They do NOT contradict or invert each other (e.g. "Earth is round" vs "Earth is flat" must be false).
3. They apply to the same timeframe or entity.
Otherwise return same_claim = false.`,
    prompt: `Claim 1: "${query}"\nClaim 2: "${cachedClaim}"`,
  });

  return result.object?.same_claim === true;
}

export async function findCachedVerdict(query, { signal } = {}) {
  if (process.env.SEMANTIC_CACHE === "off") {
    return { hit: false, reason: "disabled" };
  }

  if (signal?.aborted) {
    const err = new Error("Aborted");
    err.name = "AbortError";
    throw err;
  }

  if (TIME_SENSITIVE_REGEX.test(query)) {
    return { hit: false, reason: "time_sensitive" };
  }

  try {
    const textToEmbed = `Claim: ${query}`;
    const vector = await embedded(textToEmbed);

    if (signal?.aborted) {
      const err = new Error("Aborted");
      err.name = "AbortError";
      throw err;
    }

    const searchResult = await pineconeIndex.query({
      topK: 3,
      vector,
      includeMetadata: true,
    });

    if (signal?.aborted) {
      const err = new Error("Aborted");
      err.name = "AbortError";
      throw err;
    }

    const bestMatch = searchResult?.matches?.[0];
    const minScore = Number(process.env.CACHE_MIN_SCORE) || 0.85;

    if (!bestMatch || bestMatch.score < minScore) {
      return {
        hit: false,
        reason: "low_similarity",
        score: bestMatch?.score,
      };
    }

    // Safety filter 1: TTL freshness check
    const ttlDays = Number(process.env.CACHE_TTL_DAYS) || 30;
    if (bestMatch.metadata?.verified_at) {
      const verifiedTime = new Date(bestMatch.metadata.verified_at).getTime();
      if (!isNaN(verifiedTime)) {
        const ageMs = Date.now() - verifiedTime;
        if (ageMs > ttlDays * 24 * 60 * 60 * 1000) {
          return { hit: false, reason: "stale" };
        }
      }
    }

    // Safety filter 2: Confidence score
    const minConfidence = Number(process.env.CACHE_MIN_CONFIDENCE) || 80;
    const confidence = Number(bestMatch.metadata?.confidence);
    if (!isNaN(confidence) && confidence < minConfidence) {
      return { hit: false, reason: "low_confidence" };
    }

    // Safety filter 3: Reliable verification status
    const status = (bestMatch.metadata?.verification_status || "")
      .trim()
      .toLowerCase();
    const validStatuses = ["verified", "fake", "true", "real"];
    if (!validStatuses.includes(status)) {
      return { hit: false, reason: "unreliable_status" };
    }

    // Polarity guard: Cheap Gemini check
    const sameClaim = await checkPolarity(
      query,
      bestMatch.metadata?.claim,
      signal
    );

    if (!sameClaim) {
      return {
        hit: false,
        reason: "polarity_mismatch",
        score: bestMatch.score,
      };
    }

    // Parse raw_data to match alpha agent response structure exactly
    let rawData = {};
    if (bestMatch.metadata?.raw_data) {
      try {
        rawData = JSON.parse(bestMatch.metadata.raw_data);
      } catch {
        rawData = {};
      }
    }

    let sources = [];
    if (Array.isArray(rawData.sources)) {
      sources = rawData.sources;
    } else if (bestMatch.metadata?.sources) {
      try {
        sources = JSON.parse(bestMatch.metadata.sources);
        if (!Array.isArray(sources)) sources = [];
      } catch {
        sources = [];
      }
    }

    const formattedData = {
      success: true,
      data: {
        claim: rawData.claim || bestMatch.metadata?.claim || query,
        verification_status:
          rawData.verification_status || bestMatch.metadata?.verification_status,
        summary: rawData.summary || bestMatch.metadata?.summary || "",
        sources,
        confidence:
          rawData.confidence ??
          (bestMatch.metadata?.confidence !== undefined
            ? Number(bestMatch.metadata.confidence)
            : 100),
      },
    };

    return {
      hit: true,
      data: formattedData,
      score: bestMatch.score,
      matchedClaim: bestMatch.metadata?.claim,
    };
  } catch (error) {
    if (signal?.aborted || error.name === "AbortError") {
      const err = new Error("Aborted");
      err.name = "AbortError";
      throw err;
    }
    return {
      hit: false,
      reason: error.message || "cache_error",
    };
  }
}
