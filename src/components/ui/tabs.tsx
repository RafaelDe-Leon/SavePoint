import { cn } from "@/lib/cn";

export interface TabItem {
  value: string;
  label: React.ReactNode;
  /** Rendered as a mono pill after the label. */
  count?: number;
}

export interface TabsProps {
  items?: TabItem[];
  value?: string;
  onChange?: (value: string) => void;
  size?: "sm" | "md";
  className?: string;
}

/** Underlined tabs on a hairline rule. The active underline is the accent. */
export function Tabs({
  items = [],
  value,
  onChange,
  size = "md",
  className,
}: TabsProps) {
  const sm = size === "sm";

  return (
    <div
      role="tablist"
      className={cn(
        // The rule is an inset shadow, not a border, so the active underline
        // can sit on it at bottom-0 without overhanging. An overhang would
        // make this horizontally-scrollable box scroll vertically too.
        "flex overflow-x-auto overflow-y-hidden shadow-[inset_0_-1px_0_var(--border-1)] [scrollbar-width:none]",
        sm ? "gap-[18px]" : "gap-[26px]",
        className,
      )}
    >
      {items.map((it) => {
        const on = it.value === value;

        return (
          <button
            key={it.value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange?.(it.value)}
            className={cn(
              "font-body relative inline-flex cursor-pointer items-center gap-[7px] border-0 bg-none leading-none whitespace-nowrap",
              "transition-colors duration-[120ms]",
              sm ? "pt-2 pb-2.5 text-sm" : "pt-2.5 pb-[13px] text-md",
              on
                ? "text-text-1 font-semibold"
                : "text-text-3 hover:text-text-1 font-medium",
            )}
          >
            {/* The active tab goes semibold; an invisible semibold copy
             * reserves that width on every tab so switching doesn't nudge
             * its neighbours sideways. */}
            <span className="inline-grid">
              <span className="col-start-1 row-start-1">{it.label}</span>
              <span aria-hidden="true" className="invisible col-start-1 row-start-1 font-semibold">
                {it.label}
              </span>
            </span>

            {it.count != null ? (
              <span
                className={cn(
                  "rounded-xs px-[5px] py-[3px] font-mono text-[11px] font-medium leading-none tabular-nums",
                  on ? "text-text-1 bg-surface-4" : "text-text-4 bg-transparent",
                )}
              >
                {it.count}
              </span>
            ) : null}

            <span
              aria-hidden="true"
              className={cn(
                "absolute bottom-0 left-0 right-0 h-0.5 rounded-sm",
                on ? "bg-accent" : "bg-transparent",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
