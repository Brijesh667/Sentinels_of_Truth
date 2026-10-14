import axios from "axios";
import { getAuthToken } from "./authToken.js";
import { getStoredGuestId } from "./guestId.js";

const RAW_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const BACKEND_URL = RAW_URL.replace(/\/+$/, "");

const axiosClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(async (config) => {
  try {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      const guestId = getStoredGuestId();
      if (guestId) {
        config.headers["X-Guest-Id"] = guestId;
      }
    }
  } catch {
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
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        const freshToken = await getAuthToken({ skipCache: true });
        if (freshToken) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${freshToken}`;
          return axiosClient(originalRequest);
        }
      } catch {
        // give up silently
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
