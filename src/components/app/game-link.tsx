import Link from "next/link";

import { GameCard, type GameCardProps } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * A GameCard that navigates to the game page. GameCard's own `onClick` renders
 * a <button>, which can't carry an href, so the link wraps it instead and
 * supplies the hover lift the interactive cover would have had.
 */
export function GameLinkCard({
  slug,
  fluid = false,
  className,
  ...card
}: Omit<GameCardProps, "onClick"> & {
  slug: string;
  /** Stretch to the grid cell instead of the fixed `width`. */
  fluid?: boolean;
}) {
  return (
    <Link
      href={`/games/${slug}`}
      className={cn(
        "group block rounded-cover focus-visible:outline-accent focus-visible:outline-2 focus-visible:outline-offset-4",
        className,
      )}
    >
      <GameCard
        {...card}
        className={cn(
          "[&>:first-child]:transition-[transform,box-shadow] [&>:first-child]:duration-200 [&>:first-child]:ease-out",
          "group-hover:[&>:first-child]:-translate-y-[3px] group-hover:[&>:first-child]:shadow-cover",
          fluid && "w-full! [&>:first-child]:w-full!",
        )}
      />
    </Link>
  );
}
