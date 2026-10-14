import path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config();

import express from "express";
import helmet from "helmet";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { connectMongo } from "./config/mongo.js";
import suggestion_route from "./routes/suggestion_route.js";
import response_route from "./routes/response_route.js";
import history_route from "./routes/history_route.js";
import { optionalAuth } from "./middleware/auth.js";
import {
  globalLimiter,
  suggestLimiter,
  verifyQuota,
} from "./middleware/rateLimiters.js";
import { validate, querySchema } from "./middleware/validate.js";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Guest-Id"],
  })
);
app.use(express.json({ limit: "20kb" }));
app.use(globalLimiter);
app.use(clerkMiddleware());

// Connect to MongoDB at startup
connectMongo();

// Verification routes with optionalAuth -> validation -> verifyQuota
app.use("/get/validate-stream", optionalAuth, validate(querySchema), verifyQuota);
app.use("/get/validate", optionalAuth, validate(querySchema), verifyQuota);
app.use("/get", response_route);

// History routes (requireAuth inside router)
app.use("/history", history_route);

// Suggestions
app.use("/sug", suggestLimiter, suggestion_route);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});