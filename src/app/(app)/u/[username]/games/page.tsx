import type { Metadata } from "next";

import { Empty } from "@/components/app/field";
import { GameLinkCard } from "@/components/app/game-link";
import { ShelfFilter } from "@/components/profile/shelf-filter";
import {
  queryShelf,
  SHELF_SORTS,
  SHELF_TABS,
  systemOf,
  uniqueGames,
} from "@/lib/sample-library";
import { oneOf } from "@/lib/search-params";

export const metadata: Metadata = { title: "Games · Savepoint" };

/**
 * Every game you've logged, one card per game. The Library groups copies by
 * system for managing them; this is the at-a-glance view others would see.
 */
export default async function ProfileGamesPage({ searchParams }: PageProps<"/u/[username]/games">) {
  const params = await searchParams;
  const tab = oneOf(params.tab, SHELF_TABS, "owned");
  const sort = oneOf(params.sort, SHELF_SORTS, "added");
  const { games, tabCounts } = await queryShelf({ tab, sort });
  const shown = uniqueGames(games);

  return (
    <div className="flex flex-col gap-6">
      <ShelfFilter
        tab={tab}
        sort={sort}
        tabs={Object.entries(SHELF_TABS).map(([value, t]) => ({
          value,
          label: t.label,
          count: tabCounts[value as keyof typeof SHELF_TABS],
        }))}
        sorts={Object.entries(SHELF_SORTS).map(([value, label]) => ({ value, label }))}
      />

      {shown.length ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:gap-x-5">
          {shown.map((g) => {
            const s = systemOf(g.system);
            return (
              <GameLinkCard
                key={g.id}
                slug={g.slug}
                title={g.title}
                year={g.year}
                tint={g.tint}
                platform={s.platform}
                // A game on several systems shows the first plus a count.
                platformLabel={g.copies.length > 1 ? `${s.label} +${g.copies.length - 1}` : s.label}
                format={g.copies.length > 1 ? undefined : g.format}
                status={g.status}
                rating={g.rating}
                hours={g.hours}
                width={140}
                fluid
              />
            );
          })}
        </div>
      ) : (
        <Empty>No games with that status. Pick another, or log a game.</Empty>
      )}
    </div>
  );
}
