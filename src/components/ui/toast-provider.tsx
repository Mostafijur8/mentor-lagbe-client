"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { ToastMessage } from "@/components/ui/toast";

type ToastKind = "success" | "error" | "info";
type ToastItem = { id: number; message: string; kind: ToastKind };
type ToastContextValue = { toast: (message: string, kind?: ToastKind) => void };
const ToastContext = createContext<ToastContextValue | null>(null);

// This provider shows brief feedback for user actions without requiring a toast package.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const toast = useCallback((message: string, kind: ToastKind = "success") => {
    const id = Date.now() + Math.random();
    setItems((current) => [...current, { id, message, kind }]);
    window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 3400);
  }, []);

  return <ToastContext.Provider value={{ toast }}>
    {children}
    <div className="toast-viewport" aria-live="polite" aria-atomic="false">
      {items.map((item) => <ToastMessage key={item.id} message={item.message} kind={item.kind} />)}
    </div>
  </ToastContext.Provider>;
}

// Components call this hook to announce a success or error after an action.
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context.toast;
}
