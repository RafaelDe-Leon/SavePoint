"use client";

import { createContext, useCallback, useContext, useSyncExternalStore } from "react";

import {
  ACCENT_STORAGE_KEY,
  DEFAULT_ACCENT,
  accentVars,
  isAccentId,
  type AccentId,
} from "@/lib/accents";

/* -------------------------------------------------------------------------- *
 * localStorage as an external store.
 *
 * useSyncExternalStore rather than useState + useEffect: the stored value
 * can't be read during server render, and React handles that split correctly
 * here — it hydrates with the server snapshot, then immediately re-renders
 * with the client one. Reading it in an effect instead would be a
 * set-state-in-effect and would render one frame with the wrong value.
 *
 * Visually none of this matters, because the blocking script in
 * layout.tsx has already applied the right custom properties. This only keeps
 * React's idea of the current accent in step with the DOM.
 * -------------------------------------------------------------------------- */

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Keeps other tabs in step when the preference changes.
  window.addEventListener("storage", emit);
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) window.removeEventListener("storage", emit);
  };
}

function getSnapshot(): AccentId {
  try {
    const stored = localStorage.getItem(ACCENT_STORAGE_KEY);
    return isAccentId(stored) ? stored : DEFAULT_ACCENT;
  } catch {
    // Private mode or blocked storage.
    return DEFAULT_ACCENT;
  }
}

function getServerSnapshot(): AccentId {
  return DEFAULT_ACCENT;
}

function apply(id: AccentId) {
  const style = document.documentElement.style;
  for (const [prop, value] of Object.entries(accentVars(id))) {
    style.setProperty(prop, value);
  }
  document.documentElement.setAttribute("data-accent", id);
}

/* -------------------------------------------------------------------------- */

interface AccentContextValue {
  accent: AccentId;
  setAccent: (id: AccentId) => void;
}

const AccentContext = createContext<AccentContextValue>({
  accent: DEFAULT_ACCENT,
  setAccent: () => {},
});

export function useAccent() {
  return useContext(AccentContext);
}

export function AccentProvider({ children }: { children: React.ReactNode }) {
  const accent = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setAccent = useCallback((id: AccentId) => {
    apply(id);
    try {
      localStorage.setItem(ACCENT_STORAGE_KEY, id);
    } catch {
      // Preference just won't persist.
    }
    emit();
  }, []);

  return <AccentContext value={{ accent, setAccent }}>{children}</AccentContext>;
}
