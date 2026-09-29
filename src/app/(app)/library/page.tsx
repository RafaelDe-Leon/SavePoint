import type { Metadata } from "next";
import Link from "next/link";

import { GameLinkCard } from "@/components/app/game-link";
import { LibraryToolbar } from "@/components/app/library-toolbar";
import {
  GameCover,
  PlatformTag,
  ProgressBar,
  Rating,
  StatusBadge,
} from "@/components/ui";
import {
  getShelf,
  isBeaten,
  isOwned,
  queryShelf,
  SHELF_SORTS,
  SHELF_TABS,
  systemOf,
  SYSTEMS,
  type ShelfGame,
} from "@/lib/sample-library";
import { getLibraryTabOrder } from "@/lib/preferences";
import { list, one, oneOf } from "@/lib/search-params";

export const metadata: Metadata = { title: "Library · Savepoint" };

const LIBRARY_VIEWS = { shelves: "Shelves", grid: "Grid", list: "List" } as const;
type LibraryView = keyof typeof LIBRARY_VIEWS;

const GRID = "grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:gap-x-5";

function Card({ g }: { g: ShelfGame }) {
  const s = systemOf(g.system);
  return (
    <GameLinkCard
      slug={g.slug}
      title={g.title}
      year={g.year}
      tint={g.tint}
      platform={s.platform}
      platformLabel={s.label}
      format={g.format}
      status={g.status}
      rating={g.rating}
      hours={g.hours}
      width={140}
      fluid
    />
  );
}

const ROW = "grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-4 px-3 md:grid-cols-[40px_minmax(0,2fr)_140px_130px_110px_60px]";

function ListView({ games }: { games: ShelfGame[] }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className={`${ROW} type-overline text-text-4 pb-2`} aria-hidden="true">
        <span />
        <span>Title</span>
        <span className="hidden md:block">System</span>
        <span>Status</span>
        <span className="hidden md:block">Rating</span>
        <span className="hidden text-right md:block">Time</span>
      </div>
      {games.map((g) => {
        const s = systemOf(g.system);
        return (
          <Link
            key={g.key}
            href={`/games/${g.slug}`}
            className={`${ROW} hover:bg-surface-2 rounded-md py-2 transition-colors duration-[120ms]`}
          >
            <GameCover title="" tint={g.tint} width={40} dimmed={g.status === "wishlist"} />
            <div className="min-w-0">
              <p className="text-text-1 font-body truncate text-md font-semibold">{g.title}</p>
              <p className="text-text-4 truncate font-mono text-xs">
                {g.year} · {g.developer}
              </p>
            </div>
            <div className="hidden md:block">
              <PlatformTag platform={s.platform} label={s.label} format={g.format} size="sm" />
            </div>
            <div>
              <StatusBadge status={g.status} size="sm" />
            </div>
            <div className="hidden md:block">
              {g.rating != null ? (
                <Rating value={g.rating} size={12} />
              ) : (
                <span className="text-text-4">—</span>
              )}
            </div>
            <span className="type-mono text-text-3 hidden text-right md:block">
              {g.hours ? `${g.hours}h` : "—"}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export default async function LibraryPage({ searchParams }: PageProps<"/library">) {
  const params = await searchParams;
  const tab = oneOf(params.tab, SHELF_TABS, "owned");
  const systems = list(params.system);
  const q = one(params.q) ?? "";
  const sort = oneOf(params.sort, SHELF_SORTS, "added");
  const view = oneOf<LibraryView>(params.view, LIBRARY_VIEWS, "shelves");

  const [{ games, tabCounts, systemCounts }, shelf, tabOrder] = await Promise.all([
    queryShelf({ tab, systems, q, sort }),
    getShelf(),
    getLibraryTabOrder(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-page flex-col gap-8 px-4 pt-8 pb-20 sm:px-8">
      <LibraryToolbar
        tab={tab}
        systems={systems}
        q={q}
        sort={sort}
        view={view}
        tabOptions={tabOrder.map((value) => ({
          value,
          label: SHELF_TABS[value].label,
          count: tabCounts[value],
        }))}
        defaultTabOrder={Object.keys(SHELF_TABS)}
        systemOptions={SYSTEMS.map((s) => ({ ...s, count: systemCounts[s.id] }))}
        sortOptions={Object.entries(SHELF_SORTS).map(([value, label]) => ({ value, label }))}
      />

      {games.length === 0 ? (
        <p className="text-text-3 font-body py-16 text-center text-md">
          Nothing matches. Clear a filter or log a game.
        </p>
      ) : view === "list" ? (
        <ListView games={games} />
      ) : view === "grid" ? (
        <div className={GRID}>
          {games.map((g) => (
            <Card key={g.key} g={g} />
          ))}
        </div>
      ) : (
        SYSTEMS.filter((s) => games.some((g) => g.system === s.id)).map((s) => {
          const owned = shelf.filter((g) => g.system === s.id && isOwned(g));
          const beaten = owned.filter(isBeaten).length;
          return (
            <section key={s.id} aria-label={s.label}>
              <div className="border-border-1 mb-4 flex flex-wrap items-center gap-4 border-b pb-3">
                <PlatformTag platform={s.platform} label={s.label} />
                <span className="type-mono text-text-3">
                  {beaten} of {owned.length} beaten
                </span>
                <ProgressBar
                  value={beaten}
                  max={owned.length || 1}
                  color={`var(--plat-${s.platform})`}
                  height={4}
                  className="w-30"
                />
              </div>
              <div className={GRID}>
                {games
                  .filter((g) => g.system === s.id)
                  .map((g) => (
                    <Card key={g.key} g={g} />
                  ))}
              </div>
            </section>
          );
        })
      )}
    </main>
  );
}
