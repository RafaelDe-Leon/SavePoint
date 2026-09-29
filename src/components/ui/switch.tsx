import { cn } from "@/lib/cn";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: React.ReactNode;
  /** Classes for the wrapping label. */
  className?: string;
}

/**
 * Real checkbox with `role="switch"` underneath. The knob is one of the two
 * places the spring easing is allowed.
 */
export function Switch({ label, disabled, className, ...rest }: SwitchProps) {
  return (
    <label
      className={cn(
        "inline-flex cursor-pointer items-center gap-2.5",
        disabled && "cursor-not-allowed opacity-45",
        className,
      )}
    >
      <input
        type="checkbox"
        role="switch"
        disabled={disabled}
        className="peer sr-only"
        {...rest}
      />

      <span
        aria-hidden="true"
        className={cn(
          "bg-surface-5 relative h-5 w-[34px] shrink-0 rounded-full",
          "transition-colors duration-200 ease-out",
          "peer-checked:bg-accent",
          "peer-focus-visible:outline-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2",
          // Knob — slides on the spring curve.
          "after:bg-ink-200 after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full",
          "after:transition-[left,background-color] after:duration-200 after:ease-[var(--ease-spring)]",
          "peer-checked:after:left-4 peer-checked:after:bg-(--on-accent)",
        )}
      />

      {label ? (
        <span className="text-text-1 font-body text-md font-medium leading-[1.3]">
          {label}
        </span>
      ) : null}
    </label>
  );
}
