import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { CATALOG, type CatalogGame } from "@/lib/catalog/data";
import type { GameFormat, GameStatus, Platform } from "@/lib/game";

/**
 * A fake signed-in user and their shelf. Entries point at catalog games by
 * slug, so the library and the catalog agree on every title.
 *
 * Stands in for a database until auth and storage exist: the shelf lives in
 * `.data/shelf.json` (gitignored), seeded from `SEED` on first read. Delete
 * that file to reset. Pages only go through the async functions at the
 * bottom, so swapping in a real database stays inside this file.
 */

export const SAMPLE_USER = { name: "Adrian", username: "adrian" };

export interface OwnedSystem {
  id: string;
  platform: Platform;
  label: string;
}

export const SYSTEMS: OwnedSystem[] = [
  { id: "switch", platform: "nintendo", label: "Switch" },
  { id: "ps5", platform: "playstation", label: "PS5" },
  { id: "deck", platform: "pc", label: "Steam Deck" },
  { id: "xsx", platform: "xbox", label: "Series X" },
  { id: "snes", platform: "retro", label: "SNES" },
];

/** One owned copy: the system it's on and how you own it there. */
export interface Copy {
  system: OwnedSystem["id"];
  format: GameFormat;
}

/**
 * A game in your library. Progress is per game — you beat it once — while
 * ownership is per copy, since you can own the same game on several systems.
 */
export interface ShelfEntry {
  slug: string;
  copies: Copy[];
  status: GameStatus;
  rating?: number;
  hours?: number;
  /** ISO date the game was logged — drives "Recently added". */
  added: string;
}

/** Shorthand used by the seed and by stores saved before multi-system copies. */
type SingleCopyEntry = Omit<ShelfEntry, "copies"> & Copy;

function normalize(e: ShelfEntry | SingleCopyEntry): ShelfEntry {
  if ("copies" in e) return e;
  const { system, format, ...rest } = e;
  return { ...rest, copies: [{ system, format }] };
}

const SEED: (ShelfEntry | SingleCopyEntry)[] = [
  { slug: "celeste", system: "switch", format: "digital", status: "beaten", rating: 4.5, hours: 22, added: "2025-02-11" },
  { slug: "outer-wilds", system: "deck", format: "digital", status: "playing", hours: 9, added: "2026-09-02" },
  { slug: "elden-ring", system: "ps5", format: "physical", status: "backlog", added: "2025-12-24" },
  { slug: "hades", copies: [{ system: "switch", format: "digital" }, { system: "deck", format: "digital" }], status: "completed", rating: 5, hours: 64, added: "2024-06-30" },
  { slug: "hollow-knight", copies: [{ system: "switch", format: "physical" }, { system: "deck", format: "digital" }], status: "onhold", hours: 14, added: "2025-04-18" },
  { slug: "final-fantasy-vii-rebirth", system: "ps5", format: "physical", status: "playing", hours: 31, added: "2026-07-15" },
  { slug: "disco-elysium", system: "deck", format: "digital", status: "backlog", added: "2026-01-03" },
  { slug: "starfield", system: "xsx", format: "digital", status: "abandoned", rating: 2.5, hours: 11, added: "2023-09-06" },
  { slug: "super-metroid", system: "snes", format: "physical", status: "beaten", rating: 5, hours: 8, added: "2022-11-20" },
  { slug: "astro-bot", system: "ps5", format: "digital", status: "beaten", rating: 4.5, hours: 15, added: "2024-09-06" },
  { slug: "balatro", system: "deck", format: "digital", status: "beaten", rating: 4, hours: 40, added: "2024-03-01" },
  { slug: "metroid-prime-4", system: "switch", format: "physical", status: "backlog", added: "2026-09-12" },
  { slug: "hollow-knight-silksong", system: "switch", format: "digital", status: "wishlist", added: "2026-08-21" },
  { slug: "chrono-trigger", system: "snes", format: "physical", status: "backlog", added: "2023-01-14" },
  { slug: "forza-horizon-5", system: "xsx", format: "digital", status: "backlog", hours: 3, added: "2023-10-02" },
  { slug: "the-legend-of-zelda-tears-of-the-kingdom", system: "switch", format: "physical", status: "beaten", rating: 5, hours: 118, added: "2023-05-12" },
  { slug: "portal-2", system: "deck", format: "digital", status: "completed", rating: 5, hours: 12, added: "2023-12-01" },
  { slug: "bloodborne", system: "ps5", format: "physical", status: "backlog", added: "2024-11-29" },
  { slug: "stardew-valley", system: "switch", format: "digital", status: "onhold", hours: 46, added: "2022-12-25" },
  { slug: "inside", system: "deck", format: "digital", status: "beaten", rating: 4, hours: 4, added: "2024-01-20" },
  { slug: "baldur-s-gate-3", system: "ps5", format: "digital", status: "backlog", hours: 6, added: "2025-08-03" },
  { slug: "clair-obscur-expedition-33", system: "xsx", format: "digital", status: "wishlist", added: "2026-05-02" },
];

