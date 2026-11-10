import { getAuth } from "@clerk/express";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function optionalAuth(req, res, next) {
  try {
    const { userId } = getAuth(req);
    if (userId) {
      req.user = { id: userId };
    }
  } catch {}
  return next();
}

export function requireAuth(req, res, next) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: "Login required" });
    }
    req.user = { id: userId };
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Authentication failed" });
  }
}

export function authOrGuest(req, res, next) {
  try {
    const { userId } = getAuth(req);
    if (userId) {
      req.user = { id: userId };
      return next();
    }
  } catch {}

  const guestHeader = req.headers["x-guest-id"];
  if (guestHeader && typeof guestHeader === "string" && UUID_REGEX.test(guestHeader.trim())) {
    req.guestId = guestHeader.trim();
    return next();
  }

  return res.status(401).json({ error: "Login or valid guest session required" });
}
