import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./icon";

const SIZES = {
  sm: { box: "h-[30px]", text: "text-md", icon: 16 },
  md: { box: "h-9", text: "text-md", icon: 16 },
  lg: { box: "h-12", text: "text-lg", icon: 18 },
} as const;

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Leading glyph inside the field. */
  icon?: IconName;
  inputSize?: keyof typeof SIZES;
  /** Rendered after the input — a clear button, a hint, a shortcut chip. */
  trailing?: React.ReactNode;
  invalid?: boolean;
  /** Forwarded to the <input> (a plain prop in React 19). */
  ref?: React.Ref<HTMLInputElement>;
  /** Classes for the outer field shell rather than the <input> itself. */
  className?: string;
}

export function Input({
  icon,
  inputSize = "md",
  trailing,
  invalid = false,
  disabled,
  className,
  ...rest
}: InputProps) {
  const s = SIZES[inputSize];

  return (
    <label
      className={cn(
        "bg-surface-2 text-text-3 flex cursor-text items-center gap-2 rounded-md border px-3",
        "transition-[border-color,box-shadow] duration-[120ms]",
        "focus-within:text-text-2 focus-within:shadow-[0_0_0_3px_var(--accent-ring)]",
        invalid
          ? "border-danger"
          : "border-border-2 focus-within:border-accent",
        disabled && "pointer-events-none opacity-50",
        s.box,
        className,
      )}
    >
      {icon ? <Icon name={icon} size={s.icon} /> : null}
      <input
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={cn(
          "text-text-1 placeholder:text-text-4 font-body h-full min-w-0 flex-1 border-0 bg-transparent p-0 leading-[1.2] outline-none",
          s.text,
        )}
        {...rest}
      />
      {trailing}
    </label>
  );
}
