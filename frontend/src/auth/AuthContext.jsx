import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  apiSignup,
  apiLogin,
  apiGoogleLogin,
  apiRefresh,
  apiLogout,
  apiGetMe,
} from "./authApi";
import { registerAuthInterceptors } from "../utils/axiosClient";

const AuthContext = createContext(null);

const REFRESH_TOKEN_KEY = "sot_refresh_token";
const GUEST_ID_KEY = "sot_guest_id";

let inMemoryAccessToken = null;
let tokenExpiresAt = 0;
let tabRefreshPromise = null;

export function getStoredGuestId() {
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

export function consumeGuestId() {
  if (typeof window === "undefined") return null;
  try {
    const gid = localStorage.getItem(GUEST_ID_KEY);
    localStorage.removeItem(GUEST_ID_KEY);
    return gid;
  } catch {
    return null;
  }
}

function parseTokenExpiry(token) {
  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp) {
        return payload.exp * 1000;
      }
    }
  } catch {
    // ignore
  }
  return Date.now() + 14 * 60 * 1000;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalSubtitle, setAuthModalSubtitle] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  const proactiveTimerRef = useRef(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4500);
  }, []);

  const scheduleProactiveRefresh = useCallback((expiryMs) => {
    if (proactiveTimerRef.current) {
      clearTimeout(proactiveTimerRef.current);
    }
    const delay = Math.max(5000, expiryMs - Date.now() - 60 * 1000);
    proactiveTimerRef.current = setTimeout(async () => {
      try {
        await refreshSession();
      } catch {
        // Retry later if proactive refresh fails
      }
    }, delay);
  }, []);

  const refreshSession = useCallback(async () => {
    if (tabRefreshPromise) {
      return tabRefreshPromise;
    }

    const runApiRefresh = async () => {
      const rawToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!rawToken) {
        inMemoryAccessToken = null;
        tokenExpiresAt = 0;
        setUser(null);
        return null;
      }

      try {
        const data = await apiRefresh({ refreshToken: rawToken });
        inMemoryAccessToken = data.accessToken;
        tokenExpiresAt = parseTokenExpiry(data.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
        setUser(data.user);
        scheduleProactiveRefresh(tokenExpiresAt);
        return data;
      } catch (err) {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        inMemoryAccessToken = null;
        tokenExpiresAt = 0;
        setUser(null);
        throw err;
      }
    };

    tabRefreshPromise = (async () => {
      try {
        if (typeof navigator !== "undefined" && navigator.locks?.request) {
          return await navigator.locks.request("sot-refresh", runApiRefresh);
        }
        return await runApiRefresh();
      } finally {
        tabRefreshPromise = null;
      }
    })();

    return tabRefreshPromise;
  }, [scheduleProactiveRefresh]);

  const getAccessToken = useCallback(async () => {
    if (inMemoryAccessToken && Date.now() < tokenExpiresAt - 60 * 1000) {
      return inMemoryAccessToken;
    }

    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!storedRefreshToken) {
      return null;
    }

    try {
      const res = await refreshSession();
      return res?.accessToken || null;
    } catch {
      return null;
    }
  }, [refreshSession]);

  const handleAuthSuccess = useCallback(
    (data) => {
      inMemoryAccessToken = data.accessToken;
      tokenExpiresAt = parseTokenExpiry(data.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      setUser(data.user);
      scheduleProactiveRefresh(tokenExpiresAt);
      setIsAuthModalOpen(false);

      if (data.migratedCount > 0) {
        showToast(`Saved ${data.migratedCount} earlier checks to your history`);
      }
    },
    [scheduleProactiveRefresh, showToast]
  );

  const signup = useCallback(
    async ({ name, email, password }) => {
      const guestId = consumeGuestId();
      const data = await apiSignup({ name, email, password, guestId });
      handleAuthSuccess(data);
      return data;
    },
    [handleAuthSuccess]
  );

  const login = useCallback(
    async ({ email, password }) => {
      const guestId = consumeGuestId();
      const data = await apiLogin({ email, password, guestId });
      handleAuthSuccess(data);
      return data;
    },
    [handleAuthSuccess]
  );

  const googleLogin = useCallback(
    async ({ credential }) => {
      const guestId = consumeGuestId();
      const data = await apiGoogleLogin({ credential, guestId });
      handleAuthSuccess(data);
      return data;
    },
    [handleAuthSuccess]
  );

  const logout = useCallback(async () => {
    const rawRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    inMemoryAccessToken = null;
    tokenExpiresAt = 0;
    if (proactiveTimerRef.current) {
      clearTimeout(proactiveTimerRef.current);
    }
    setUser(null);
    if (rawRefreshToken) {
      await apiLogout({ refreshToken: rawRefreshToken });
    }
  }, []);

  const openAuthModal = useCallback((options = {}) => {
    setAuthModalSubtitle(options.subtitle || "");
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthModalSubtitle("");
  }, []);

  // Initialize auth state and interceptors on mount
  useEffect(() => {
    registerAuthInterceptors(getAccessToken, refreshSession);

    const initAuth = async () => {
      const token = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!token) {
        setIsLoaded(true);
        return;
      }

      try {
        await refreshSession();
      } catch {
        // Token invalid or network issue
      } finally {
        setIsLoaded(true);
      }
    };

    initAuth();

    return () => {
      if (proactiveTimerRef.current) {
        clearTimeout(proactiveTimerRef.current);
      }
    };
  }, [refreshSession]);

  const value = {
    user,
    isSignedIn: Boolean(user),
    isLoaded,
    signup,
    login,
    googleLogin,
    logout,
    getAccessToken,
    refreshSession,
    isAuthModalOpen,
    authModalSubtitle,
    openAuthModal,
    closeAuthModal,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 bg-surface-2 text-fg text-sm px-4 py-3 rounded-xl shadow-2xl border border-line flex items-center gap-2 animate-bounce-once"
        >
          <span className="text-success font-bold">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
