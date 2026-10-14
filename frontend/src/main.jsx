import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { ThemeProvider, useTheme } from "./theme/ThemeProvider.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { AuthBridge } from "./utils/authToken.js";
import "@fontsource-variable/inter";
import "@fontsource-variable/newsreader";
import "./index.css";
import App from "./App.jsx";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function ClerkWithTheme({ children }) {
  const { resolvedTheme } = useTheme();

  if (!PUBLISHABLE_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-bg text-fg">
        <div className="max-w-md p-6 rounded-2xl bg-surface border border-danger/30 text-center shadow-xl">
          <h2 className="text-xl font-bold text-danger mb-2">Clerk Configuration Error</h2>
          <p className="text-sm text-fg-muted mb-4">
            <code>VITE_CLERK_PUBLISHABLE_KEY</code> is missing in <code>frontend/.env</code>.
          </p>
          <p className="text-xs text-fg-muted">
            Please define your Clerk publishable key in your environment file.
          </p>
        </div>
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        baseTheme: isDark ? dark : undefined,
        variables: {
          colorPrimary: isDark ? "#6b9dff" : "#1d4ed8",
          colorBackground: isDark ? "#14171e" : "#ffffff",
          colorText: isDark ? "#eceef3" : "#16181d",
        },
      }}
    >
      <AuthBridge />
      <ToastProvider>{children}</ToastProvider>
    </ClerkProvider>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <ClerkWithTheme>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ClerkWithTheme>
    </ThemeProvider>
  </StrictMode>
);
