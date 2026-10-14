import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { z } from "zod";
import User from "../models/User.js";
import {
  signAccessToken,
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllForUser,
} from "../utils/tokens.js";
import { adoptGuestHistory } from "../utils/adoptGuestHistory.js";
import {
  isRedisReady,
  waitForRedis,
  redisGet,
  redisSet,
  redisDel,
} from "../config/redis.js";

async function ensureRedis() {
  if (isRedisReady()) return true;
  return await waitForRedis(2500);
}

const DUMMY_HASH = "$2a$12$e80yqY1a4k4oFkL8Y1jH7.x8hP4N6rL7uB8yvK1eN8fT9jL0kM2aO";
const LOCK_THRESHOLD = 5;
const LOCK_DURATION_SECONDS = 15 * 60; // 15 minutes

const signupSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  email: z.string().trim().email("Invalid email address").toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password cannot exceed 72 characters"),
  guestId: z.string().trim().optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
  guestId: z.string().trim().optional(),
});

const googleSchema = z.object({
  credential: z.string().min(1, "Google credential is required"),
  guestId: z.string().trim().optional(),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

const logoutSchema = z.object({
  refreshToken: z.string().optional(),
});

function formatUserResponse(user) {
  return {
    id: user._id.toString(),
    name: user.name || "",
    email: user.email,
    imageUrl: user.imageUrl || null,
  };
}

async function isEmailLocked(email) {
  try {
    if (!isRedisReady()) return false;
    const fails = await redisGet(`fail:${email}`);
    return Number(fails) >= LOCK_THRESHOLD;
  } catch {
    return false;
  }
}

async function recordFailedLogin(email) {
  try {
    if (!isRedisReady()) return;
    const current = Number(await redisGet(`fail:${email}`)) || 0;
    const nextVal = current + 1;
    await redisSet(`fail:${email}`, String(nextVal), "EX", LOCK_DURATION_SECONDS);
  } catch {
    // If Redis is down, fail gracefully
  }
}

async function clearFailedLogin(email) {
  try {
    if (!isRedisReady()) return;
    await redisDel(`fail:${email}`);
  } catch {
    // Fail gracefully
  }
}

export async function signup(req, res) {
  if (!(await ensureRedis())) {
    return res.status(503).json({ error: "Auth temporarily unavailable" });
  }

  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || "Validation failed" });
  }

  const { name, email, password, guestId } = parsed.data;

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      email,
      name: name || "",
      passwordHash,
      providers: ["password"],
      emailVerified: false,
    });

    const userId = user._id.toString();
    const accessToken = signAccessToken(userId);
    const { token: refreshToken } = await issueRefreshToken(userId);

    let migratedCount = 0;
    if (guestId) {
      migratedCount = await adoptGuestHistory(userId, guestId);
    }

    return res.status(201).json({
      user: formatUserResponse(user),
      accessToken,
      refreshToken,
      migratedCount,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: "An account with this email already exists. Please sign in.",
      });
    }
    return res.status(500).json({ error: "Signup failed. Please try again." });
  }
}

