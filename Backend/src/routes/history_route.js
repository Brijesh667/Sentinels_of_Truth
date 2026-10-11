import express from "express";
import { getHistory, deleteHistoryItem } from "../controllers/history.js";
import { requireAuth } from "../middleware/auth.js";

const history_route = express.Router();

history_route.get("/", requireAuth, getHistory);
history_route.delete("/:id", requireAuth, deleteHistoryItem);

export default history_route;
