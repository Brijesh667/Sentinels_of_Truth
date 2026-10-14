import axios from "axios";
import { getStoredGuestId } from "../auth/AuthContext";

const RAW_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const BACKEND_URL = RAW_URL.replace(/\/+$/, "");

let tokenGetter = null;
let refreshHandler = null;

export function registerAuthInterceptors(getter, refresher) {
  tokenGetter = getter;
  refreshHandler = refresher;
}

const axiosClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(async (config) => {
  if (tokenGetter) {
    try {
      const token = await tokenGetter();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        const guestId = getStoredGuestId();
        if (guestId) {
          config.headers["X-Guest-Id"] = guestId;
        }
      }
    } catch {
      // ignore token error
    }
  } else {
    const guestId = getStoredGuestId();
    if (guestId) {
      config.headers["X-Guest-Id"] = guestId;
    }
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === "TOKEN_EXPIRED" &&
      !originalRequest._retry &&
      refreshHandler
    ) {
      originalRequest._retry = true;
      try {
        const refreshResult = await refreshHandler();
        if (refreshResult?.accessToken) {
          originalRequest.headers.Authorization = `Bearer ${refreshResult.accessToken}`;
          return axiosClient(originalRequest);
        }
      } catch {
        // Refresh failed
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
