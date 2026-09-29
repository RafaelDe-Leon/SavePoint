import { cn } from "@/lib/cn";

export interface StatProps {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Secondary line in the mono face — "of 57 owned", "+3 this month". */
  sub?: React.ReactNode;
  /** Swatch before the label, for status- or platform-keyed stats. */
  color?: string;
  size?: "md" | "lg";
  align?: "left" | "center";
  className?: string;
}

/** Numbers over adjectives — the house style for every count in the product. */
export function Stat({
  label,
  value,
  sub,
  color,
  size = "md",
  align = "left",
  className,
}: StatProps) {
  const lg = size === "lg";

  return (
    <div
      className={cn(
        "flex flex-col",
        lg ? "gap-2" : "gap-1.5",
        align === "center" ? "items-center" : "items-start",
        className,
      )}
    >
      <span className="text-text-3 font-body inline-flex items-center gap-1.5 text-xs font-medium leading-none">
        {color ? (
          <span
            aria-hidden="true"
            className="size-[7px] rounded-[2px]"
            style={{ background: color }}
          />
        ) : null}
        {label}
      </span>

      <span
        className={cn(
          "text-text-1 font-display font-bold leading-none tabular-nums",
          lg ? "text-[40px]" : "text-3xl",
        )}
        style={{ letterSpacing: "-0.03em" }}
      >
        {value}
      </span>

      {sub ? (
        <span className="text-text-4 font-mono text-xs font-medium leading-[1.2]">
          {sub}
        </span>
      ) : null}
    </div>
  );
}
