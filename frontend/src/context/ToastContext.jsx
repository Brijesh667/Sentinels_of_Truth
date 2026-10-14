import { createContext, useContext, useState, useCallback, useRef } from "react";

const ToastContext = createContext({
  showToast: () => {},
});

export function ToastProvider({ children }) {
  const [toastMessage, setToastMessage] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback((msg, duration = 3000) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToastMessage(msg);
    timerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
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
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
