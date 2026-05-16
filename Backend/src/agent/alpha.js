import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, generateObject, tool } from "ai";
import { z } from "zod";
import search from "../utils/web_search_tool.js";
import date_time from "../utils/Date_time.js";

const agentSystemInstruction = `
You are a professional Fact Verification Agent.

Task:
1. Detect if user input is casual conversation or a factual claim.

Casual examples:
- hi
- hello
- how are you
- tell me a joke

Rules:
- For casual queries, do not use tools.
- Reply that you only verify factual claims.
- For factual claims, use tools when needed.
- Use only retrieved evidence.

`;

const finalSystemInstruction = `
You are a fact verification engine.

Return ONLY valid JSON:

{
  "claim": "string",
  "verification_status": "verified" or "fake",
  "summary": "string",
  "sources": ["https://example.com"],
  "confidence": number
}

Rules:
- JSON only
- No markdown
- No explanation
- claim must be original query
- verification_status only "verified" or "fake"
- confidence between 0 and 100
- summary based only on retrieved evidence
- sources must use URLs only
Note: sources must contain original url link
`;

const verificationSchema = z.object({
  claim: z.string().min(1),
  verification_status: z.enum(["verified", "fake"]),
  summary: z.string().min(10),
  sources: z.array(z.string()),
  confidence: z.number().min(0).max(100),
});

function extractUrlsFromAnyShape(obj) {
  const urls = [];

  function walk(value) {
    if (!value) return;

    if (typeof value === "string") {
      if (value.startsWith("http")) {
        urls.push(value.trim());
      }
      return;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        walk(item);
      }
      return;
    }

    if (typeof value === "object") {
      if (typeof value.url === "string" && value.url.startsWith("http")) {
        urls.push(value.url.trim());
      }

      if (typeof value.link === "string" && value.link.startsWith("http")) {
        urls.push(value.link.trim());
      }

      if (typeof value.href === "string" && value.href.startsWith("http")) {
        urls.push(value.href.trim());
      }

      for (const key in value) {
        walk(value[key]);
      }
    }
  }

  walk(obj);

  return [...new Set(urls)];
}

async function alphaDecision({ apiKey, model, query }) {
  try {
    const provider = createGoogleGenerativeAI({ apiKey });

    const result = await generateText({
      model: provider(model),
      system: agentSystemInstruction,
      prompt: query,

      tools: {
        search: tool({
          description: "Search the web for fact verification.",
          inputSchema: z.object({
            query: z.string(),
          }),
          execute: async ({ query }) => {
            return await search(query);
          },
        }),

        date_time: tool({
          description: "Returns current local date and time.",
          inputSchema: z.object({}),
          execute: async () => {
            return await date_time();
          },
        }),
      },

      maxSteps: 3,
    });

    if (!result.toolResults || result.toolResults.length === 0) {
      return {
        success: true,
        call_function: false,
        response:
          result.text ||
          "I am a fact verification agent and only verify factual claims.",
      };
    }

    const extractedUrls = extractUrlsFromAnyShape(result.toolResults);

    

    return {
      success: true,
      call_function: true,
      original_query: query,
      response: {
        extractedUrls,
        toolResults: result.toolResults,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Alpha decision failed",
    };
  }
}

async function finalVerifier({
  apiKey,
  model,
  original_query,
  response,
}) {
  try {
    const provider = createGoogleGenerativeAI({ apiKey });

    const result = await generateObject({
      model: provider(model),
      schema: verificationSchema,

      system: `
${finalSystemInstruction}

STRICT RULE:
Use ONLY these URLs in sources:
${JSON.stringify(response.extractedUrls)}
`,

      prompt: `
Original Query:
${original_query}

Evidence:
${JSON.stringify(response.toolResults, null, 2)}
`,
    });

    return {
      success: true,
      data: result.object,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Final verification failed",
    };
  }
}

export default async function alpha(obj) {
  try {
    const { apiKey, model, query } = obj;

    if (!apiKey || !model || !query) {
      return {
        success: false,
        error: "apiKey, model and query are required",
      };
    }

    const alphaResult = await alphaDecision({
      apiKey,
      model,
      query,
    });

    if (!alphaResult.success) {
      return alphaResult;
    }

    if (!alphaResult.call_function) {
      return alphaResult;
    }

    return await finalVerifier({
      apiKey,
      model,
      original_query: alphaResult.original_query,
      response: alphaResult.response,
    });
  } catch (error) {
    return {
      success: false,
      error: error.message || "Unexpected error",
    };
  }
} 