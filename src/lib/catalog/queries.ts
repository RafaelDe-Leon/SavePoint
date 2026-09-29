import type { Platform } from "@/lib/game";
import { CATALOG, type CatalogGame } from "./data";

export type { CatalogGame };

/**
 * The catalog's read API. Every function is async and returns plain data, the
 * same contract a database or IGDB client would have — replace the bodies,
 * keep the signatures, and no page needs to change.
 */

export const CATALOG_SORTS = {
  popular: "Popular",
  rating: "Top rated",
  newest: "Newest",
  title: "Title",
} as const;
export type CatalogSort = keyof typeof CATALOG_SORTS;

export interface CatalogQuery {
  q?: string;
  /** Match games released on any of these families. */
  platforms?: Platform[];
  genre?: string;
  sort?: CatalogSort;
  /** 1-based. */
  page?: number;
  pageSize?: number;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageCount: number;
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Relevance of a title to a query: exact > prefix > word-prefix > substring,
 * and every query word must appear somewhere. 0 means no match.
 */
function relevance(game: CatalogGame, q: string) {
  const title = normalize(game.title);
  const words = q.split(" ");
  const haystack = `${title} ${normalize(game.developer)}`;
  if (!words.every((w) => haystack.includes(w))) return 0;
  if (title === q) return 4;
  if (title.startsWith(q)) return 3;
  if (title.split(" ").some((w) => w.startsWith(words[0]))) return 2;
  return 1;
}

const SORTERS: Record<CatalogSort, (a: CatalogGame, b: CatalogGame) => number> = {
  popular: (a, b) => b.popularity - a.popularity,
  rating: (a, b) => b.avgRating - a.avgRating || b.ratingCount - a.ratingCount,
  newest: (a, b) => b.year - a.year || b.popularity - a.popularity,
  title: (a, b) => a.title.localeCompare(b.title),
};

export async function searchCatalog({
  q = "",
  platforms = [],
  genre,
  sort = "popular",
  page = 1,
  pageSize = 24,
}: CatalogQuery = {}): Promise<Page<CatalogGame>> {
  const query = normalize(q);

  let results = CATALOG.filter(
    (g) =>
      (!platforms.length || g.platforms.some((p) => platforms.includes(p))) &&
      (!genre || g.genres.includes(genre)),
  );

  if (query) {
    // A text query ranks by relevance first; the chosen sort breaks ties.
    const scored = results
      .map((g) => ({ g, score: relevance(g, query) }))
      .filter((r) => r.score > 0);
    scored.sort((a, b) => b.score - a.score || SORTERS[sort](a.g, b.g));
    results = scored.map((r) => r.g);
  } else {
    results = [...results].sort(SORTERS[sort]);
  }

  const total = results.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  return {
    items: results.slice((current - 1) * pageSize, current * pageSize),
    total,
    page: current,
    pageCount,
  };
}

/** Typeahead: the few best matches for a partial title, most relevant first. */
export async function suggestGames(q: string, limit = 6) {
  const query = normalize(q);
  if (!query) return [];
  const { items } = await searchCatalog({ q: query, pageSize: limit });
  return items;
}

export async function getGameBySlug(slug: string) {
  return CATALOG.find((g) => g.slug === slug) ?? null;
}

export async function getGamesByIds(ids: number[]) {
  const byId = new Map(CATALOG.map((g) => [g.id, g]));
  return ids.map((id) => byId.get(id)).filter((g): g is CatalogGame => !!g);
}

/** Games sharing a genre with this one, most popular first. */
export async function getSimilarGames(game: CatalogGame, limit = 6) {
  return CATALOG.filter(
    (g) => g.id !== game.id && g.genres.some((x) => game.genres.includes(x)),
  )
    .sort(SORTERS.popular)
    .slice(0, limit);
}

export async function listGenres() {
  return [...new Set(CATALOG.flatMap((g) => g.genres))].sort();
}

export async function catalogSize() {
  return CATALOG.length;
}
