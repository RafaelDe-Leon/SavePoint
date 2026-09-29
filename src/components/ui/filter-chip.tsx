import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./icon";

export interface FilterChipProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  label: React.ReactNode;
  selected?: boolean;
  /** Mono count appended inside the chip. */
  count?: number;
  /** Swatch before the label — status or platform hue. */
  color?: string;
  icon?: IconName;
  /** Shows an x when selected, for chips that clear a filter. */
  removable?: boolean;
  size?: "sm" | "md";
}

/**
 * Selected chips invert to `--text-1` on the app background rather than going
 * volt — volt is reserved for the single primary action per view.
 */
export function FilterChip({
  label,
  selected = false,
  count,
  color,
  icon,
  removable = false,
  size = "md",
  className,
  ...rest
}: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "font-body inline-flex cursor-pointer items-center gap-[7px] rounded-full border text-sm font-medium leading-none whitespace-nowrap",
        "transition-[background-color,border-color,color] duration-[120ms]",
        size === "sm" ? "h-[26px] px-2.5" : "h-[30px] px-3",
        selected
          ? "bg-text-1 border-text-1 text-bg-app"
          : "text-text-2 border-border-2 hover:border-border-3 hover:bg-surface-3 bg-transparent",
        className,
      )}
      {...rest}
    >
      {color ? (
        <span
          aria-hidden="true"
          className="size-[7px] shrink-0 rounded-[2px]"
          style={{ background: color }}
        />
      ) : null}
      {icon ? <Icon name={icon} size={14} /> : null}
      {label}
      {count != null ? (
        <span className="font-mono text-[11px] font-medium leading-none tabular-nums opacity-60">
          {count}
        </span>
      ) : null}
      {removable && selected ? <Icon name="x" size={13} /> : null}
    </button>
  );
}
