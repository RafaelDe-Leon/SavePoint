import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./icon";

export interface SegmentedOption {
  value: string;
  label?: string;
  icon?: IconName;
}

export interface SegmentedControlProps {
  options?: (string | SegmentedOption)[];
  value?: string;
  onChange?: (value: string) => void;
  size?: "sm" | "md";
  fullWidth?: boolean;
  /** Required when options are icon-only, to name the group. */
  "aria-label"?: string;
  className?: string;
}

/** Grid/list toggles, owned/all filters — two to four mutually exclusive views. */
export function SegmentedControl({
  options = [],
  value,
  onChange,
  size = "md",
  fullWidth = false,
  className,
  ...rest
}: SegmentedControlProps) {
  return (
    <div
      role="radiogroup"
      className={cn(
        "bg-surface-2 border-border-2 gap-0.5 rounded-md border p-[3px]",
        fullWidth ? "flex" : "inline-flex",
        className,
      )}
      {...rest}
    >
      {options.map((o) => {
        const opt: SegmentedOption = typeof o === "string" ? { value: o, label: o } : o;
        const on = opt.value === value;

        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={opt.label ?? opt.value}
            onClick={() => onChange?.(opt.value)}
            className={cn(
              "font-body inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-sm border-0 text-sm font-medium leading-none",
              "transition-[background-color,color] duration-[120ms]",
              size === "sm" ? "h-6" : "h-[30px]",
              opt.label ? "px-3" : "px-2",
              fullWidth && "flex-1",
              on
                ? "bg-surface-5 text-text-1 shadow-sm"
                : "text-text-3 hover:text-text-1 bg-transparent",
            )}
          >
            {opt.icon ? <Icon name={opt.icon} size={14} /> : null}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
