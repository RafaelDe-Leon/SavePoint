import { cn } from "@/lib/cn";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom";
  className?: string;
}

/**
 * CSS-only — shows on hover and on keyboard focus within the trigger, so it
 * needs no state and stays a Server Component.
 */
export function Tooltip({
  content,
  children,
  side = "top",
  className,
}: TooltipProps) {
  return (
    <span className={cn("group relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "bg-ink-100 text-ink-950 font-body pointer-events-none absolute left-1/2 z-50 rounded-md px-2 py-1.5 text-xs font-medium leading-[1.3] whitespace-nowrap opacity-0 shadow-md",
          "transition-[opacity,transform] duration-[120ms] ease-out",
          "group-hover:opacity-100 group-focus-within:opacity-100",
          side === "bottom"
            ? "top-full mt-1.5 -translate-x-1/2 -translate-y-[3px] group-hover:translate-y-0 group-focus-within:translate-y-0"
            : "bottom-full mb-1.5 -translate-x-1/2 translate-y-[3px] group-hover:translate-y-0 group-focus-within:translate-y-0",
        )}
      >
        {content}
      </span>
    </span>
  );
}
