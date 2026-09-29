import Link from "next/link";

import { cn } from "@/lib/cn";

export function Wordmark({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "font-display text-text-1 text-2xl font-extrabold tracking-[-0.04em]",
        className,
      )}
    >
      savepoint<span className="text-accent">.</span>
    </Link>
  );
}

/**
 * Sticky, 78% ink with the 14px blur — one of the two places the design
 * system allows blur. Sits over the hero's cover wall.
 */
export function SiteNav() {
  return (
    <header className="bg-ink-950/78 border-border-1/60 sticky top-0 z-30 border-b backdrop-blur-[14px]">
      <nav className="mx-auto flex h-nav w-full max-w-page items-center justify-between gap-4 px-4 sm:px-8">
        <Wordmark />
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/login"
            className="text-text-2 hover:text-text-1 font-body rounded-md px-3 py-2 text-md font-medium transition-colors duration-[120ms]"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="bg-surface-3 border-border-2 hover:bg-surface-4 text-text-1 font-body rounded-md border px-3.5 py-2 text-md font-semibold transition-colors duration-[120ms]"
          >
            Sign up
          </Link>
        </div>
      </nav>
    </header>
  );
}
