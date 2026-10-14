import crypto from "crypto";
import jwt from "jsonwebtoken";
import {
  redisGet,
  redisSet,
  redisDel,
  redisSAdd,
  redisSRem,
  redisSMembers,
  isRedisReady,
} from "../config/redis.js";

const DEFAULT_ACCESS_EXPIRES = "15m";
const DEFAULT_REFRESH_TTL_DAYS = 7;
const ROTATED_MARKER_TTL_SECONDS = 300; // 5 minutes

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function signAccessToken(userId) {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not configured");
  }

  const expiresIn = process.env.JWT_ACCESS_EXPIRES || DEFAULT_ACCESS_EXPIRES;
  return jwt.sign({ sub: userId }, secret, {
    algorithm: "HS256",
    expiresIn,
  });
}

export function verifyAccessToken(token) {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not configured");
  }

  return jwt.verify(token, secret, { algorithms: ["HS256"] });
}

export async function issueRefreshToken(userId, familyId = null) {
  if (!isRedisReady()) {
    throw new Error("Redis unavailable");
  }

  const token = crypto.randomBytes(48).toString("base64url");
  const hash = hashToken(token);
  const fid = familyId || crypto.randomUUID();

  const ttlDays = Number(process.env.REFRESH_TTL_DAYS) || DEFAULT_REFRESH_TTL_DAYS;
  const ttlSeconds = ttlDays * 24 * 60 * 60;

  const sessionData = {
    userId,
    familyId: fid,
    createdAt: Date.now(),
  };

  await redisSet(`rt:${hash}`, JSON.stringify(sessionData), "EX", ttlSeconds);
  await redisSAdd(`sessions:${userId}`, hash);

  return { token, familyId: fid };
}

export async function rotateRefreshToken(token) {
  if (!isRedisReady()) {
    throw new Error("Redis unavailable");
  }

  if (!token || typeof token !== "string") {
    const err = new Error("Invalid refresh token");
    err.code = "TOKEN_INVALID";
    throw err;
  }

  const hash = hashToken(token);
  const existingRaw = await redisGet(`rt:${hash}`);

  if (!existingRaw) {
    // Check if it was already used (reuse detection)
    const usedRaw = await redisGet(`used:${hash}`);
    if (usedRaw) {
      try {
        const { userId, familyId } = JSON.parse(usedRaw);
        // Revoke the entire family for this user
        if (userId && familyId) {
          const hashes = await redisSMembers(`sessions:${userId}`);
          for (const h of hashes) {
            const hDataRaw = await redisGet(`rt:${h}`);
            if (hDataRaw) {
              try {
                const hData = JSON.parse(hDataRaw);
                if (hData.familyId === familyId) {
                  await redisDel(`rt:${h}`);
                  await redisSRem(`sessions:${userId}`, h);
                }
              } catch {
                // Ignore parse errors on individual records
              }
            }
          }
        }
      } catch (e) {
        console.warn("[Auth] Failed to revoke family on reuse:", e.message);
      }

      const reuseErr = new Error("Refresh token reuse detected");
      reuseErr.code = "TOKEN_REUSED";
      throw reuseErr;
    }

    const invalidErr = new Error("Invalid or expired refresh token");
    invalidErr.code = "TOKEN_INVALID";
    throw invalidErr;
  }

  let session;
  try {
    session = JSON.parse(existingRaw);
  } catch {
    await redisDel(`rt:${hash}`);
    const err = new Error("Corrupted refresh token record");
    err.code = "TOKEN_INVALID";
    throw err;
  }

  const { userId, familyId } = session;

  // 1. Invalidate current token
  await redisDel(`rt:${hash}`);
  await redisSRem(`sessions:${userId}`, hash);

  // 2. Mark as used for rotation window
  await redisSet(
    `used:${hash}`,
    JSON.stringify({ userId, familyId }),
    "EX",
    ROTATED_MARKER_TTL_SECONDS
  );

  // 3. Issue new refresh token with same familyId
  const { token: newRefreshToken } = await issueRefreshToken(userId, familyId);
  const accessToken = signAccessToken(userId);

  return {
    accessToken,
    refreshToken: newRefreshToken,
    userId,
  };
}

export async function revokeRefreshToken(token) {
  if (!token || typeof token !== "string" || !isRedisReady()) {
    return;
  }

  try {
    const hash = hashToken(token);
    const existingRaw = await redisGet(`rt:${hash}`);
    if (existingRaw) {
      const session = JSON.parse(existingRaw);
      await redisDel(`rt:${hash}`);
      if (session.userId) {
        await redisSRem(`sessions:${session.userId}`, hash);
      }
    }
  } catch (error) {
    console.warn("[Auth] Failed to revoke refresh token:", error.message);
  }
}

export async function revokeAllForUser(userId) {
  if (!userId || !isRedisReady()) {
    return;
  }

  try {
    const hashes = await redisSMembers(`sessions:${userId}`);
    if (Array.isArray(hashes)) {
      for (const h of hashes) {
        await redisDel(`rt:${h}`);
      }
    }
    await redisDel(`sessions:${userId}`);
  } catch (error) {
    console.warn(`[Auth] Failed to revoke all sessions for ${userId}:`, error.message);
  }
}
