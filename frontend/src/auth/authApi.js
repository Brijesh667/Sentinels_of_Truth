const RAW_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const BACKEND_URL = RAW_URL.replace(/\/+$/, "");

async function postJson(endpoint, body, headers = {}) {
  const res = await fetch(`${BACKEND_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });

  const contentType = res.headers.get("content-type");
  const data = contentType && contentType.includes("application/json") ? await res.json() : null;

  if (!res.ok) {
    const error = new Error(data?.error || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.code = data?.code;
    error.data = data;
    throw error;
  }

  return data;
}

export async function apiSignup({ name, email, password, guestId }) {
  return postJson("/auth/signup", { name, email, password, guestId });
}

export async function apiLogin({ email, password, guestId }) {
  return postJson("/auth/login", { email, password, guestId });
}

export async function apiGoogleLogin({ credential, guestId }) {
  return postJson("/auth/google", { credential, guestId });
}

export async function apiRefresh({ refreshToken }) {
  return postJson("/auth/refresh", { refreshToken });
}

export async function apiLogout({ refreshToken }) {
  try {
    await fetch(`${BACKEND_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    // Best-effort logout
  }
}

export async function apiLogoutAll(accessToken) {
  try {
    await fetch(`${BACKEND_URL}/auth/logout-all`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch {
    // Best-effort
  }
}

export async function apiGetMe(accessToken) {
  const res = await fetch(`${BACKEND_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const error = new Error(data?.error || "Failed to fetch user");
    error.status = res.status;
    throw error;
  }

  return res.json();
}
