"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";
import { PROFILE_TABS } from "@/lib/profile-shared";

/**
 * The profile's tab row. Styled like `Tabs`, but each tab is a page, so this
 * is a <nav> of links with `aria-current` rather than a `role="tablist"`.
 */
export function ProfileNav({
  base,
  counts = {},
}: {
  /** `/u/<username>` */
  base: string;
  /** Mono count per tab segment, where one is meaningful. */
  counts?: Partial<Record<string, number>>;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Profile"
      className="flex gap-[26px] overflow-x-auto overflow-y-hidden shadow-[inset_0_-1px_0_var(--border-1)] [scrollbar-width:none]"
    >
      {PROFILE_TABS.map((t) => {
        const href = t.segment ? `${base}/${t.segment}` : base;
        const on = t.segment
          ? pathname === href || pathname.startsWith(`${href}/`)
          : pathname === base;
        const count = counts[t.segment];

        return (
          <Link
            key={t.segment}
            href={href}
            aria-current={on ? "page" : undefined}
            className={cn(
              "font-body relative inline-flex items-center gap-[7px] pt-2.5 pb-[13px] text-md leading-none whitespace-nowrap",
              "transition-colors duration-[120ms]",
              on ? "text-text-1 font-semibold" : "text-text-3 hover:text-text-1 font-medium",
            )}
          >
            {/* Reserve the semibold width so the row doesn't shift. */}
            <span className="inline-grid">
              <span className="col-start-1 row-start-1">{t.label}</span>
              <span aria-hidden="true" className="invisible col-start-1 row-start-1 font-semibold">
                {t.label}
              </span>
            </span>
            {count != null ? (
              <span
                className={cn(
                  "rounded-xs px-[5px] py-[3px] font-mono text-[11px] font-medium leading-none tabular-nums",
                  on ? "text-text-1 bg-surface-4" : "text-text-4",
                )}
              >
                {count}
              </span>
            ) : null}
            <span
              aria-hidden="true"
              className={cn(
                "absolute right-0 bottom-0 left-0 h-0.5 rounded-sm",
                on ? "bg-accent" : "bg-transparent",
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}
