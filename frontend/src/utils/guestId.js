const GUEST_ID_KEY = "sot_guest_id";

export function getStoredGuestIdOnly() {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(GUEST_ID_KEY) || null;
  } catch {
    return null;
  }
}

export function ensureGuestId() {
  if (typeof window === "undefined") return null;
  try {
    let gid = localStorage.getItem(GUEST_ID_KEY);
    if (!gid) {
      gid = crypto.randomUUID();
      localStorage.setItem(GUEST_ID_KEY, gid);
    }
    return gid;
  } catch {
    return null;
  }
}

export function getStoredGuestId() {
  return ensureGuestId();
}

export function clearStoredGuestId() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(GUEST_ID_KEY);
  } catch {
    // ignore
  }
}
