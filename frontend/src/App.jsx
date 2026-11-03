import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import LandingPage from "./pages/Landing_page";
import NotFoundPage from "./pages/NotFound_page";
import axios from "axios";
import { useEffect } from "react";

const About = React.lazy(() => import("./pages/About_page"));
const Privacy = React.lazy(() => import("./pages/Privacy_page"));

const DevResultPreview = import.meta.env.DEV
  ? React.lazy(() => import("./dev/ResultPreview"))
  : null;

function App() {
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/health`).catch(() => {});
  }, []);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
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
