"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { Toast } from "@/components/ui";
import type { SaveResult } from "@/lib/library-actions";

type Shown = { text: string; tone: "success" | "danger" };

interface ToastApi {
  /** Shows a toast directly. */
  show: (toast: Shown) => void;
  /** Turns a server action's result into the right toast, and passes it on. */
  report: (result: SaveResult) => SaveResult;
}

const ToastContext = createContext<ToastApi | null>(null);

/**
 * One toast at a time, bottom-right, dismissed after four seconds. Mounted
 * once around the signed-in app so every form shares the same slot — a new
 * confirmation replaces the last instead of stacking on top of it.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Shown | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const api = useMemo<ToastApi>(
    () => ({
      show: setToast,
      report: (result) => {
        if (result)
          setToast(
            result.ok
              ? { text: result.message, tone: "success" }
              : { text: result.error, tone: "danger" },
          );
        return result;
      },
    }),
    [],
  );

  return (
    <ToastContext value={api}>
      {children}
      <div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
        {toast ? (
          <Toast
            key={toast.text}
            tone={toast.tone}
            title={toast.text}
            onClose={() => setToast(null)}
            className="animate-[toast-in_320ms_var(--ease-spring)]"
          />
        ) : null}
      </div>
    </ToastContext>
  );
}

export function useToast() {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast needs a <ToastProvider> above it.");
  return api;
}

