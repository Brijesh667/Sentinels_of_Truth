// alpha_model.js
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, generateObject, tool } from "ai";
import { z } from "zod";
import search from "../utils/web_search_tool.js";
import date_time from "../utils/Date_time.js";
import beta from "./beta.js";

const agentSystemInstruction = `
You are a Fact Verification Agent.

Decide whether the user query is:

1. Casual / non-factual
2. A verifiable factual claim

Casual examples:
hi, hello, how are you, joke, who are you

For casual queries:
- Do not use tools
- Reply normally that you only verify factual claims

For factual claims:
- Use tools when needed
- Use search for fact verification
- Use date_time only when time context matters
- Prefer reliable sources

Rules:
- Never guess
- Never hallucinate
- Never fabricate
- Only verify using evidence
`;

const finalSystemInstruction = `
Return ONLY valid JSON in this exact format:

{
  "claim": "string",
  "verification_status": "verified or fake",
  "summary": "string",
  "sources": ["url1", "url2"], 
  "confidence": number
}
Note: sources should have original source link, correct link, 
Rules:
- No markdown
- No explanation
- No extra text
- claim = original user query
- verification_status = only "verified" or "fake"
- confidence = 0 to 100

Note: ensure that claim, verification_status, summary, sources and confidence every field should have value, return complete full object 
`;

const verificationSchema = z.object({
  claim: z.string().min(1),
  verification_status: z.enum(["verified", "fake"]),
  summary: z.string().min(10),
  sources: z.array(z.string().url()),
  confidence: z.number().min(0).max(100)
});

/**
 * FUNCTION 1
 */
async function alphaDecision({ apiKey, model, query }) {
  try {
    console.log("first function called");
    

    const provider = createGoogleGenerativeAI({
      apiKey
    });

    const result = await generateText({
      model: provider(model),
      system: agentSystemInstruction,
      prompt: query,

      tools: {
        search: tool({
          description: "Search the web for fact verification.",
          inputSchema: z.object({
            query: z.string()
          }),
          execute: async ({ query }) => {
            // FIXED
            return await search(query);
          }
        }),

        date_time: tool({
          description: "Returns current local date and time.",
          inputSchema: z.object({}),
          execute: async () => {
            return await date_time();
          }
        })
      },

      maxSteps: 3
    });

    // casual query
    if (!result.toolResults || result.toolResults.length === 0) {
      return {
        success: true,
        call_function: false,
        response:
          result.text ||
          "I am a fact verification agent and only verify factual claims."
      };
    }

    // Extract clean URLs from tool output
    const extractedUrls = [];

    for (const toolResult of result.toolResults) {
      const output = toolResult.output;

      if (!output || output.success === false) continue;

      // common patterns
      if (Array.isArray(output.sources)) {
        for (const source of output.sources) {
          if (typeof source === "string" && source.startsWith("http")) {
            extractedUrls.push(source);
          }

          if (
            typeof source === "object" &&
            source.url &&
            typeof source.url === "string"
          ) {
            extractedUrls.push(source.url);
          }

          if (
            typeof source === "object" &&
            source.link &&
            typeof source.link === "string"
          ) {
            extractedUrls.push(source.link);
          }
        }
      }

      if (Array.isArray(output.results)) {
        for (const item of output.results) {
          if (item.url && typeof item.url === "string") {
            extractedUrls.push(item.url);
          }

          if (item.link && typeof item.link === "string") {
            extractedUrls.push(item.link);
          }
        }
      }
    }

    // factual query
    return {
      success: true,
      call_function: true,
      original_query: query,
      response: {
        toolResults: result.toolResults,
        extractedUrls: [...new Set(extractedUrls)]
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error.message || "Alpha decision failed"
    };
  }
}

/**
 * FUNCTION 2
 */
async function finalVerifier({ apiKey, model, original_query, response }) {
  try {
    console.log("second function called");

    const provider = createGoogleGenerativeAI({
      apiKey
    });

    const result = await generateObject({
      model: provider(model),
      schema: verificationSchema,
      system: `
${finalSystemInstruction}

IMPORTANT:
Use ONLY URLs from extractedUrls field for sources.
Never invent URLs.
If extractedUrls exists, sources must come only from that list.
`,

      prompt: `
Original Query:
${original_query}

Fetched Evidence:
${JSON.stringify(response, null, 2)}
`
    });

    return {
      success: true,
      data: result.object
    };

  } catch (error) {
    return {
      success: false,
      error: error.message || "Final verification failed"
    };
  }
}

/**
 * MAIN FUNCTION
 */
export default async function alpha(obj) {
  try {
    const { apiKey, model, query } = obj;

    if (!apiKey || !model || !query) {
      return {
        success: false,
        error: "apiKey, model and query are required"
      };
    }

    const alpha = await alphaDecision({
      apiKey,
      model,
      query
    });

    if (!alpha.success) {
      return alpha;
    }

    if (!alpha.call_function) {
      return alpha;
    }

    return await finalVerifier({
      apiKey,
      model,
      original_query: alpha.original_query,
      response: alpha.response
    });

  } catch (error) {
    return {
      success: false,
      error: error.message || "Unexpected error"
    };
  }
}

// async function alpha(obj) {
//   const ans = await StartChat(obj);
//   console.log(ans);
//   const res = await beta(ans);

 
// }
// const alpha = async(req,res)=>{
//   const ans = req.body;
  
// }
// export default alpha;


