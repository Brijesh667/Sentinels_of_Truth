import path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

const BASE_URL = process.env.TEST_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
const TEST_EMAIL_REGEX = /^phase1_test_.*@example\.com$/i;

async function run() {
  console.log("=== PHASE 1 AUTH TEST SUITE ===");
  console.log(`Target: ${BASE_URL}\n`);

  const timestamp = Date.now();
  const testEmail = `phase1_test_${timestamp}@example.com`;
  const unknownEmail = `phase1_test_unknown_${timestamp}@example.com`;
  const testPassword = "Password123!";
  const testName = "Phase1 Tester";

  let createdUserId = null;
  let currentAccessToken = null;
  let currentRefreshToken = null;
  let rotatedRefreshToken = null;

  try {
    // 1. Signup
    console.log("1. Testing signup...");
    const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: testName,
        email: testEmail,
        password: testPassword,
      }),
    });
    const signupData = await signupRes.json();
    if (signupRes.status !== 201 || !signupData.accessToken || !signupData.refreshToken) {
      throw new Error(`Signup failed (${signupRes.status}): ${JSON.stringify(signupData)}`);
    }
    createdUserId = signupData.user.id;
    currentAccessToken = signupData.accessToken;
    currentRefreshToken = signupData.refreshToken;
    console.log("   [PASS] Signup succeeded with 201, user.id and tokens received");

    // 2. Login
    console.log("2. Testing login with correct credentials...");
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    const loginData = await loginRes.json();
    if (loginRes.status !== 200 || !loginData.accessToken || !loginData.refreshToken) {
      throw new Error(`Login failed (${loginRes.status}): ${JSON.stringify(loginData)}`);
    }
    currentAccessToken = loginData.accessToken;
    currentRefreshToken = loginData.refreshToken;
    console.log("   [PASS] Login succeeded with 200, tokens received");

    // 3. Wrong password
    console.log("3. Testing login with wrong password...");
    const wrongPassRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "WrongPassword123!",
      }),
    });
    const wrongPassData = await wrongPassRes.json();
    if (wrongPassRes.status !== 401 || wrongPassData.error !== "Invalid email or password") {
      throw new Error(`Wrong password test failed (${wrongPassRes.status}): ${JSON.stringify(wrongPassData)}`);
    }
    console.log("   [PASS] Returned 401 with 'Invalid email or password'");

    // 4. Unknown email (timing attack defense check)
    console.log("4. Testing login with unknown email...");
    const unknownRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: unknownEmail,
        password: testPassword,
      }),
    });
    const unknownData = await unknownRes.json();
    if (unknownRes.status !== 401 || unknownData.error !== "Invalid email or password") {
      throw new Error(`Unknown email test failed (${unknownRes.status}): ${JSON.stringify(unknownData)}`);
    }
    console.log("   [PASS] Returned 401 with identical 'Invalid email or password' message");

    // 5. Refresh token rotation
    console.log("5. Testing refresh token rotation...");
    const oldTokenToReplay = currentRefreshToken;
    const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: oldTokenToReplay }),
    });
    const refreshData = await refreshRes.json();
    if (refreshRes.status !== 200 || !refreshData.accessToken || !refreshData.refreshToken) {
      throw new Error(`Refresh failed (${refreshRes.status}): ${JSON.stringify(refreshData)}`);
    }
    currentAccessToken = refreshData.accessToken;
    currentRefreshToken = refreshData.refreshToken;
    rotatedRefreshToken = oldTokenToReplay;
    console.log("   [PASS] Refresh succeeded with 200, new token pair issued");

    // 6. Replay attack detection (using old rotated refresh token)
    console.log("6. Testing replayed/old refresh token reuse detection...");
    const replayRes = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rotatedRefreshToken }),
    });
    const replayData = await replayRes.json();
    if (replayRes.status !== 401) {
      throw new Error(`Replay attack test failed - expected 401, got ${replayRes.status}: ${JSON.stringify(replayData)}`);
    }
    console.log(`   [PASS] Replayed refresh token rejected with 401 (${replayData.code || "TOKEN_INVALID"})`);

    // 7. /auth/me with valid access token
    console.log("7. Testing /auth/me with valid access token...");
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${currentAccessToken}` },
    });
    const meData = await meRes.json();
    if (meRes.status !== 200 || meData.user?.email !== testEmail) {
      throw new Error(`/auth/me failed (${meRes.status}): ${JSON.stringify(meData)}`);
    }
    console.log("   [PASS] /auth/me returned 200 with user profile");

    // 8. /auth/me without token
    console.log("8. Testing /auth/me without token...");
    const noTokenRes = await fetch(`${BASE_URL}/auth/me`, {
      method: "GET",
    });
    if (noTokenRes.status !== 401) {
      throw new Error(`/auth/me without token should return 401, got ${noTokenRes.status}`);
    }
    console.log("   [PASS] /auth/me without token returned 401");

    // 9. Logout
    console.log("9. Testing logout...");
    const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });
    if (logoutRes.status !== 204) {
      throw new Error(`Logout failed - expected 204, got ${logoutRes.status}`);
    }
    console.log("   [PASS] Logout succeeded with 204");

    console.log("\nALL PHASE 1 AUTH TESTS PASSED SUCCESSFULLY!");
  } finally {
    // Cleanup: Connect to Mongo and delete ONLY matching test users
    console.log("\nCleaning up test artifacts...");
    try {
      if (process.env.MONGODB_URI) {
        await mongoose.connect(process.env.MONGODB_URI);
        const usersCollection = mongoose.connection.collection("users");
        const deleteResult = await usersCollection.deleteMany({
          email: { $regex: TEST_EMAIL_REGEX },
        });
        console.log(`Cleaned up ${deleteResult.deletedCount} test user(s) matching /^phase1_test_.*@example\\.com$/i.`);

        if (createdUserId) {
          const historyCollection = mongoose.connection.collection("histories");
          await historyCollection.deleteMany({ userId: createdUserId });
        }
        await mongoose.disconnect();
      } else {
        console.warn("MONGODB_URI not found; cleanup skipped.");
      }
    } catch (cleanupErr) {
      console.warn("Cleanup warning:", cleanupErr.message);
    }
  }
}

run().catch((err) => {
  console.error("\n[TEST RUNNER ERROR]", err);
  process.exit(1);
});
