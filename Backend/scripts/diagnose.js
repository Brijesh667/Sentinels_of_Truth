import path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

import { GoogleGenAI } from "@google/genai";
import { Pinecone } from "@pinecone-database/pinecone";
import { tavily } from "@tavily/core";
import mongoose from "mongoose";
import embedded from "../src/utils/embedded.js";

function getFirstLine(error) {
  if (!error) return "Unknown error";
  const msg = error.message || String(error);
  return msg.split("\n")[0].trim();
}

async function withTimeout(promise, ms, label) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function main() {
  console.log("=== SENTINELS OF TRUTH — SYSTEM DIAGNOSTIC ===\n");
  const results = [];

  // 1. Env Presence Check
  const envVars = [
    "GOOGLE_API_KEY",
    "PINECONE_API_KEY",
    "PINECONE_INDEX_NAME",
    "TAVILY_API_KEY",
    "MONGODB_URI",
    "CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
    "GEMINI_MODEL",
  ];

  console.log("1. Environment Variables:");
  for (const v of envVars) {
    const isSet = Boolean(process.env[v] && process.env[v].trim());
    console.log(`   - ${v}: ${isSet ? "set" : "MISSING"}`);
  }
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  console.log(`   - Effective LLM Model: "${modelName}"\n`);

  // 2. Gemini generateContent
  console.log(`2. Testing Gemini LLM ("${modelName}")...`);
  const tStartGemini = Date.now();
  let geminiSupportedModels = [];
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
    const response = await withTimeout(
      ai.models.generateContent({
        model: modelName,
        contents: "reply with OK",
      }),
      15000,
      "Gemini generateContent"
    );
    const duration = Date.now() - tStartGemini;
    console.log(`   [PASS] Gemini responded in ${duration}ms`);
    results.push({ check: "Gemini LLM", status: "PASS", timing: `${duration}ms` });
  } catch (err) {
    const duration = Date.now() - tStartGemini;
    const firstLine = getFirstLine(err);
    console.log(`   [FAIL] Gemini failed in ${duration}ms: ${firstLine}`);
    results.push({ check: "Gemini LLM", status: "FAIL", timing: `${duration}ms`, error: firstLine });

    // If 404 or model not found, query models list
    if (firstLine.includes("404") || firstLine.toLowerCase().includes("not found")) {
      try {
        console.log("   Attempting to list available models...");
        const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
        const list = await withTimeout(ai.models.list(), 10000, "List models");
        for await (const m of list) {
          const name = m.name?.replace(/^models\//, "");
          const actions = m.supportedActions || m.supportedGenerationMethods || [];
          if (actions.length === 0 || actions.some((a) => a.includes("generateContent"))) {
            if (name) geminiSupportedModels.push(name);
          }
        }
        console.log(`   Available generateContent models: ${geminiSupportedModels.slice(0, 15).join(", ")}`);
      } catch (listErr) {
        console.log(`   Could not list models: ${getFirstLine(listErr)}`);
      }
    }
  }

  // 3. Embedding Test
  console.log("\n3. Testing Embedding (embedded util)...");
  const tStartEmbed = Date.now();
  try {
    const vector = await withTimeout(embedded("test embedding claim"), 15000, "Embedding");
    const duration = Date.now() - tStartEmbed;
    const dims = Array.isArray(vector) ? vector.length : 0;
    if (dims === 768) {
      console.log(`   [PASS] Embedding returned ${dims} dimensions in ${duration}ms`);
      results.push({ check: "Embedding (768 dims)", status: "PASS", timing: `${duration}ms` });
    } else {
      console.log(`   [FAIL] Expected 768 dimensions but got ${dims} in ${duration}ms`);
      results.push({ check: "Embedding", status: "FAIL", timing: `${duration}ms`, error: `Got ${dims} dims` });
    }
  } catch (err) {
    const duration = Date.now() - tStartEmbed;
    const firstLine = getFirstLine(err);
    console.log(`   [FAIL] Embedding failed in ${duration}ms: ${firstLine}`);
    results.push({ check: "Embedding", status: "FAIL", timing: `${duration}ms`, error: firstLine });
  }

  // 4. Pinecone describeIndexStats
  console.log("\n4. Testing Pinecone index...");
  const tStartPinecone = Date.now();
  try {
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);
    const stats = await withTimeout(index.describeIndexStats(), 15000, "Pinecone stats");
    const duration = Date.now() - tStartPinecone;
    console.log(`   [PASS] Pinecone stats in ${duration}ms: dimension=${stats.dimension}, totalVectors=${stats.totalRecordCount ?? stats.totalVectorCount ?? 0}`);
    results.push({
      check: "Pinecone",
      status: "PASS",
      timing: `${duration}ms`,
      detail: `dim: ${stats.dimension}, vectors: ${stats.totalRecordCount ?? stats.totalVectorCount ?? 0}`,
    });
  } catch (err) {
    const duration = Date.now() - tStartPinecone;
    const firstLine = getFirstLine(err);
    console.log(`   [FAIL] Pinecone failed in ${duration}ms: ${firstLine}`);
    results.push({ check: "Pinecone", status: "FAIL", timing: `${duration}ms`, error: firstLine });
  }

  // 5. Tavily Search
  console.log("\n5. Testing Tavily search...");
  const tStartTavily = Date.now();
  try {
    const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
    const searchRes = await withTimeout(
      tvly.search("test claim verification", { max_results: 1, search_depth: "basic" }),
      15000,
      "Tavily search"
    );
    const duration = Date.now() - tStartTavily;
    const count = searchRes.results?.length ?? 0;
    console.log(`   [PASS] Tavily returned ${count} result(s) in ${duration}ms`);
    results.push({ check: "Tavily Search", status: "PASS", timing: `${duration}ms` });
  } catch (err) {
    const duration = Date.now() - tStartTavily;
    const firstLine = getFirstLine(err);
    console.log(`   [FAIL] Tavily failed in ${duration}ms: ${firstLine}`);
    results.push({ check: "Tavily Search", status: "FAIL", timing: `${duration}ms`, error: firstLine });
  }

  // 6. MongoDB Ping
  console.log("\n6. Testing MongoDB connection...");
  const tStartMongo = Date.now();
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI not set in environment");
    }
    mongoose.set("bufferCommands", false);
    await withTimeout(
      mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 3000 }),
      3000,
      "Mongo connect"
    );
    await withTimeout(mongoose.connection.db.admin().ping(), 3000, "Mongo ping");
    const duration = Date.now() - tStartMongo;
    console.log(`   [PASS] MongoDB ping successful in ${duration}ms`);
    results.push({ check: "MongoDB", status: "PASS", timing: `${duration}ms` });
    await mongoose.disconnect();
  } catch (err) {
    const duration = Date.now() - tStartMongo;
    const firstLine = getFirstLine(err);
    console.log(`   [FAIL] MongoDB failed in ${duration}ms: ${firstLine}`);
    results.push({ check: "MongoDB", status: "FAIL", timing: `${duration}ms`, error: firstLine });
    try {
      await mongoose.disconnect();
    } catch {}
  }

  // Summary Table
  console.log("\n=== DIAGNOSTIC SUMMARY ===");
  console.table(
    results.map((r) => ({
      Component: r.check,
      Status: r.status,
      Time: r.timing,
      Note: r.error || r.detail || "OK",
    }))
  );

  process.exit(0);
}

main().catch((err) => {
  console.error("Diagnostic script error:", getFirstLine(err));
  process.exit(1);
});
