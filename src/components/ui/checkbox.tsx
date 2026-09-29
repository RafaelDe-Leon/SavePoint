import { cn } from "@/lib/cn";
import { Icon } from "./icon";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Classes for the wrapping label. */
  className?: string;
}

/**
 * Backed by a real `<input type="checkbox">` — keyboard, form submission and
 * screen-reader semantics come from the platform; the visible box is styled
 * off the input's `:checked` state.
 */
export function Checkbox({
  label,
  description,
  disabled,
  className,
  ...rest
}: CheckboxProps) {
  return (
    <label
      className={cn(
        "inline-flex cursor-pointer items-start gap-2.5",
        disabled && "cursor-not-allowed opacity-45",
        className,
      )}
    >
      <input type="checkbox" disabled={disabled} className="peer sr-only" {...rest} />

      <span
        aria-hidden="true"
        className={cn(
          "bg-surface-2 border-border-3 text-on-accent mt-px inline-flex size-[18px] shrink-0 items-center justify-center rounded-sm border",
          "transition-[background-color,border-color] duration-[120ms]",
          "peer-checked:bg-accent peer-checked:border-accent",
          "peer-focus-visible:outline-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2",
          // The glyph lives inside this span, so it can't use peer-* directly.
          "[&>svg]:scale-75 [&>svg]:opacity-0 [&>svg]:transition [&>svg]:duration-[120ms]",
          "peer-checked:[&>svg]:scale-100 peer-checked:[&>svg]:opacity-100",
        )}
      >
        <Icon name="check" size={13} strokeWidth={2.5} />
      </span>

      {label || description ? (
        <span className="flex flex-col gap-0.5">
          {label ? (
            <span className="text-text-1 font-body text-md font-medium leading-[1.35]">
              {label}
            </span>
          ) : null}
          {description ? (
            <span className="text-text-3 font-body text-sm leading-[1.4]">
              {description}
            </span>
          ) : null}
        </span>
      ) : null}
    </label>
  );
}