/**
 * One copy on your shelf, joined with its catalog record. A game you own on
 * two systems yields two of these — one for each system's shelf — sharing
 * status, rating and hours. `copies` lists every system you own it on.
 */
export type ShelfGame = CatalogGame &
  Omit<ShelfEntry, "slug"> &
  Copy & { key: string };

const BY_SLUG = new Map(CATALOG.map((g) => [g.slug, g]));

/* ---------------------------------------------------------------------------
 * Storage
 * ------------------------------------------------------------------------- */

const STORE = path.join(process.cwd(), ".data", "shelf.json");

async function readEntries(): Promise<ShelfEntry[]> {
  try {
    return (JSON.parse(await readFile(STORE, "utf8")) as ShelfEntry[]).map(normalize);
  } catch {
    return SEED.map(normalize);
  }
}

async function writeEntries(entries: ShelfEntry[]) {
  await mkdir(path.dirname(STORE), { recursive: true });
  await writeFile(STORE, JSON.stringify(entries, null, 2));
}

async function loadShelf(): Promise<ShelfGame[]> {
  return (await readEntries()).flatMap((e) => {
    const game = BY_SLUG.get(e.slug);
    if (!game) return [];
    return e.copies.map((c) => ({
      ...game,
      ...e,
      ...c,
      key: `${game.id}-${c.system}`,
    }));
  });
}

export const systemOf = (id: OwnedSystem["id"]) =>
  SYSTEMS.find((s) => s.id === id)!;

/** "Beaten" for counting purposes includes 100% completions. */
export const isBeaten = (g: Pick<ShelfGame, "status">) =>
  g.status === "beaten" || g.status === "completed";

/** Wishlist games aren't owned, so they never count toward the shelf. */
export const isOwned = (g: Pick<ShelfGame, "status">) => g.status !== "wishlist";

/* ---------------------------------------------------------------------------
 * Read API
 * ------------------------------------------------------------------------- */

const hasStatus = (status: GameStatus) => (g: ShelfGame) => g.status === status;

/** Library tabs, in their default order. The user can reorder them. */
export const SHELF_TABS = {
  owned: { label: "Owned", match: isOwned },
  unbeaten: { label: "Not beaten", match: (g: ShelfGame) => isOwned(g) && !isBeaten(g) },
  backlog: { label: "Backlog", match: hasStatus("backlog") },
  playing: { label: "Playing", match: hasStatus("playing") },
  beaten: { label: "Beaten", match: isBeaten },
  onhold: { label: "On hold", match: hasStatus("onhold") },
  abandoned: { label: "Dropped", match: hasStatus("abandoned") },
  wishlist: { label: "Wishlist", match: hasStatus("wishlist") },
} as const;
export type ShelfTab = keyof typeof SHELF_TABS;

export const SHELF_SORTS = {
  added: "Recently added",
  title: "Title",
  year: "Release year",
  rating: "Your rating",
  hours: "Hours played",
} as const;
export type ShelfSort = keyof typeof SHELF_SORTS;

const SHELF_SORTERS: Record<ShelfSort, (a: ShelfGame, b: ShelfGame) => number> = {
  added: (a, b) => b.added.localeCompare(a.added),
  title: (a, b) => a.title.localeCompare(b.title),
  year: (a, b) => b.year - a.year,
  rating: (a, b) => (b.rating ?? -1) - (a.rating ?? -1),
  hours: (a, b) => (b.hours ?? 0) - (a.hours ?? 0),
};

