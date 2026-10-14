import { getAuth } from "@clerk/express";

export function optionalAuth(req, res, next) {
  const { userId } = getAuth(req);
  if (userId) {
    req.user = { id: userId };
  }
  return next();
}

export function requireAuth(req, res, next) {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Login required" });
  }
  req.user = { id: userId };
  return next();
}
