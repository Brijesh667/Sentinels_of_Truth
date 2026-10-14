import express from "express";
import rateLimit from "express-rate-limit";
import {
  getHistory,
  deleteHistoryItem,
  clearHistory,
} from "../controllers/history.js";
import { requireAuth } from "../middleware/auth.js";
import { adoptGuestHistory } from "../utils/adoptGuestHistory.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const adoptLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many adopt requests. Please try again later." },
});

const history_route = express.Router();

history_route.post("/adopt", requireAuth, adoptLimiter, async (req, res) => {
  const guestHeader = req.headers["x-guest-id"];
  if (
    !guestHeader ||
    typeof guestHeader !== "string" ||
    !UUID_REGEX.test(guestHeader.trim())
  ) {
    return res.status(400).json({ error: "Invalid or missing X-Guest-Id header" });
  }

  try {
    const migratedCount = await adoptGuestHistory(req.user.id, guestHeader.trim());
    return res.status(200).json({ migratedCount });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to adopt history" });
  }
});

history_route.get("/", requireAuth, getHistory);
history_route.delete("/", requireAuth, clearHistory);
history_route.delete("/:id", requireAuth, deleteHistoryItem);

export default history_route;
