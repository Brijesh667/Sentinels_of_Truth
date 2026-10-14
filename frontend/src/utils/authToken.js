import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

let activeGetToken = null;

export function registerTokenGetter(getter) {
  activeGetToken = getter;
}

export async function getAuthToken(options) {
  if (typeof activeGetToken === "function") {
    try {
      const token = await activeGetToken(options);
      return token || null;
    } catch (err) {
      console.warn("Failed to retrieve Clerk auth token:", err);
      return null;
    }
  }
  return null;
}

export function AuthBridge() {
  const { getToken } = useAuth();

  useEffect(() => {
    registerTokenGetter(getToken);
    return () => {
      registerTokenGetter(null);
    };
  }, [getToken]);

  return null;
}
