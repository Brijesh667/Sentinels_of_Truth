import { getAuth } from "@clerk/express";

export function optionalAuth(req, res, next) {
  try {
    const auth = getAuth(req);
    if (auth?.userId) {
      req.user = { id: auth.userId };
    }
  } catch (error) {
    // Never block guests on optionalAuth error
  }
  next();
}

export function requireAuth(req, res, next) {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ error: "Login required" });
    }
    req.user = { id: auth.userId };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Login required" });
  }
}
