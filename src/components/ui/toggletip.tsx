"use client";

import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./icon";

export interface ToggletipProps {
  /** The explanation. Keep it to a sentence or two. */
  content: React.ReactNode;
  /** Accessible name for the trigger, e.g. "About systems". */
  label: string;
  icon?: IconName;
  side?: "top" | "bottom";
  /** Horizontal anchor of the bubble relative to the trigger. */
  align?: "start" | "center";
  /**
   * `sm` sizes the glyph to the cap height of 11px overlines, so it reads as
   * part of the label rather than towering over it.
   */
  size?: "sm" | "md";
  className?: string;
}

/**
 * A tooltip you click rather than hover — for help text that must work on
 * touch and be reachable by keyboard. Unlike `Tooltip` it holds state, so it's
 * a Client Component.
 *
 * Follows the toggletip pattern: the content is injected into a live region
 * when opened, so screen readers announce it. Escape and outside clicks close
 * it; Escape is stopped here so it doesn't also close a surrounding dialog.
 */
export function Toggletip({
  content,
  label,
  icon = "info",
  side = "top",
  align = "center",
  size = "md",
  className,
}: ToggletipProps) {
  const sm = size === "sm";
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <span ref={ref} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && open) {
            e.preventDefault();
            e.stopPropagation();
            setOpen(false);
          }
        }}
        className={cn(
          "inline-flex cursor-pointer items-center justify-center rounded-full",
          sm ? "size-4" : "size-5",
          "transition-colors duration-[120ms]",
          "focus-visible:outline-accent focus-visible:outline-2 focus-visible:outline-offset-2",
          open ? "text-text-1 bg-surface-4" : "text-text-3 hover:text-text-1 hover:bg-surface-4",
        )}
      >
        <Icon name={icon} size={sm ? 12 : 14} strokeWidth={sm ? 2 : 1.75} />
      </button>

      <span id={id} role="status" className="contents">
        {open ? (
          <span
            className={cn(
              "bg-ink-100 text-ink-950 font-body absolute z-50 w-64 rounded-md px-3 py-2 text-sm leading-[1.4] font-medium normal-case tracking-normal shadow-md",
              "animate-[toggletip-in_120ms_var(--ease-out)]",
              side === "bottom" ? "top-full mt-2" : "bottom-full mb-2",
              align === "center" ? "left-1/2 -translate-x-1/2" : "-left-1",
            )}
          >
            {content}
          </span>
        ) : null}
      </span>
    </span>
  );
}
