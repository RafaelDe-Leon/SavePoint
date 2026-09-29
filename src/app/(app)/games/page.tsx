import type { Metadata } from "next";
import Link from "next/link";

import { GamesToolbar } from "@/components/app/games-toolbar";
import { GameCover, Icon, StatusBadge } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  CATALOG_SORTS,
  catalogSize,
  listGenres,
  searchCatalog,
} from "@/lib/catalog/queries";
import { PLATFORM_META, type Platform } from "@/lib/game";
import { getShelfStatuses } from "@/lib/sample-library";
import { list, one, oneOf, type SearchParams } from "@/lib/search-params";

export const metadata: Metadata = { title: "Games · Savepoint" };

const PAGE_SIZE = 28;

/** Rebuilds the current URL with a different page, keeping every filter. */
function pageHref(params: SearchParams, page: number) {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    const value = one(v);
    if (value && k !== "page") next.set(k, value);
  }
  if (page > 1) next.set("page", String(page));
  const qs = next.toString();
  return qs ? `/games?${qs}` : "/games";
}

function Pagination({
  params,
  page,
  pageCount,
}: {
  params: SearchParams;
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;
  const link = "font-body inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-md font-medium transition-colors duration-[120ms]";
  return (
    <nav aria-label="Pages" className="flex items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link href={pageHref(params, page - 1)} className={cn(link, "text-text-2 hover:bg-surface-3")} aria-label="Previous page">
          <Icon name="chevron-left" />
        </Link>
      ) : null}
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={pageHref(params, n)}
          aria-current={n === page ? "page" : undefined}
          className={cn(
            link,
            "font-mono",
            n === page ? "bg-surface-4 text-text-1" : "text-text-3 hover:bg-surface-3 hover:text-text-1",
          )}
        >
          {n}
        </Link>
      ))}
      {page < pageCount ? (
        <Link href={pageHref(params, page + 1)} className={cn(link, "text-text-2 hover:bg-surface-3")} aria-label="Next page">
          <Icon name="chevron-right" />
        </Link>
      ) : null}
    </nav>
  );
}

export default async function GamesPage({ searchParams }: PageProps<"/games">) {
  const params = await searchParams;
  const q = one(params.q) ?? "";
  const platforms = list(params.platform).filter(
    (p): p is Platform => p in PLATFORM_META,
  );
  const genre = one(params.genre) ?? "";
  const sort = oneOf(params.sort, CATALOG_SORTS, "popular");
  const page = Number(one(params.page)) || 1;

  const [results, genres, size, statuses] = await Promise.all([
    searchCatalog({ q, platforms, genre: genre || undefined, sort, page, pageSize: PAGE_SIZE }),
    listGenres(),
    catalogSize(),
    getShelfStatuses(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-page flex-col gap-6 px-4 pt-8 pb-20 sm:px-8">
      <div>
        <h1 className="type-h1 text-text-1">Games</h1>
        <p className="type-mono text-text-3 mt-2">
          {size} in the catalog
          {q || platforms.length || genre ? ` · ${results.total} match` : null}
        </p>
      </div>

      <GamesToolbar
        q={q}
        platforms={platforms}
        genre={genre}
        sort={sort}
        genres={genres}
        sortOptions={Object.entries(CATALOG_SORTS).map(([value, label]) => ({ value, label }))}
      />

      {results.items.length === 0 ? (
        <p className="text-text-3 font-body py-16 text-center text-md">
          {q ? `Nothing called “${q}”. Check the spelling or clear a filter.` : "Nothing matches. Clear a filter."}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] sm:gap-x-5">
          {results.items.map((g) => {
            const status = statuses.get(g.id);
            return (
              <Link
                key={g.id}
                href={`/games/${g.slug}`}
                className="group flex min-w-0 flex-col gap-2 rounded-cover focus-visible:outline-accent focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                <GameCover
                  title={g.title}
                  tint={g.tint}
                  width={150}
                  className="w-full! transition-[transform,box-shadow] duration-200 ease-out group-hover:-translate-y-[3px] group-hover:shadow-cover"
                />
                <div className="min-w-0">
                  <p className="text-text-1 font-body truncate text-sm font-semibold">{g.title}</p>
                  <div className="mt-1 flex min-h-5 items-center justify-between gap-1.5">
                    <span className="text-text-4 truncate font-mono text-xs">
                      {g.year} · {g.genres[0]}
                    </span>
                    {status ? <StatusBadge status={status} size="sm" showIcon={false} /> : null}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Pagination params={params} page={results.page} pageCount={results.pageCount} />
    </main>
  );
}
