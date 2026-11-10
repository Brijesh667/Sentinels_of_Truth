import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import LandingPage from "./pages/Landing_page";
import NotFoundPage from "./pages/NotFound_page";
import axios from "axios";
import { useEffect } from "react";
import { useAppAuth } from "./auth/useAppAuth";

const About = React.lazy(() => import("./pages/About_page"));
const Privacy = React.lazy(() => import("./pages/Privacy_page"));

const DevResultPreview = import.meta.env.DEV
  ? React.lazy(() => import("./dev/ResultPreview"))
  : null;

function App() {
  const { isSignedIn } = useAppAuth();
  const location = useLocation();

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/health`).catch(() => {});
  }, []);

  // When logged in, default reload should land on top "Home"
  useEffect(() => {
    if (isSignedIn) {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      if (
        window.location.pathname === "/how-it-works" ||
        window.location.hash === "#how-it-works"
      ) {
        window.history.replaceState(null, "", "/");
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      } else if (location.pathname === "/") {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }
    }
  }, [isSignedIn, location.pathname]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/how-it-works"
          element={
            isSignedIn ? <Navigate to="/" replace /> : <LandingPage />
          }
        />
        <Route path="/app" element={<Navigate to="/" replace />} />
        <Route
          path="/about"
          element={
            <React.Suspense
              fallback={
                <div
                  className="w-full bg-bg text-fg py-12 sm:py-16 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-140px)] flex flex-col justify-start items-center"
                  aria-busy="true"
                >
                  <div className="max-w-3xl w-full mx-auto space-y-12 sm:space-y-16 animate-pulse opacity-40">
                    <div className="text-center space-y-3 pb-8 border-b border-line">
                      <div className="h-10 bg-surface-2 rounded-xl w-3/4 mx-auto" />
                      <div className="h-4 bg-surface-2 rounded w-1/2 mx-auto" />
                    </div>
                    <div className="space-y-4">
                      <div className="h-6 bg-surface-2 rounded w-1/3" />
                      <div className="h-20 bg-surface-2 rounded-2xl" />
                    </div>
                  </div>
                </div>
              }
            >
              <About />
            </React.Suspense>
          }
        />
        <Route
          path="/privacy"
          element={
            <React.Suspense
              fallback={
                <div
                  className="w-full bg-bg text-fg py-12 sm:py-16 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-140px)] flex flex-col justify-start items-center"
                  aria-busy="true"
                >
                  <div className="max-w-3xl w-full mx-auto space-y-8 animate-pulse opacity-40">
                    <div className="text-center space-y-3 pb-8 border-b border-line">
                      <div className="h-10 bg-surface-2 rounded-xl w-1/2 mx-auto" />
                    </div>
                    <div className="space-y-4">
                      <div className="h-6 bg-surface-2 rounded w-1/3" />
                      <div className="h-16 bg-surface-2 rounded-2xl" />
                    </div>
                  </div>
                </div>
              }
            >
              <Privacy />
            </React.Suspense>
          }
        />
        {import.meta.env.DEV && DevResultPreview && (
          <Route
            path="/dev/result-preview"
            element={
              <React.Suspense
                fallback={
                  <div className="w-full min-h-[calc(100vh-140px)] p-8 text-center text-fg-muted" aria-busy="true">
                    Loading preview...
                  </div>
                }
              >
                <DevResultPreview />
              </React.Suspense>
            }
          />
        )}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
