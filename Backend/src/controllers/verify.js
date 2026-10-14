import alpha from "../agent/alpha.js";
import beta from "../agent/beta.js";
import { findCachedVerdict } from "../utils/semanticCache.js";
import buildResultPayload from "../utils/resultPayload.js";
import History from "../models/History.js";
import GuestResult from "../models/GuestResult.js";
import Review from "../models/Review.js";
import { getIsMongoConnected } from "../config/mongo.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidGuestId(id) {
  return typeof id === "string" && UUID_REGEX.test(id.trim());
}

// In-memory stats
let totalRequests = 0;
let cacheHits = 0;
let totalCachedMs = 0;
let totalFreshMs = 0;

export const getStats = (req, res) => {
  const avgCachedMs = cacheHits > 0 ? Math.round(totalCachedMs / cacheHits) : 0;
  const freshCount = totalRequests - cacheHits;
  const avgFreshMs = freshCount > 0 ? Math.round(totalFreshMs / freshCount) : 0;

  return res.status(200).json({
    total: totalRequests,
    cacheHits,
    avgCachedMs,
    avgFreshMs,
  });
};

async function saveHistoryQuietly(userId, payload) {
  try {
    if (userId && getIsMongoConnected()) {
      await History.create({
        userId,
        query: payload.query,
        claim: payload.data?.claim || payload.query,
        result: payload.data,
        cached: Boolean(payload.cached),
        origin: payload.origin,
        verifiedAt: payload.verifiedAt ? new Date(payload.verifiedAt) : null,
        matchedClaim: payload.matchedClaim || null,
        tookMs: payload.took_ms || 0,
      });
    }
  } catch (error) {
    console.warn("Failed to record history:", error.message);
  }
}

async function saveGuestResultQuietly(guestId, payload) {
  try {
    if (guestId && getIsMongoConnected()) {
      const count = await GuestResult.countDocuments({ guestId });
      if (count < 5) {
        await GuestResult.create({
          guestId,
          query: payload.query,
          claim: payload.data?.claim || payload.query,
          result: payload.data,
          cached: Boolean(payload.cached),
          origin: payload.origin,
          verifiedAt: payload.verifiedAt ? new Date(payload.verifiedAt) : null,
          matchedClaim: payload.matchedClaim || null,
          tookMs: payload.took_ms || 0,
        });
      }
    }
  } catch (error) {
    console.warn("Failed to record guest result:", error.message);
  }
}

async function runServerBeta(alpha_response) {
  try {
    const betaResult = await beta(alpha_response);
    if (betaResult?.flag === "human_review" && getIsMongoConnected()) {
      await Review.create({
        claim: alpha_response?.data?.claim || "",
        aiResult: alpha_response?.data,
        existingMatches: betaResult?.existingMatches || [],
        reason: betaResult?.reason || "",
        status: "pending",
      });
      console.log(`[${new Date().toISOString()}] review queued (human_review)`);
    }
  } catch (error) {
    console.error("Server-side beta execution failed:", error.message);
  }
}

export const verifyAlpha = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Query is required",
      });
    }

    const obj = {
      apiKey: process.env.GOOGLE_API_KEY,
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      query,
    };

    const alpha_response = await alpha(obj);

    return res.status(200).json(alpha_response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Alpha verification failed",
    });
  }
};

