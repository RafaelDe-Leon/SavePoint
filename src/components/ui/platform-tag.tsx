import { cn } from "@/lib/cn";
import { PLATFORM_META, type GameFormat, type Platform } from "@/lib/game";
import { Icon } from "./icon";

export interface PlatformTagProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  platform?: Platform;
  /** Overrides the family label with a specific system ("Switch", "PS5"). */
  label?: string;
  /** Adds a disc (physical) or cloud (digital) glyph. */
  format?: GameFormat;
  size?: "sm" | "md";
}

/**
 * Platform color appears only as the small swatch — the tag chrome itself stays
 * neutral so shelves don't turn into a rainbow.
 */
export function PlatformTag({
  platform = "pc",
  label,
  format,
  size = "md",
  className,
  ...rest
}: PlatformTagProps) {
  const meta = PLATFORM_META[platform];
  const sm = size === "sm";

  return (
    <span
      className={cn(
        "font-body bg-surface-3 text-text-2 inline-flex items-center gap-1.5 rounded-sm font-medium leading-none whitespace-nowrap shadow-[inset_0_0_0_1px_var(--border-2)]",
        sm ? "h-5 px-1.5 text-[11px]" : "h-6 px-2 text-xs",
        className,
      )}
      {...rest}
    >
      <span
        aria-hidden="true"
        style={{ background: meta.color }}
        className={cn("shrink-0 rounded-[2px]", sm ? "size-1.5" : "size-[7px]")}
      />
      {label ?? meta.label}
      {format ? (
        <>
          <Icon
            name={format === "physical" ? "disc-3" : "cloud-download"}
            size={sm ? 11 : 12}
            className="text-text-3"
          />
          <span className="sr-only">{format}</span>
        </>
      ) : null}
    </span>
  );
}
