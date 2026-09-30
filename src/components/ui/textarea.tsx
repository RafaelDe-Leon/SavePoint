"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
  /** Shows a mono `used / max` count under the field when `maxLength` is set. */
  count?: boolean;
  ref?: React.Ref<HTMLTextAreaElement>;
}

/**
 * Multi-line counterpart to Input — same surface, border and focus ring.
 * Resizes vertically only, so it can't break the layout sideways.
 */
export function Textarea({
  invalid = false,
  count = false,
  disabled,
  maxLength,
  value,
  defaultValue,
  className,
  rows = 4,
  onChange,
  ...rest
}: TextareaProps) {
  // Tracked here so the count also works when the field is uncontrolled.
  const [typed, setTyped] = useState(String(defaultValue ?? "").length);
  const used = value != null ? String(value).length : typed;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <textarea
        rows={rows}
        disabled={disabled}
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        aria-invalid={invalid || undefined}
        onChange={(e) => {
          setTyped(e.target.value.length);
          onChange?.(e);
        }}
        className={cn(
          "bg-surface-2 text-text-1 placeholder:text-text-4 font-body w-full resize-y rounded-md border px-3 py-2.5 text-md leading-[1.5] outline-none",
          "transition-[border-color,box-shadow] duration-[120ms]",
          "focus:shadow-[0_0_0_3px_var(--accent-ring)]",
          invalid ? "border-danger" : "border-border-2 focus:border-accent",
          disabled && "pointer-events-none opacity-50",
        )}
        {...rest}
      />
      {count && maxLength ? (
        <span
          className={cn(
            "self-end font-mono text-xs tabular-nums",
            used >= maxLength ? "text-danger" : "text-text-4",
          )}
        >
          {used}/{maxLength}
        </span>
      ) : null}
    </div>
  );
}
