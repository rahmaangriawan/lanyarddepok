"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
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
    success: (message: string, duration?: number) => addToast(message, "success", duration),
    error: (message: string, duration?: number) => addToast(message, "error", duration),
    warning: (message: string, duration?: number) => addToast(message, "warning", duration),
    info: (message: string, duration?: number) => addToast(message, "info", duration),
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
function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
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

  // Icon and colors mapping
  const styles = {
    success: {
      bg: "bg-emerald-50 border-emerald-100 text-emerald-800",
      icon: "lucide:check-circle",
      iconColor: "text-emerald-500",
      progressBg: "bg-emerald-500",
    },
    error: {
      bg: "bg-rose-50 border-rose-100 text-rose-800",
      icon: "lucide:alert-circle",
      iconColor: "text-rose-500",
      progressBg: "bg-rose-500",
    },
    warning: {
      bg: "bg-amber-50 border-amber-100 text-amber-800",
      icon: "lucide:alert-triangle",
      iconColor: "text-amber-500",
      progressBg: "bg-amber-500",
    },
    info: {
      bg: "bg-blue-50 border-blue-100 text-blue-800",
      icon: "lucide:info",
      iconColor: "text-blue-500",
      progressBg: "bg-blue-500",
    },
  }[type];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`pointer-events-auto flex items-start p-4 rounded-xl border shadow-lg transition-all duration-300 transform translate-x-0 animate-slide-down relative overflow-hidden ${styles.bg}`}
      role="alert"
    >
      <div className="flex-1 flex gap-3">
        <Icon icon={styles.icon} className={`h-5 w-5 shrink-0 ${styles.iconColor}`} />
        <div className="text-xs font-bold leading-relaxed">{message}</div>
      </div>
      <button
        onClick={onClose}
        className="ml-3 shrink-0 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
      >
        <Icon icon="lucide:x" className="h-4 w-4" />
      </button>

      {/* Progress Bar indicator */}
      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-black/5">
        <div
          className={`h-full transition-all duration-300 ease-linear ${styles.progressBg}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
