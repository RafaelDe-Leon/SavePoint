import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./icon";

const SIZES = { sm: "h-[30px]", md: "h-9", lg: "h-11" } as const;

export type SelectOption = string | { value: string; label?: string };

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  options?: SelectOption[];
  selectSize?: keyof typeof SIZES;
  /** Leading glyph inside the control. */
  icon?: IconName;
  /** Classes for the wrapper rather than the <select>. */
  className?: string;
}

/** Native select under custom chrome — keeps platform pickers and a11y free. */
export function Select({
  options = [],
  selectSize = "md",
  icon,
  disabled,
  className,
  children,
  ...rest
}: SelectProps) {
  return (
    <span className={cn("relative inline-flex items-center", className)}>
      {icon ? (
        <Icon
          name={icon}
          size={15}
          className="text-text-3 pointer-events-none absolute left-[11px]"
        />
      ) : null}

      <select
        disabled={disabled}
        className={cn(
          // sp-select opts into the customizable-select styling in globals.css,
          // which anchors the picker snugly below the control in Chrome.
          "sp-select",
          "bg-surface-2 border-border-2 text-text-1 font-body w-full cursor-pointer appearance-none rounded-md border pr-[34px] text-md font-medium leading-none",
          // Chrome on Windows/Linux paints the popup list from the page, not
          // the OS, so the options need the surface set explicitly. macOS
          // ignores this and follows `color-scheme: dark` from globals.css.
          "[&>option]:bg-surface-2 [&>option]:text-text-1",
          icon ? "pl-8" : "pl-3",
          disabled && "opacity-50",
          SIZES[selectSize],
        )}
        {...rest}
      >
        {children ??
          options.map((o) => {
            const opt = typeof o === "string" ? { value: o, label: o } : o;
            return (
              <option key={opt.value} value={opt.value}>
                {opt.label ?? opt.value}
              </option>
            );
          })}
      </select>

      <Icon
        name="chevron-down"
        size={15}
        className="text-text-3 pointer-events-none absolute right-[11px]"
      />
    </span>
  );
}
