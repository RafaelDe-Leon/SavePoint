import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./icon";

const SIZES = {
  sm: { box: "size-7", icon: 15 },
  md: { box: "size-9", icon: 18 },
  lg: { box: "size-11", icon: 20 },
} as const;

const VARIANTS = {
  ghost: {
    base: "bg-transparent border-transparent hover:bg-surface-3",
    active: "bg-surface-3",
  },
  secondary: {
    base: "bg-surface-3 border-border-2 hover:bg-surface-4",
    active: "bg-surface-4",
  },
} as const;

export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: IconName;
  /** Required — becomes both the accessible name and the tooltip. */
  label: string;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  /** Renders in accent, for toggled-on / current-view states. */
  active?: boolean;
}

export function IconButton({
  icon,
  label,
  variant = "ghost",
  size = "md",
  active = false,
  className,
  ...rest
}: IconButtonProps) {
  const s = SIZES[size];
  const v = VARIANTS[variant];

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center rounded-md border p-0",
        "transition-[background-color,color] duration-[120ms] ease-out",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40",
        s.box,
        v.base,
        active ? cn(v.active, "text-accent") : "text-text-2 hover:text-text-1",
        className,
      )}
      {...rest}
    >
      <Icon name={icon} size={s.icon} />
    </button>
  );
}
