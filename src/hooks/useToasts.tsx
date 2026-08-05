import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { ToastsContainer, type ToastMessage, type ToastType } from "@/components/Toast";

interface ToastContextValue {
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info", duration = 5000) => {
      const id = `toast-${toastId++}`;
      setToasts((prev) => [...prev, { id, message, type }]);

      if (duration) {
        window.setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast],
  );

  const value = useMemo(
    () => ({ toasts, addToast, removeToast }),
    [toasts, addToast, removeToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastsContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToasts(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToasts must be used within a ToastProvider");
  }
  return context;
}
