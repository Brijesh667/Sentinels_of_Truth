import { verifyAccessToken } from "../utils/tokens.js";

function extractBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || typeof header !== "string") {
    return null;
  }
  const parts = header.trim().split(/\s+/);
  if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
    return parts[1];
  }
  return { malformed: true };
}

export function optionalAuth(req, res, next) {
  const extracted = extractBearerToken(req);
  if (!extracted) {
    // Guest - proceed without user
    return next();
  }

  if (extracted.malformed) {
    return res.status(401).json({ code: "TOKEN_INVALID", error: "Malformed authorization header" });
  }

  try {
    const payload = verifyAccessToken(extracted);
    if (!payload?.sub) {
      return res.status(401).json({ code: "TOKEN_INVALID", error: "Invalid token payload" });
    }
    req.user = { id: payload.sub };
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ code: "TOKEN_EXPIRED", error: "Access token expired" });
    }
    return res.status(401).json({ code: "TOKEN_INVALID", error: "Invalid access token" });
  }
}

export function requireAuth(req, res, next) {
  const extracted = extractBearerToken(req);
  if (!extracted) {
    return res.status(401).json({ error: "Login required" });
  }

  if (extracted.malformed) {
    return res.status(401).json({ code: "TOKEN_INVALID", error: "Malformed authorization header" });
  }

  try {
    const payload = verifyAccessToken(extracted);
    if (!payload?.sub) {
      return res.status(401).json({ code: "TOKEN_INVALID", error: "Invalid token payload" });
    }
    req.user = { id: payload.sub };
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ code: "TOKEN_EXPIRED", error: "Access token expired" });
    }
    return res.status(401).json({ code: "TOKEN_INVALID", error: "Invalid access token" });
  }
}
