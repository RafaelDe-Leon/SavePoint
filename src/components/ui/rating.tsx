"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";
import { Icon } from "./icon";

export interface RatingProps {
  /** Supports halves — 3.5 renders three and a half stars. */
  value?: number;
  max?: number;
  /** Star edge length in px. */
  size?: number;
  /** Omit for a read-only display; supply to make the stars pickable. */
  onChange?: (value: number) => void;
  /** Appends the numeric value in the mono face. */
  showValue?: boolean;
  className?: string;
}

/**
 * Stars are Lucide `star` drawn at half-star precision — the left half of a
 * star picks `n.5`, the right half picks `n`.
 */
export function Rating({
  value = 0,
  max = 5,
  size = 14,
  onChange,
  showValue = false,
  className,
}: RatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value;
  const interactive = Boolean(onChange);

  const pick = (e: React.MouseEvent<HTMLElement>, i: number) => {
    const r = e.currentTarget.getBoundingClientRect();
    return i + (e.clientX - r.left < r.width / 2 ? 0.5 : 1);
  };

  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      onMouseLeave={() => setHover(null)}
    >
      <span
        className="inline-flex"
        style={{ gap: Math.round(size * 0.12) }}
        role={interactive ? "slider" : "img"}
        aria-label={`Rating: ${value} of ${max}`}
        aria-valuenow={interactive ? value : undefined}
        aria-valuemin={interactive ? 0 : undefined}
        aria-valuemax={interactive ? max : undefined}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={
          interactive
            ? (e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                  e.preventDefault();
                  onChange?.(Math.min(max, value + 0.5));
                } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                  e.preventDefault();
                  onChange?.(Math.max(0, value - 0.5));
                }
              }
            : undefined
        }
      >
        {Array.from({ length: max }).map((_, i) => {
          const fill = Math.max(0, Math.min(1, shown - i));
          return (
            <span
              key={i}
              className={cn(
                "text-rating-empty relative inline-block",
                interactive && "cursor-pointer",
              )}
              style={{ width: size, height: size }}
              onMouseMove={
                interactive ? (e) => setHover(pick(e, i)) : undefined
              }
              onClick={interactive ? (e) => onChange?.(pick(e, i)) : undefined}
            >
              <Icon name="star" size={size} fill="currentColor" />
              {fill > 0 ? (
                <span
                  className="text-rating absolute inset-0 overflow-hidden"
                  style={{ width: `${fill * 100}%` }}
                >
                  <Icon name="star" size={size} fill="currentColor" />
                </span>
              ) : null}
            </span>
          );
        })}
      </span>
      {showValue ? (
        <span
          className="text-text-2 font-mono font-medium leading-none"
          style={{ fontSize: Math.max(11, size - 2) }}
        >
          {shown ? shown.toFixed(1) : "–"}
        </span>
      ) : null}
    </span>
  );
}
