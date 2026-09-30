"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Wordmark } from "@/components/landing/site-nav";
import { Avatar, Button, Icon, IconButton } from "@/components/ui";
import { cn } from "@/lib/cn";
import { NavSearch } from "./nav-search";

const LINKS = [
  { href: "/home", label: "Home" },
  { href: "/library", label: "Library" },
  { href: "/games", label: "Games" },
];

/**
 * The signed-in app bar. "Log a game" is the view's one volt button, so pages
 * under this nav keep their own actions secondary or ghost.
 */
export function TopNav({
  userName,
  username,
  avatarUrl,
}: {
  userName: string;
  username: string;
  avatarUrl?: string;
}) {
  const pathname = usePathname();

  return (
    <header className="bg-ink-950/78 border-border-1 sticky top-0 z-30 border-b backdrop-blur-[14px]">
      <div className="mx-auto flex h-nav w-full max-w-page items-center gap-4 px-4 sm:gap-8 sm:px-8">
        <Wordmark href="/home" />

        <nav className="flex gap-4 sm:gap-6">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "font-body border-b-2 py-2 text-md font-medium transition-colors duration-[120ms]",
                  active
                    ? "text-text-1 border-accent"
                    : "text-text-3 hover:text-text-1 border-transparent",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        <NavSearch className="hidden w-60 lg:block" />
        <Link
          href="/games"
          aria-label="Search games"
          className="text-text-2 hover:text-text-1 hover:bg-surface-3 inline-flex size-9 items-center justify-center rounded-md transition-colors duration-[120ms] lg:hidden"
        >
          <Icon name="search" size={18} />
        </Link>
        <IconButton icon="bell" label="Notifications" className="hidden sm:inline-flex" />
        <Button icon="plus" className="hidden md:inline-flex">
          Log a game
        </Button>
        <Link
          href={`/u/${username}`}
          aria-label="Your profile"
          aria-current={pathname.startsWith(`/u/${username}`) ? "page" : undefined}
          className="focus-visible:outline-accent rounded-[10px] focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <Avatar name={userName} src={avatarUrl} size={32} />
        </Link>
      </div>
    </header>
  );
}