export const verifyAlphaStream = async (req, res) => {
  const now = () => new Date().toISOString();
  console.log(`[${now()}] stream start`);

  const { query } = req.body;

  if (!query) {
    return res.status(400).json({
      success: false,
      error: "Query is required",
    });
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
  });
  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }

  const controller = new AbortController();
  const { signal } = controller;
  const startTime = Date.now();

  const sendEvent = (event, data) => {
    if (!res.writableEnded) {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    }
  };

  // 15-second heartbeat ping
  const heartbeatTimer = setInterval(() => {
    if (!res.writableEnded) {
      res.write(": ping\n\n");
    }
  }, 15000);

  // Global 60-second timeout guard
  const timeoutTimer = setTimeout(() => {
    if (!res.writableEnded) {
      console.log(`[${now()}] stream timeout (60s limit reached)`);
      sendEvent("error", { error: "Verification timed out after 60s. Please try again." });
      cleanup();
      controller.abort();
      res.end();
    }
  }, 60000);

  let isCleanedUp = false;
  const cleanup = () => {
    if (isCleanedUp) return;
    isCleanedUp = true;
    clearInterval(heartbeatTimer);
    clearTimeout(timeoutTimer);
    console.log(`[${now()}] stream end`);
  };

  res.on("close", () => {
    cleanup();
    if (!res.writableEnded) {
      console.log(`[${now()}] client disconnected`);
      controller.abort();
    }
  });

  try {
    // 1. Check semantic cache
    sendEvent("progress", { stage: "checking_cache" });
    if (process.env.SEMANTIC_CACHE === "off") {
      console.log(`[${now()}] cache skipped (disabled)`);
    } else {
      console.log(`[${now()}] cache check start`);
    }

    const cacheResult = await findCachedVerdict(query, { signal });

    if (signal.aborted) {
      console.log(`[${now()}] aborted during cache check`);
      cleanup();
      if (!res.writableEnded) res.end();
      return;
    }

    if (cacheResult.hit) {
      console.log(`[${now()}] cache hit`);
      const took_ms = Date.now() - startTime;
      totalRequests++;
      cacheHits++;
      totalCachedMs += took_ms;

      // Refund quota on cache hit
      req.refundQuota?.();

      const guestHeader = req.headers["x-guest-id"];
      const validGuestId = isValidGuestId(guestHeader) ? guestHeader.trim() : null;

      const resultPayload = buildResultPayload({
        alphaResponse: cacheResult.data,
        query,
        cacheHit: cacheResult,
        tookMs: took_ms,
        guestRemaining:
          req.guestRemaining !== undefined && !req.user?.id
            ? req.guestRemaining
            : undefined,
      });

      sendEvent("result", resultPayload);

      console.log(`[${now()}] result sent (cached)`);
      cleanup();
      if (!res.writableEnded) res.end();

      // Record history for authenticated user or guest
      if (req.user?.id) {
        saveHistoryQuietly(req.user.id, resultPayload);
      } else if (validGuestId) {
        saveGuestResultQuietly(validGuestId, resultPayload);
      }
      return;
    }

    console.log(`[${now()}] cache miss`);

    // 2. Run alpha agent
    console.log(`[${now()}] alpha start`);
    const obj = {
      apiKey: process.env.GOOGLE_API_KEY,
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      query,
      signal,
      onProgress: (stage) => {
        console.log(`[${now()}] stage: ${stage}`);
        sendEvent("progress", { stage });
      },
    };

    const alpha_response = await alpha(obj);

    if (signal.aborted) {
      console.log(`[${now()}] aborted after alpha`);
      cleanup();
      if (!res.writableEnded) res.end();
      return;
    }

    const took_ms = Date.now() - startTime;

    if (!alpha_response.success) {
      console.log(`[${now()}] alpha failed: ${alpha_response.error}`);
      sendEvent("error", { error: alpha_response.error || "Alpha verification failed" });
      cleanup();
      if (!res.writableEnded) res.end();
      return;
    }

    console.log(`[${now()}] alpha success`);
    totalRequests++;
    totalFreshMs += took_ms;

    const guestHeader = req.headers["x-guest-id"];
    const validGuestId = isValidGuestId(guestHeader) ? guestHeader.trim() : null;

    const resultPayload = buildResultPayload({
      alphaResponse: alpha_response,
      query,
      cacheHit: null,
      tookMs: took_ms,
      guestRemaining:
        req.guestRemaining !== undefined && !req.user?.id
          ? req.guestRemaining
          : undefined,
    });

    sendEvent("result", resultPayload);
    console.log(`[${now()}] result sent`);

    cleanup();
    if (!res.writableEnded) res.end();

    // 3. Record history for authenticated user or guest
    if (req.user?.id) {
      saveHistoryQuietly(req.user.id, resultPayload);
    } else if (validGuestId) {
      saveGuestResultQuietly(validGuestId, resultPayload);
    }

    // 4. Server-side beta save
    if (!signal.aborted && alpha_response?.data) {
      runServerBeta(alpha_response);
    }
  } catch (error) {
    cleanup();
    if (signal.aborted || error.name === "AbortError") {
      console.log(`[${now()}] request aborted`);
      if (!res.writableEnded) res.end();
      return;
    }

    console.log(`[${now()}] stream error: ${error.message}`);
    sendEvent("error", { error: error.message || "Alpha verification failed" });
    if (!res.writableEnded) res.end();
  }
};
