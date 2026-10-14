import { createContext, useContext, useEffect, useState, useCallback } from "react";

const ThemeContext = createContext(null);
const THEME_STORAGE_KEY = "sot-theme";

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredMode() {
  if (typeof window === "undefined") return "system";
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // ignore
  }
  return "system";
}

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(getStoredMode);
  const [resolvedTheme, setResolvedTheme] = useState(() => {
    const initialMode = getStoredMode();
    return initialMode === "system" ? getSystemTheme() : initialMode;
  });

  const applyThemeClass = useCallback((theme) => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  const setMode = useCallback(
    (newMode) => {
      setModeState(newMode);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, newMode);
      } catch {
        // ignore
      }

      const nextResolved = newMode === "system" ? getSystemTheme() : newMode;
      setResolvedTheme(nextResolved);
      applyThemeClass(nextResolved);
    },
    [applyThemeClass]
  );

  const toggle = useCallback(() => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setMode(next);
  }, [resolvedTheme, setMode]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (mode === "system") {
        const sys = media.matches ? "dark" : "light";
        setResolvedTheme(sys);
        applyThemeClass(sys);
      }
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [mode, applyThemeClass]);

  // Ensure initial render matches resolved
  useEffect(() => {
    const currentResolved = mode === "system" ? getSystemTheme() : mode;
    setResolvedTheme(currentResolved);
    applyThemeClass(currentResolved);
  }, [mode, applyThemeClass]);

  return (
    <ThemeContext.Provider value={{ mode, resolvedTheme, setMode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
