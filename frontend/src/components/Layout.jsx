import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navigatiaon/Nav_bar";
import Footer from "./Footer";
import { useAppAuth } from "../auth/useAppAuth";
import { getStoredGuestIdOnly, clearStoredGuestId } from "../utils/guestId";
import { getAuthToken } from "../utils/authToken";

const RAW_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const BACKEND_URL = RAW_URL.replace(/\/+$/, "");

export default function Layout() {
  const { isLoaded, isSignedIn, showToast } = useAppAuth();
  const adoptingRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || adoptingRef.current) return;

    const guestId = getStoredGuestIdOnly();
    if (!guestId) return;

    adoptingRef.current = true;

    async function adopt() {
      try {
        const token = await getAuthToken();
        if (!token) return;

        const res = await fetch(`${BACKEND_URL}/history/adopt`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-Guest-Id": guestId,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.migratedCount > 0) {
            showToast(`Saved ${data.migratedCount} earlier checks to your history`);
            window.dispatchEvent(new CustomEvent("sot:history-updated"));
          }
        }
      } catch (err) {
        console.warn("Guest history adoption error:", err);
      } finally {
        clearStoredGuestId();
      }
    }

    adopt();
  }, [isLoaded, isSignedIn, showToast]);

  return (
    <div className="min-h-dvh flex flex-col bg-bg text-fg transition-colors duration-200">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-fg focus:rounded-xl focus:shadow-lg focus:outline-hidden"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
