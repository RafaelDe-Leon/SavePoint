"use client";

import { cn } from "@/lib/cn";
import { ACCENTS, ACCENT_IDS, type AccentId } from "@/lib/accents";
import { Icon } from "@/components/ui/icon";
import { useAccent } from "./accent-provider";

export interface AccentPickerProps {
  size?: "sm" | "md";
  className?: string;
}

/**
 * Swatch row for choosing the accent. Reads ACCENTS directly, so a color added
 * to the registry shows up here with no change to this file.
 */
export function AccentPicker({ size = "md", className }: AccentPickerProps) {
  const { accent, setAccent } = useAccent();
  const sm = size === "sm";

  return (
    <div
      role="radiogroup"
      aria-label="Accent color"
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      {ACCENT_IDS.map((id: AccentId) => {
        const theme = ACCENTS[id];
        const on = id === accent;

        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={theme.label}
            title={theme.label}
            onClick={() => setAccent(id)}
            style={{
              background: theme.ramp[400],
              color: theme.ramp.contrast,
            }}
            className={cn(
              "inline-flex cursor-pointer items-center justify-center rounded-full",
              "transition-[transform,box-shadow] duration-[120ms] ease-out",
              "hover:scale-105",
              sm ? "size-6" : "size-8",
              on
                ? "shadow-[0_0_0_2px_var(--bg-app),0_0_0_4px_var(--text-1)]"
                : "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]",
            )}
          >
            {on ? <Icon name="check" size={sm ? 12 : 15} strokeWidth={2.5} /> : null}
          </button>
        );
      })}
    </div>
  );
}
