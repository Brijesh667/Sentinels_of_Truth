import crypto from "crypto";
import rateLimit from "express-rate-limit";
import Usage from "../models/Usage.js";
import { getIsMongoConnected } from "../config/mongo.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const GAP_MS = 30 * 1000;

// In-memory fallback store: key -> { count, lastAt, resetAt }
const memStore = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memStore) {
    if (now > value.resetAt) {
      memStore.delete(key);
    }
  }
}, 60 * 60 * 1000).unref();

function getUsageKey(req, isUser) {
  if (isUser && req.user?.id) {
    return `u:${req.user.id}`;
  }
  const ip = req.ip || req.socket?.remoteAddress || "127.0.0.1";
  const salt = process.env.IP_SALT || "salt";
  const hash = crypto.createHash("sha256").update(`${ip}:${salt}`).digest("hex");
  return `ip:${hash}`;
}

function verifyQuotaInMemory(req, res, next, key, limit, userLimit, isUser, now) {
  let record = memStore.get(key);
  if (!record || now > record.resetAt) {
    record = { count: 0, lastAt: 0, resetAt: now + DAY_MS };
    memStore.set(key, record);
  }

  const sinceLast = now - record.lastAt;
  if (sinceLast < GAP_MS) {
    const retryAfter = Math.ceil((GAP_MS - sinceLast) / 1000);
    res.set("Retry-After", String(retryAfter));
    return res.status(429).json({
      code: "GAP",
      error: `Please wait ${retryAfter}s before the next query.`,
      retryAfter,
    });
  }

  if (record.count >= limit) {
    return res.status(429).json({
      code: isUser ? "DAILY_LIMIT" : "LOGIN_REQUIRED",
      error: isUser
        ? `Daily limit (${userLimit}) reached. Try again tomorrow.`
        : "Free limit reached. Please login to continue.",
    });
  }

  const prevCount = record.count;
  const prevLastAt = record.lastAt;
  req.refundQuota = () => {
    record.count = prevCount;
    record.lastAt = prevLastAt;
    if (!isUser) {
      req.guestRemaining = Math.max(0, limit - record.count);
    }
  };

  record.count++;
  record.lastAt = now;
  if (!isUser) {
    req.guestRemaining = Math.max(0, limit - record.count);
  }
  next();
}

export async function verifyQuota(req, res, next) {
  const isUser = Boolean(req.user?.id);
  const key = getUsageKey(req, isUser);

  const guestLimit =
    process.env.GUEST_LIMIT !== undefined && !isNaN(Number(process.env.GUEST_LIMIT))
      ? Number(process.env.GUEST_LIMIT)
      : 2;
  const userLimit =
    process.env.USER_LIMIT !== undefined && !isNaN(Number(process.env.USER_LIMIT))
      ? Number(process.env.USER_LIMIT)
      : 20;

  const limit = isUser ? userLimit : guestLimit;
  const now = Date.now();
  const nowDate = new Date(now);

  if (!getIsMongoConnected()) {
    return verifyQuotaInMemory(req, res, next, key, limit, userLimit, isUser, now);
  }

  try {
    let record = await Usage.findOne({ key });
    if (!record || record.resetAt <= nowDate) {
      const dayLaterDate = new Date(now + DAY_MS);
      record = await Usage.findOneAndUpdate(
        {
          key,
          $or: [{ resetAt: { $lte: nowDate } }, { resetAt: { $exists: false } }],
        },
        {
          $setOnInsert: { key },
          $set: { count: 0, lastAt: new Date(0), resetAt: dayLaterDate },
        },
        { upsert: true, new: true }
      );
      if (!record) {
        record = await Usage.findOne({ key });
      }
    }

    const lastAtMs = record?.lastAt ? new Date(record.lastAt).getTime() : 0;
    const sinceLast = now - lastAtMs;
    if (sinceLast < GAP_MS) {
      const retryAfter = Math.ceil((GAP_MS - sinceLast) / 1000);
      res.set("Retry-After", String(retryAfter));
      return res.status(429).json({
        code: "GAP",
        error: `Please wait ${retryAfter}s before the next query.`,
        retryAfter,
      });
    }

    if (record.count >= limit) {
      return res.status(429).json({
        code: isUser ? "DAILY_LIMIT" : "LOGIN_REQUIRED",
        error: isUser
          ? `Daily limit (${userLimit}) reached. Try again tomorrow.`
          : "Free limit reached. Please login to continue.",
      });
    }

    // Atomic update
    const updated = await Usage.findOneAndUpdate(
      {
        key,
        count: { $lt: limit },
        lastAt: { $lte: new Date(now - GAP_MS) },
      },
      {
        $inc: { count: 1 },
        $set: { lastAt: nowDate },
      },
      { new: true }
    );

    if (!updated) {
      const fresh = await Usage.findOne({ key });
      const freshLastAtMs = fresh?.lastAt ? new Date(fresh.lastAt).getTime() : 0;
      const freshSinceLast = now - freshLastAtMs;

      if (freshSinceLast < GAP_MS) {
        const retryAfter = Math.ceil((GAP_MS - freshSinceLast) / 1000);
        res.set("Retry-After", String(retryAfter));
        return res.status(429).json({
          code: "GAP",
          error: `Please wait ${retryAfter}s before the next query.`,
          retryAfter,
        });
      }

      return res.status(429).json({
        code: isUser ? "DAILY_LIMIT" : "LOGIN_REQUIRED",
        error: isUser
          ? `Daily limit (${userLimit}) reached. Try again tomorrow.`
          : "Free limit reached. Please login to continue.",
      });
    }

    const prevCount = updated.count - 1;
    const prevLastAt = record.lastAt;
    req.refundQuota = async () => {
      try {
        if (getIsMongoConnected()) {
          await Usage.updateOne(
            { key },
            {
              $set: {
                count: Math.max(0, prevCount),
                lastAt: prevLastAt,
              },
            }
          );
        }
      } catch (err) {
        console.warn("Failed to refund quota in Mongo:", err.message);
      }
      if (!isUser) {
        req.guestRemaining = Math.max(0, limit - prevCount);
      }
    };

    if (!isUser) {
      req.guestRemaining = Math.max(0, limit - updated.count);
    }

    next();
  } catch (error) {
    console.warn("Mongo quota error, falling back to memory:", error.message);
    return verifyQuotaInMemory(req, res, next, key, limit, userLimit, isUser, now);
  }
}

export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests. Try again in a minute." },
});

export const suggestLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 40,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many suggestion requests." },
});