export interface ShelfQuery {
  tab?: ShelfTab;
  systems?: string[];
  q?: string;
  sort?: ShelfSort;
}

/** Your library as stored — one record per game — for "Download your data". */
export async function getShelfEntries() {
  return readEntries();
}

/** Every copy on your shelf — a game owned on two systems appears twice. */
export async function getShelf() {
  return loadShelf();
}

/** Collapses copies to one row per game, for counts and per-game lists. */
export function uniqueGames(rows: ShelfGame[]) {
  const seen = new Set<number>();
  return rows.filter((g) => !seen.has(g.id) && seen.add(g.id));
}

export async function queryShelf({
  tab = "owned",
  systems = [],
  q = "",
  sort = "added",
}: ShelfQuery = {}) {
  const shelf = await loadShelf();
  const needle = q.trim().toLowerCase();
  const inTab = shelf.filter(SHELF_TABS[tab].match);
  const games = inTab
    .filter((g) => !systems.length || systems.includes(g.system))
    .filter((g) => !needle || g.title.toLowerCase().includes(needle))
    .sort(SHELF_SORTERS[sort]);

  return {
    games,
    /** Games per tab, ignoring the other filters — for the tab counts. */
    tabCounts: Object.fromEntries(
      Object.entries(SHELF_TABS).map(([k, t]) => [
        k,
        uniqueGames(shelf.filter(t.match)).length,
      ]),
    ) as Record<ShelfTab, number>,
    /** Copies per system within the current tab — for the chip counts. */
    systemCounts: Object.fromEntries(
      SYSTEMS.map((s) => [s.id, inTab.filter((g) => g.system === s.id).length]),
    ) as Record<string, number>,
  };
}

/** Your library entry for a catalog game — every copy — or null. */
export async function getShelfEntry(gameId: number) {
  const game = CATALOG.find((g) => g.id === gameId);
  if (!game) return null;
  return (await readEntries()).find((e) => e.slug === game.slug) ?? null;
}

/** Lookup of catalog id → your status, for badging catalog results. */
export async function getShelfStatuses() {
  return new Map((await loadShelf()).map((g) => [g.id, g.status]));
}

/** Your systems a game can be played on, matched by platform family. */
export function compatibleSystems(game: Pick<CatalogGame, "platforms">) {
  return SYSTEMS.filter((s) => game.platforms.includes(s.platform));
}

/* ---------------------------------------------------------------------------
 * Write API
 * ------------------------------------------------------------------------- */

/**
 * Adds a game to your library, or updates it if it's already there. `copies`
 * replaces the full set, so unticking a system removes that copy. `added` is
 * kept on update so the game doesn't jump to the top of "Recently added".
 */
export async function upsertShelfEntry(
  entry: Omit<ShelfEntry, "added">,
): Promise<"added" | "updated"> {
  const entries = await readEntries();
  const i = entries.findIndex((e) => e.slug === entry.slug);
  if (i >= 0) {
    entries[i] = { ...entries[i], ...entry };
  } else {
    entries.push({ ...entry, added: new Date().toISOString().slice(0, 10) });
  }
  await writeEntries(entries);
  return i >= 0 ? "updated" : "added";
}

/** Sets your rating for a game in your library; undefined clears it. */
export async function setShelfRating(slug: string, rating: number | undefined) {
  const entries = await readEntries();
  const e = entries.find((x) => x.slug === slug);
  if (!e) return false;
  e.rating = rating;
  await writeEntries(entries);
  return true;
}

/**
 * Adds (or, with a negative delta, takes back) hours on a game in your
 * library. Journal sessions feed the total this way. Never drops below 0.
 */
export async function addShelfHours(slug: string, delta: number) {
  const entries = await readEntries();
  const e = entries.find((x) => x.slug === slug);
  if (!e) return false;
  const next = Math.max(0, Math.round(((e.hours ?? 0) + delta) * 10) / 10);
  e.hours = next || undefined;
  await writeEntries(entries);
  return true;
}

export async function removeShelfEntry(slug: string) {
  await writeEntries((await readEntries()).filter((e) => e.slug !== slug));
}
