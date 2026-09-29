import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./icon";

const VARIANTS = {
  primary:
    "bg-accent text-on-accent border-transparent hover:bg-accent-hover active:bg-accent-press",
  secondary:
    "bg-surface-3 text-text-1 border-border-2 hover:bg-surface-4",
  ghost:
    "bg-transparent text-text-2 border-transparent hover:bg-surface-3 hover:text-text-1",
  danger:
    "bg-danger-soft text-danger border-transparent hover:bg-danger-soft-hover",
} as const;

const SIZES = {
  sm: "h-7 gap-1.5 px-2.5 text-sm",
  md: "h-9 gap-2 px-3.5 text-md",
  lg: "h-11 gap-2 px-[18px] text-[15px]",
} as const;

const ICON_SIZE = { sm: 14, md: 16, lg: 18 } as const;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  /** Leading glyph. */
  icon?: IconName;
  /** Trailing glyph. */
  iconRight?: IconName;
  fullWidth?: boolean;
}

/**
 * Button styling without the <button> — for a `<Link>` that should look like
 * one. Nesting a <button> inside an <a> is invalid HTML, so use this instead.
 */
export function buttonClassName({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: Pick<ButtonProps, "variant" | "size" | "fullWidth" | "className"> = {}) {
  return cn(
    "font-body inline-flex cursor-pointer items-center justify-center rounded-md border font-semibold leading-none tracking-body whitespace-nowrap",
    "transition-[background-color,color,transform] duration-[120ms] ease-out",
    "active:scale-[0.97]",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40",
    VARIANTS[variant],
    SIZES[size],
    fullWidth && "flex w-full",
    className,
  );
}

/**
 * At most one `primary` button per view — volt is the loudest thing on screen.
 * Labels are sentence case ("Log a game").
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  fullWidth = false,
  type = "button",
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, fullWidth, className })}
      {...rest}
    >
      {icon ? <Icon name={icon} size={ICON_SIZE[size]} /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} size={ICON_SIZE[size]} /> : null}
    </button>
  );
}
