import { cn } from "@/lib/cn";

export interface ProgressSegment {
  value: number;
  color?: string;
  label?: string;
}

export interface ProgressBarProps {
  value?: number;
  max?: number;
  /** Multi-part bars — e.g. beaten / playing / backlog within one system. */
  segments?: ProgressSegment[];
  /** Fill color for the single-segment form. Platform color on shelf rows. */
  color?: string;
  height?: number;
  label?: React.ReactNode;
  /** Shows `n/total` for segmented bars, a percentage otherwise. */
  showValue?: boolean;
  className?: string;
}

/** The beaten-vs-owned bar. Drives the per-system rows in Library. */
export function ProgressBar({
  value = 0,
  max = 100,
  segments,
  color = "var(--accent)",
  height = 6,
  label,
  showValue = false,
  className,
}: ProgressBarProps) {
  const segs: ProgressSegment[] = segments ?? [{ value, color }];
  const total = segments
    ? Math.max(max, segs.reduce((a, s) => a + s.value, 0))
    : max;
  const primary = segs[0]?.value ?? 0;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label || showValue ? (
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-text-2 font-body text-sm font-medium leading-[1.2]">
            {label}
          </span>
          {showValue ? (
            <span className="text-text-3 font-mono text-xs font-medium leading-none tabular-nums">
              {segments
                ? `${primary}/${total}`
                : `${Math.round((value / max) * 100)}%`}
            </span>
          ) : null}
        </div>
      ) : null}

      <div
        role="progressbar"
        aria-valuenow={primary}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={typeof label === "string" ? label : "Progress"}
        className={cn(
          "bg-surface-4 flex overflow-hidden rounded-full",
          segments && "gap-0.5",
        )}
        style={{ height }}
      >
        {segs.map((s, i) => (
          <span
            key={i}
            title={s.label}
            className="transition-[width] duration-[320ms] ease-out"
            style={{
              width: `${total ? (s.value / total) * 100 : 0}%`,
              background: s.color ?? color,
            }}
          />
        ))}
      </div>
    </div>
  );
}
