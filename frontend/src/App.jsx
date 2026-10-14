import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import LandingPage from "./pages/Landing_page";
import Home_page from "./pages/Home_page";
import NotFoundPage from "./pages/NotFound_page";

const About = React.lazy(() => import("./pages/About_page"));

const DevResultPreview = import.meta.env.DEV
  ? React.lazy(() => import("./dev/ResultPreview"))
  : null;

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<Home_page />} />
        <Route
          path="/about"
          element={
            <React.Suspense
              fallback={
                <div className="py-20 text-center text-fg-muted text-sm">
                  Loading...
                </div>
              }
            >
              <About />
            </React.Suspense>
          }
        />
        {import.meta.env.DEV && DevResultPreview && (
          <Route
            path="/dev/result-preview"
            element={
              <React.Suspense
                fallback={
                  <div className="p-8 text-center text-fg-muted">
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