export async function login(req, res) {
  if (!(await ensureRedis())) {
    return res.status(503).json({ error: "Auth temporarily unavailable" });
  }

  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || "Validation failed" });
  }

  const { email, password, guestId } = parsed.data;

  if (await isEmailLocked(email)) {
    return res.status(429).json({
      code: "LOCKED",
      error: "Too many failed login attempts. Account locked for 15 minutes.",
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    await bcrypt.compare(password, DUMMY_HASH);
    await recordFailedLogin(email);
    return res.status(401).json({ error: "Invalid email or password" });
  }

  if (!user.passwordHash) {
    return res.status(401).json({
      code: "USE_GOOGLE",
      error: "This account uses Google sign-in. Please continue with Google.",
    });
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    await recordFailedLogin(email);
    return res.status(401).json({ error: "Invalid email or password" });
  }

  await clearFailedLogin(email);

  user.lastLoginAt = new Date();
  await user.save();

  const userId = user._id.toString();
  const accessToken = signAccessToken(userId);
  const { token: refreshToken } = await issueRefreshToken(userId);

  let migratedCount = 0;
  if (guestId) {
    migratedCount = await adoptGuestHistory(userId, guestId);
  }

  return res.status(200).json({
    user: formatUserResponse(user),
    accessToken,
    refreshToken,
    migratedCount,
  });
}

export async function googleLogin(req, res) {
  if (!(await ensureRedis())) {
    return res.status(503).json({ error: "Auth temporarily unavailable" });
  }

  const parsed = googleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || "Validation failed" });
  }

  const { credential, guestId } = parsed.data;
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;

  if (!clientId) {
    return res.status(500).json({ error: "Google OAuth client ID not configured" });
  }

  let payload;
  try {
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    payload = ticket.getPayload();
  } catch (error) {
    return res.status(401).json({ error: "Invalid Google credential" });
  }

  if (!payload || payload.email_verified !== true) {
    return res.status(400).json({ error: "Google email is not verified" });
  }

  const email = payload.email.toLowerCase().trim();
  const googleId = payload.sub;
  const name = payload.name || "";
  const picture = payload.picture || null;

  try {
    let user = await User.findOne({ email });

    if (user) {
      if (!user.emailVerified) {
        // Discard unverified password setup and link to verified Google identity
        user.emailVerified = true;
        user.passwordHash = null;
        if (!user.providers.includes("google")) {
          user.providers.push("google");
        }
        user.googleId = googleId;
        if (!user.imageUrl && picture) user.imageUrl = picture;
      } else {
        if (!user.providers.includes("google")) {
          user.providers.push("google");
        }
        if (!user.googleId) user.googleId = googleId;
        if (!user.imageUrl && picture) user.imageUrl = picture;
      }
      user.lastLoginAt = new Date();
      await user.save();
    } else {
      user = await User.create({
        email,
        name,
        googleId,
        providers: ["google"],
        emailVerified: true,
        imageUrl: picture,
        passwordHash: null,
        lastLoginAt: new Date(),
      });
    }

    const userId = user._id.toString();
    const accessToken = signAccessToken(userId);
    const { token: refreshToken } = await issueRefreshToken(userId);

    let migratedCount = 0;
    if (guestId) {
      migratedCount = await adoptGuestHistory(userId, guestId);
    }

    return res.status(200).json({
      user: formatUserResponse(user),
      accessToken,
      refreshToken,
      migratedCount,
    });
  } catch (error) {
    return res.status(500).json({ error: "Google sign-in failed. Please try again." });
  }
}

export async function refresh(req, res) {
  if (!(await ensureRedis())) {
    return res.status(503).json({ error: "Auth temporarily unavailable" });
  }

  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || "Validation failed" });
  }

  try {
    const result = await rotateRefreshToken(parsed.data.refreshToken);
    const user = await User.findById(result.userId);
    if (!user) {
      return res.status(401).json({ code: "TOKEN_INVALID", error: "User not found" });
    }

    return res.status(200).json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: formatUserResponse(user),
    });
  } catch (error) {
    return res.status(401).json({
      code: error.code || "TOKEN_INVALID",
      error: "Invalid or expired refresh token",
    });
  }
}

export async function logout(req, res) {
  const parsed = logoutSchema.safeParse(req.body);
  if (parsed.success && parsed.data.refreshToken) {
    await revokeRefreshToken(parsed.data.refreshToken);
  }
  return res.status(204).send();
}

export async function logoutAll(req, res) {
  if (req.user?.id) {
    await revokeAllForUser(req.user.id);
  }
  return res.status(204).send();
}

export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      user: {
        id: user._id.toString(),
        name: user.name || "",
        email: user.email,
        imageUrl: user.imageUrl || null,
        providers: user.providers,
        totalVerifications: user.totalVerifications || 0,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
}
