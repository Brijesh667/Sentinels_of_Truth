import express from "express";
import rateLimit from "express-rate-limit";
import {
  signup,
  login,
  googleLogin,
  refresh,
  logout,
  logoutAll,
  getMe,
} from "../controllers/auth.js";
import { requireAuth } from "../middleware/auth.js";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many authentication attempts. Please try again in 15 minutes." },
});

const auth_route = express.Router();

auth_route.post("/signup", authLimiter, signup);
auth_route.post("/login", authLimiter, login);
auth_route.post("/google", authLimiter, googleLogin);
auth_route.post("/refresh", refresh);
auth_route.post("/logout", logout);
auth_route.post("/logout-all", requireAuth, logoutAll);
auth_route.get("/me", requireAuth, getMe);

export default auth_route;
