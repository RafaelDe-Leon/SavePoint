import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { DEFAULT_SETTINGS, PEOPLE, today, type Settings } from "@/lib/profile-shared";
import { SAMPLE_USER } from "@/lib/sample-library";

/**
 * Your profile and everything hung off it: journal, reviews, lists, follows
 * and likes. Like the shelf, it lives in a gitignored JSON file
 * (`.data/profile.json`) seeded on first read. Delete the file to reset.
 * Pages go through the async functions below, so a real database only has
 * to replace this file.
 */

export interface Profile {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl?: string;
  email: string;
  /** Slugs of up to four favorite games, in display order. */
  favorites: string[];
  joined: string;
}

/** A play session. Its hours are added to the game's total on your shelf. */
export interface JournalEntry {
  id: string;
  slug: string;
  date: string;
  hours: number;
  note: string;
}

/** One review per game. The star rating lives on the shelf entry. */
export interface Review {
  slug: string;
  body: string;
  created: string;
  updated?: string;
}

export interface GameList {
  id: string;
  title: string;
  description: string;
  slugs: string[];
  created: string;
  updated: string;
}

export interface Follow {
  username: string;
  since: string;
}

export interface Like {
  slug: string;
  since: string;
}

interface Store {
  profile: Profile;
  journal: JournalEntry[];
  reviews: Review[];
  lists: GameList[];
  following: Follow[];
  likes: Like[];
  settings: Settings;
}

const SEED: Store = {
  profile: {
    displayName: SAMPLE_USER.name,
    username: SAMPLE_USER.username,
    bio: "",
    email: "adrian@example.com",
    favorites: ["hades", "super-metroid", "the-legend-of-zelda-tears-of-the-kingdom", "celeste"],
    joined: "2022-11-20",
  },
  journal: [
    { id: "seed-1", slug: "outer-wilds", date: "2026-09-27", hours: 2.5, note: "Finally made it inside the Ash Twin. Took notes this time." },
    { id: "seed-2", slug: "final-fantasy-vii-rebirth", date: "2026-09-24", hours: 4, note: "" },
    { id: "seed-3", slug: "outer-wilds", date: "2026-09-19", hours: 3, note: "The quantum moon is messing with me." },
    { id: "seed-4", slug: "final-fantasy-vii-rebirth", date: "2026-09-12", hours: 3.5, note: "Queen's Blood is the real game." },
  ],
  reviews: [
    { slug: "hades", created: "2024-08-02", body: "Every run tells you a little more, so dying never feels like losing. The best loop in the genre, and the writing holds up after sixty hours." },
    { slug: "starfield", created: "2023-10-14", body: "Loading screens with a game attached. Dropped it after the third identical outpost." },
  ],
  lists: [
    {
      id: "seed-metroidvanias",
      title: "Metroidvanias worth your time",
      description: "Start at the top. Each one assumes you've played the last.",
      slugs: ["super-metroid", "hollow-knight", "metroid-prime-4", "hollow-knight-silksong"],
      created: "2025-05-01",
      updated: "2025-09-10",
    },
  ],
  following: [
    { username: "mika_plays", since: "2025-03-14" },
    { username: "jun", since: "2026-06-02" },
  ],
  likes: [
    { slug: "hades", since: "2024-08-02" },
    { slug: "outer-wilds", since: "2026-09-19" },
    { slug: "chrono-trigger", since: "2023-01-14" },
  ],
  settings: DEFAULT_SETTINGS,
};

const DIR = path.join(process.cwd(), ".data");
const STORE = path.join(DIR, "profile.json");
const AVATARS = path.join(DIR, "avatars");

async function read(): Promise<Store> {
  try {
    // Spread over the seed so a store saved before a field existed still loads.
    const saved = JSON.parse(await readFile(STORE, "utf8"));
    const seed = structuredClone(SEED);
    return {
      ...seed,
      ...saved,
      settings: {
        ...seed.settings,
        ...saved.settings,
        notifications: { ...seed.settings.notifications, ...saved.settings?.notifications },
        privacy: { ...seed.settings.privacy, ...saved.settings?.privacy },
      },
    };
  } catch {
    return structuredClone(SEED);
  }
}

async function write(store: Store) {
  await mkdir(path.dirname(STORE), { recursive: true });
  await writeFile(STORE, JSON.stringify(store, null, 2));
}

/** Read-modify-write in one place, so every mutation looks the same. */
async function update<T>(fn: (store: Store) => T): Promise<T> {
  const store = await read();
  const result = fn(store);
  await write(store);
  return result;
}

const byDateDesc = <T extends { date: string }>(a: T, b: T) => b.date.localeCompare(a.date);

/* ---------------------------------------------------------------------------
 * Profile
 * ------------------------------------------------------------------------- */

export async function getProfile() {
  return (await read()).profile;
}

export async function updateProfile(patch: Partial<Profile>) {
  return update((s) => (s.profile = { ...s.profile, ...patch }));
}

/* ---------------------------------------------------------------------------
 * Avatar
 *
 * Uploaded files live in `.data/avatars/<uuid>.<ext>` and are served by
 * `/api/avatar/[file]`. The name changes on every upload, so the route can
 * cache forever.
 * ------------------------------------------------------------------------- */

