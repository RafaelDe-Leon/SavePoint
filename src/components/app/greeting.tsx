"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

function partOfDay(hour: number) {
  if (hour < 5) return "Late one";
  if (hour < 12) return "Morning";
  if (hour < 18) return "Afternoon";
  return "Evening";
}

/**
 * Time-aware greeting in the viewer's own timezone. The server can't know it,
 * so it renders a neutral fallback and the client fills in the real value
 * after hydration — no mismatch, no flash of the wrong time of day.
 */
export function Greeting({ name, waiting }: { name: string; waiting: number }) {
  const now = useSyncExternalStore(
    subscribe,
    () => new Date().toDateString(),
    () => null,
  );
  const date = now ? new Date() : null;

  return (
    <div>
      <p className="type-overline text-text-4 mb-3 min-h-[11px]">
        {date?.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
        })}
      </p>
      <h1 className="type-h1 sm:type-display text-text-1 text-pretty">
        {date ? partOfDay(date.getHours()) : "Welcome back"}, {name}.
        <br />
        <span className="text-text-3">
          <span className="font-mono tracking-normal">{waiting}</span> games
          waiting.
        </span>
      </h1>
    </div>
  );
}
