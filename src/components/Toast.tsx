"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { Icon } from "@iconify/react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextProps {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toast = {
    success: (message: string, duration?: number) =>
      addToast(message, "success", duration),
    error: (message: string, duration?: number) =>
      addToast(message, "error", duration),
    warning: (message: string, duration?: number) =>
      addToast(message, "warning", duration),
    info: (message: string, duration?: number) =>
      addToast(message, "info", duration),
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

/* ─── TOAST CONTAINER ─── */
function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

/* ─── TOAST ITEM ─── */
function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const { message, type, duration } = toast;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(duration || 4000);
  const [isHovered, setIsHovered] = useState(false);

  const startTimer = () => {
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onClose();
    }, remainingTimeRef.current);
  };

  const pauseTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      remainingTimeRef.current -= Date.now() - startTimeRef.current;
    }
  };

  useEffect(() => {
    if (!isHovered) {
      startTimer();
    } else {
      pauseTimer();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isHovered]);

  // Smooth animation progress bar
  useEffect(() => {
    if (isHovered) return;
    const interval = 30;
    const step = (interval / (duration || 4000)) * 100;
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const next = prev - step;
        return next <= 0 ? 0 : next;
      });
    }, interval);

    return () => clearInterval(progressTimer);
  }, [isHovered, duration]);

  // Icon and colors mapping (Modern Minimalist Style)
  const styles = {
    success: {
      bg: "bg-white border-gray-100 text-gray-800 shadow-md",
      icon: "lucide:check-circle-2",
      iconColor: "text-emerald-500 bg-emerald-50/70 p-0.5 rounded-md",
      progressBg: "bg-emerald-500",
    },
    error: {
      bg: "bg-white border-gray-100 text-gray-800 shadow-md",
      icon: "lucide:x-circle",
      iconColor: "text-rose-500 bg-rose-50/70 p-0.5 rounded-md",
      progressBg: "bg-rose-500",
    },
    warning: {
      bg: "bg-white border-gray-100 text-gray-800 shadow-md",
      icon: "lucide:alert-triangle",
      iconColor: "text-amber-500 bg-amber-50/70 p-0.5 rounded-md",
      progressBg: "bg-amber-500",
    },
    info: {
      bg: "bg-white border-gray-100 text-gray-800 shadow-md",
      icon: "lucide:info",
      iconColor: "text-blue-500 bg-blue-50/70 p-0.5 rounded-md",
      progressBg: "bg-blue-500",
    },
  }[type];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`pointer-events-auto flex items-center p-3.5 rounded-xl border border-gray-100 transition-all duration-300 transform translate-x-0 relative overflow-hidden backdrop-blur-md bg-white/95 scale-100 hover:scale-[1.01] ${styles.bg}`}
      style={{
        boxShadow:
          "0 10px 30px -10px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02)",
      }}
      role="alert"
    >
      <div className="flex-1 flex items-center gap-3">
        <div className="shrink-0 flex items-center justify-center">
          <Icon
            icon={styles.icon}
            className={`h-5.5 w-5.5 ${styles.iconColor}`}
          />
        </div>
        <div className="text-[11px] font-semibold text-gray-700 leading-normal pr-2">
          {message}
        </div>
      </div>
      <button
        onClick={onClose}
        className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer p-0.5 rounded-md hover:bg-gray-50"
      >
        <Icon icon="lucide:x" className="h-3.5 w-3.5" />
      </button>

      {/* Progress Bar indicator */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gray-50">
        <div
          className={`h-full transition-all duration-300 ease-linear ${styles.progressBg}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