export const AVATAR_FILE = /^[0-9a-f-]{36}\.(jpg|png|webp)$/;
const AVATAR_ROUTE = "/api/avatar/";

/** Stores a new avatar, points your profile at it and drops the old file. */
export async function setAvatarFile(bytes: Uint8Array, ext: string) {
  await mkdir(AVATARS, { recursive: true });
  const file = `${randomUUID()}.${ext}`;
  await writeFile(path.join(AVATARS, file), bytes);
  const before = (await read()).profile.avatarUrl;
  await updateProfile({ avatarUrl: AVATAR_ROUTE + file });
  await removeAvatarFile(before);
}

export async function clearAvatar() {
  const before = (await read()).profile.avatarUrl;
  await updateProfile({ avatarUrl: undefined });
  await removeAvatarFile(before);
}

async function removeAvatarFile(url?: string) {
  const file = url?.startsWith(AVATAR_ROUTE) ? url.slice(AVATAR_ROUTE.length) : null;
  if (file && AVATAR_FILE.test(file)) await rm(path.join(AVATARS, file), { force: true });
}

/** The bytes of an uploaded avatar, or null. `file` must match AVATAR_FILE. */
export async function readAvatarFile(file: string) {
  if (!AVATAR_FILE.test(file)) return null;
  try {
    return await readFile(path.join(AVATARS, file));
  } catch {
    return null;
  }
}

/* ---------------------------------------------------------------------------
 * Settings
 * ------------------------------------------------------------------------- */

export async function getSettings() {
  return (await read()).settings;
}

export async function updateSettings(fn: (s: Settings) => void) {
  return update((s) => fn(s.settings));
}

/** Everything in the profile store, for "Download your data". */
export async function exportProfileStore() {
  return read();
}

/* ---------------------------------------------------------------------------
 * Journal
 * ------------------------------------------------------------------------- */

/** Newest session first. */
export async function getJournal() {
  return (await read()).journal.sort(byDateDesc);
}

export async function addJournalEntry(entry: Omit<JournalEntry, "id">) {
  return update((s) => {
    const e = { ...entry, id: randomUUID() };
    s.journal.push(e);
    return e;
  });
}

/** Removes a session and returns it, so the caller can take its hours back. */
export async function removeJournalEntry(id: string) {
  return update((s) => {
    const e = s.journal.find((x) => x.id === id) ?? null;
    s.journal = s.journal.filter((x) => x.id !== id);
    return e;
  });
}

/* ---------------------------------------------------------------------------
 * Reviews
 * ------------------------------------------------------------------------- */

/** Most recently written or edited first. */
export async function getReviews() {
  return (await read()).reviews.sort((a, b) =>
    (b.updated ?? b.created).localeCompare(a.updated ?? a.created),
  );
}

export async function getReview(slug: string) {
  return (await read()).reviews.find((r) => r.slug === slug) ?? null;
}

export async function saveReview(slug: string, body: string): Promise<"added" | "updated"> {
  return update((s) => {
    const r = s.reviews.find((x) => x.slug === slug);
    if (r) {
      r.body = body;
      r.updated = today();
      return "updated";
    }
    s.reviews.push({ slug, body, created: today() });
    return "added";
  });
}

export async function removeReview(slug: string) {
  return update((s) => {
    s.reviews = s.reviews.filter((x) => x.slug !== slug);
  });
}

/* ---------------------------------------------------------------------------
 * Lists
 * ------------------------------------------------------------------------- */

/** Most recently updated first. */
export async function getLists() {
  return (await read()).lists.sort((a, b) => b.updated.localeCompare(a.updated));
}

export async function getList(id: string) {
  return (await read()).lists.find((l) => l.id === id) ?? null;
}

export async function createList(title: string, description: string) {
  return update((s) => {
    const l: GameList = { id: randomUUID(), title, description, slugs: [], created: today(), updated: today() };
    s.lists.push(l);
    return l;
  });
}

/** Applies a change to one list and bumps its `updated`. Null if it's gone. */
export async function editList(id: string, fn: (list: GameList) => void) {
  return update((s) => {
    const l = s.lists.find((x) => x.id === id);
    if (!l) return null;
    fn(l);
    l.updated = today();
    return l;
  });
}

export async function deleteList(id: string) {
  return update((s) => {
    s.lists = s.lists.filter((x) => x.id !== id);
  });
}

/* ---------------------------------------------------------------------------
 * Follows
 * ------------------------------------------------------------------------- */

export async function getFollowing() {
  return (await read()).following;
}

export async function setFollowing(username: string, follow: boolean) {
  return update((s) => {
    s.following = s.following.filter((f) => f.username !== username);
    if (follow) s.following.push({ username, since: today() });
  });
}

export const personOf = (username: string) => PEOPLE.find((p) => p.username === username);

/* ---------------------------------------------------------------------------
 * Likes
 * ------------------------------------------------------------------------- */

/** Most recently liked first. */
export async function getLikes() {
  return (await read()).likes.sort((a, b) => b.since.localeCompare(a.since));
}

export async function setLiked(slug: string, liked: boolean) {
  return update((s) => {
    s.likes = s.likes.filter((l) => l.slug !== slug);
    if (liked) s.likes.push({ slug, since: today() });
  });
}
