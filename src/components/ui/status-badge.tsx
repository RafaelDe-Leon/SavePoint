import { cn } from "@/lib/cn";
import { STATUS_META, type GameStatus } from "@/lib/game";
import { Icon } from "./icon";

export interface StatusBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  status?: GameStatus;
  /** `soft` tints the status color; `solid` fills with it. */
  variant?: "soft" | "solid";
  size?: "sm" | "md";
  showIcon?: boolean;
  /** Overrides the canonical status label. */
  label?: string;
}

/**
 * Status is never communicated by color alone — the badge always carries a
 * label, and a glyph by default.
 */
export function StatusBadge({
  status = "backlog",
  variant = "soft",
  size = "md",
  showIcon = true,
  label,
  className,
  style,
  ...rest
}: StatusBadgeProps) {
  const meta = STATUS_META[status];
  const sm = size === "sm";

  return (
    <span
      // The status hue drives background, ring and text; expose it once as a
      // custom property so the utility classes below stay static.
      style={{ ...style, "--status": meta.color } as React.CSSProperties}
      className={cn(
        "font-body inline-flex items-center rounded-sm font-semibold leading-none whitespace-nowrap",
        sm ? "h-5 gap-1 px-1.5 text-[11px]" : "h-6 gap-[5px] px-2 text-xs",
        variant === "solid"
          ? "bg-(--status) text-ink-950"
          : "bg-[color-mix(in_oklch,var(--status)_14%,transparent)] text-(--status) shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--status)_26%,transparent)]",
        className,
      )}
      {...rest}
    >
      {showIcon ? <Icon name={meta.icon} size={sm ? 11 : 13} /> : null}
      {label ?? meta.label}
    </span>
  );
}
