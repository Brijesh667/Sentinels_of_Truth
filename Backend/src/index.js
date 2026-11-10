import "./config/env.js";
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

const explicitAllowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (e.g. server-to-server, curl, tests)
      if (!origin) return callback(null, true);
      if (
        explicitAllowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
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
app.get("/health", (req, res) => res.sendStatus(200));

// History routes
app.use("/history", history_route);

// Suggestions
app.use("/sug", suggestLimiter, suggestion_route);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
