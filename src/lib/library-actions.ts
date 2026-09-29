"use server";

import { revalidatePath } from "next/cache";

import { getGameBySlug } from "@/lib/catalog/queries";
import { setLibraryTabOrder } from "@/lib/preferences";
import { STATUS_META, type GameFormat, type GameStatus } from "@/lib/game";
import {
  getShelfEntry,
  removeShelfEntry,
  setShelfRating,
  SYSTEMS,
  upsertShelfEntry,
} from "@/lib/sample-library";

const listFormat = new Intl.ListFormat("en", { type: "conjunction" });

/** Half-star steps from 0.5 to 5; 0 means "no rating". */
const parseRating = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n <= 5 && Number.isInteger(n * 2) ? n : null;
};

const starLabel = (n: number) => `${n} ${n === 1 ? "star" : "stars"}`;

export type SaveResult =
  | { ok: true; message: string }
  | { ok: false; error: string }
  | undefined;

/**
 * Adds a game to your library, or updates your copy. Validates every field
 * against the known vocabularies — the form's radios are a convenience, not
 * a guarantee.
 */
export async function saveToLibrary(
  _prev: SaveResult,
  formData: FormData,
): Promise<SaveResult> {
  const slug = String(formData.get("slug") ?? "");
  const status = String(formData.get("status") ?? "") as GameStatus;
  // One `system` value per ticked checkbox, each with its own `format-<id>`.
  const systems = [...new Set(formData.getAll("system").map(String))];

  const game = await getGameBySlug(slug);
  if (!game) return { ok: false, error: "That game isn't in the catalog." };
  if (!systems.length)
    return { ok: false, error: "Pick at least one system you own it on." };
  if (!systems.every((id) => SYSTEMS.some((s) => s.id === id)))
    return { ok: false, error: "One of those systems isn't yours." };
  if (!(status in STATUS_META)) return { ok: false, error: "Pick a status." };

  const copies = systems.map((system) => ({
    system,
    format: String(formData.get(`format-${system}`) ?? "") as GameFormat,
  }));
  if (!copies.every((c) => c.format === "physical" || c.format === "digital"))
    return { ok: false, error: "Pick physical or digital for each system." };

  // The form always sends a rating (0 = none); hours aren't edited here yet.
  const rawRating = formData.get("rating");
  const rating = rawRating === null ? undefined : parseRating(rawRating);
  if (rating === null) return { ok: false, error: "Ratings go from half a star to five." };

  const existing = await getShelfEntry(game.id);
  const result = await upsertShelfEntry({
    slug,
    copies,
    status,
    rating: rating === undefined ? existing?.rating : rating || undefined,
    hours: existing?.hours,
  });

  // Every signed-in page reads the shelf: counts, badges, shelves.
  revalidatePath("/", "layout");

  const on = listFormat.format(
    systems.map((id) => SYSTEMS.find((s) => s.id === id)!.label),
  );
  let message: string;
  if (result === "added") {
    message =
      status === "wishlist"
        ? `Added ${game.title} to your wishlist`
        : `Added ${game.title} to your shelf on ${on}`;
  } else if (existing?.status !== status) {
    message = `Marked ${game.title} as ${STATUS_META[status].label.toLowerCase()}`;
  } else if (rating !== undefined && (rating || undefined) !== existing?.rating) {
    message = rating
      ? `Rated ${game.title} ${starLabel(rating)}`
      : `Cleared your rating for ${game.title}`;
  } else {
    message = `Updated ${game.title} on ${on}`;
  }
  return { ok: true, message };
}

export async function removeFromLibrary(slug: string): Promise<SaveResult> {
  const game = await getGameBySlug(slug);
  if (!game) return { ok: false, error: "That game isn't in the catalog." };
  await removeShelfEntry(slug);
  revalidatePath("/", "layout");
  return { ok: true, message: `Removed ${game.title} from your library` };
}

/**
 * First-time rating from the game page's stars. Rating is a one-shot there:
 * once a game has a rating, changing or clearing it goes through the edit
 * dialog (`saveToLibrary`), so this refuses to overwrite.
 */
export async function rateGame(slug: string, value: number): Promise<SaveResult> {
  const game = await getGameBySlug(slug);
  if (!game) return { ok: false, error: "That game isn't in the catalog." };
  const rating = parseRating(value);
  if (!rating) return { ok: false, error: "Ratings go from half a star to five." };

  const entry = await getShelfEntry(game.id);
  if (!entry) return { ok: false, error: `Add ${game.title} to your library to rate it.` };
  if (entry.rating)
    return { ok: false, error: `You've already rated ${game.title}. Change it in Edit.` };

  await setShelfRating(slug, rating);
  revalidatePath("/", "layout");
  return { ok: true, message: `Rated ${game.title} ${starLabel(rating)}` };
}

/** Saves your library tab order; `null` restores the default. */
export async function saveLibraryTabOrder(order: string[] | null): Promise<SaveResult> {
  await setLibraryTabOrder(order);
  revalidatePath("/library");
  return {
    ok: true,
    message: order ? "Saved your status order" : "Reset your status order",
  };
}
