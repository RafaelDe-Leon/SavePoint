"use server";

import { rm } from "node:fs/promises";
import path from "node:path";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getGameBySlug } from "@/lib/catalog/queries";
import type { SaveResult } from "@/lib/library-actions";
import * as store from "@/lib/profile";
import {
  AVATAR,
  EMAIL,
  LIMITS,
  NOTIFICATIONS,
  PRIVACY_TOGGLES,
  today,
  USERNAME,
  VISIBILITY,
  type NotificationKey,
  type PrivacyToggle,
  type Visibility,
} from "@/lib/profile-shared";
import { addShelfHours, getShelfEntry, setShelfRating } from "@/lib/sample-library";

/**
 * Every mutation behind the profile and settings pages. Each one validates on
 * the server — form constraints are a convenience, not a guarantee — and
 * returns a past-tense confirmation for the toast.
 */

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();

// Every signed-in page can show profile data: the nav, counts, activity.
const refresh = () => revalidatePath("/", "layout");

const fail = (error: string): SaveResult => ({ ok: false, error });

/** Validates a slug against the catalog and your library in one step. */
async function ownedGame(slug: string) {
  const game = await getGameBySlug(slug);
  if (!game) return { error: "That game isn't in the catalog." } as const;
  const entry = await getShelfEntry(game.id);
  if (!entry) return { error: `Add ${game.title} to your library first.` } as const;
  return { game, entry } as const;
}

/* ---------------------------------------------------------------------------
 * Settings
 * ------------------------------------------------------------------------- */

export type ProfileField = "displayName" | "username" | "bio";

export type ProfileFormState =
  | { ok: true; message: string }
  | { ok: false; errors: Partial<Record<ProfileField, string>> }
  | undefined;

export async function saveProfile(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const displayName = text(formData, "displayName");
  const username = text(formData, "username").toLowerCase();
  const bio = text(formData, "bio");

  const errors: Partial<Record<ProfileField, string>> = {};
  if (!displayName) errors.displayName = "Enter a display name.";
  else if (displayName.length > LIMITS.displayName)
    errors.displayName = `Keep it under ${LIMITS.displayName} characters.`;
  if (!USERNAME.test(username)) errors.username = "3–20 letters, numbers or underscores.";
  if (bio.length > LIMITS.bio) errors.bio = `Keep it under ${LIMITS.bio} characters.`;

  if (Object.keys(errors).length) return { ok: false, errors };

  const before = await store.getProfile();
  await store.updateProfile({ displayName, username, bio });
  refresh();
  if (before.username !== username) {
    // Your old profile URL no longer resolves.
    return { ok: true, message: `Changed your username to ${username}` };
  }
  return { ok: true, message: "Saved your profile" };
}

export async function saveFavorites(_prev: SaveResult, formData: FormData): Promise<SaveResult> {
  const favorites = [...new Set(formData.getAll("favorite").map(String))];
  if (favorites.length > LIMITS.favorites) return fail(`Pick up to ${LIMITS.favorites} favorites.`);
  if (!(await Promise.all(favorites.map(getGameBySlug))).every(Boolean))
    return fail("One of those games isn't in the catalog.");
  await store.updateProfile({ favorites });
  refresh();
  return { ok: true, message: favorites.length ? "Saved your favorites" : "Cleared your favorites" };
}

/**
 * Takes an image the browser has already cropped and scaled, and checks it
 * again here: type, size, and that the bytes really are that type.
 */
export async function uploadAvatar(formData: FormData): Promise<SaveResult> {
  const file = formData.get("avatar");
  if (!(file instanceof File) || !file.size) return fail("Pick an image.");
  const ext = AVATAR.types[file.type];
  if (!ext) return fail("Use a JPG, PNG or WebP image.");
  if (file.size > AVATAR.maxBytes) return fail("That image is too large. Try a smaller one.");

  const bytes = new Uint8Array(await file.arrayBuffer());
  const magic: Record<string, (b: Uint8Array) => boolean> = {
    jpg: (b) => b[0] === 0xff && b[1] === 0xd8,
    png: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
    webp: (b) => String.fromCharCode(...b.slice(8, 12)) === "WEBP",
  };
  if (!magic[ext](bytes)) return fail("That file isn't a valid image.");

  await store.setAvatarFile(bytes, ext);
  refresh();
  return { ok: true, message: "Updated your picture" };
}

export async function removeAvatar(): Promise<SaveResult> {
  await store.clearAvatar();
  refresh();
  return { ok: true, message: "Removed your picture" };
}

export async function saveEmail(_prev: SaveResult, formData: FormData): Promise<SaveResult> {
  const email = text(formData, "email");
  if (!EMAIL.test(email)) return fail("That doesn't look like an email.");
  await store.updateProfile({ email });
  refresh();
  return { ok: true, message: `Changed your email to ${email}` };
}

export async function changePassword(_prev: SaveResult, formData: FormData): Promise<SaveResult> {
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (!current) return fail("Enter your current password.");
  if (next.length < 8) return fail("Use at least 8 characters for the new one.");
  if (next === current) return fail("That's the password you already have.");
  if (next !== confirm) return fail("The new passwords don't match.");
  // TODO: verify `current` and store `next` with the auth provider. There is
  // no credential store yet, so this only validates.
  return { ok: true, message: "Changed your password" };
}

/** Switches one email notification on or off. */
export async function setNotification(key: NotificationKey, on: boolean): Promise<SaveResult> {
  if (!(key in NOTIFICATIONS)) return fail("That isn't a notification.");
  await store.updateSettings((s) => void (s.notifications[key] = on));
  refresh();
  const label = NOTIFICATIONS[key].label.toLowerCase();
  return { ok: true, message: on ? `Turned on ${label}` : `Turned off ${label}` };
}

export async function setVisibility(v: Visibility): Promise<SaveResult> {
  if (!(v in VISIBILITY)) return fail("Pick who can see your profile.");
  await store.updateSettings((s) => void (s.visibility = v));
  refresh();
  return { ok: true, message: `Set your profile to ${VISIBILITY[v].label.toLowerCase()}` };
}

export async function setPrivacy(key: PrivacyToggle, on: boolean): Promise<SaveResult> {
  if (!(key in PRIVACY_TOGGLES)) return fail("That isn't a privacy setting.");
  await store.updateSettings((s) => void (s.privacy[key] = on));
  refresh();
  const label = PRIVACY_TOGGLES[key].label.replace(/^Show /, "").toLowerCase();
  return { ok: true, message: on ? `Showing your ${label}` : `Hiding your ${label}` };
}

/**
 * Wipes every fake store — shelf, preferences, profile — back to its seed.
 * They all live under `.data/`, so this removes the directory.
 */
export async function resetAllData() {
  await rm(path.join(process.cwd(), ".data"), { recursive: true, force: true });
  refresh();
  redirect("/home");
}

/* ---------------------------------------------------------------------------
 * Journal
 * ------------------------------------------------------------------------- */

export async function logSession(_prev: SaveResult, formData: FormData): Promise<SaveResult> {
  const slug = text(formData, "slug");
  const date = text(formData, "date");
  const hours = Number(formData.get("hours"));
  const note = text(formData, "note");

  const owned = await ownedGame(slug);
  if ("error" in owned) return fail(owned.error ?? "Pick a game.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)))
    return fail("Pick a date.");
  if (date > today()) return fail("You can't log a session in the future.");
  if (!Number.isFinite(hours) || hours <= 0 || hours > 24)
    return fail("Hours go from 0.1 to 24.");
  if (note.length > LIMITS.journalNote)
    return fail(`Keep the note under ${LIMITS.journalNote} characters.`);

  const rounded = Math.round(hours * 10) / 10;
  await store.addJournalEntry({ slug, date, hours: rounded, note });
  await addShelfHours(slug, rounded);
  refresh();
  return { ok: true, message: `Logged ${rounded}h of ${owned.game.title}` };
}

export async function deleteSession(id: string): Promise<SaveResult> {
  const e = await store.removeJournalEntry(id);
  if (!e) return fail("That session is already gone.");
  await addShelfHours(e.slug, -e.hours);
  const game = await getGameBySlug(e.slug);
  refresh();
  return { ok: true, message: `Deleted a ${e.hours}h session${game ? ` of ${game.title}` : ""}` };
}

/* ---------------------------------------------------------------------------
 * Reviews
 * ------------------------------------------------------------------------- */

/** Half-star steps from 0.5 to 5; 0 means "no rating". */
const parseRating = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n <= 5 && Number.isInteger(n * 2) ? n : null;
};

export async function saveReviewAction(_prev: SaveResult, formData: FormData): Promise<SaveResult> {
  const slug = text(formData, "slug");
  const body = text(formData, "body");
  const rating = parseRating(formData.get("rating"));

  const owned = await ownedGame(slug);
  if ("error" in owned) return fail(owned.error ?? "Pick a game.");
  if (!body) return fail("Write something first.");
  if (body.length > LIMITS.review) return fail(`Keep it under ${LIMITS.review} characters.`);
  if (rating === null) return fail("Ratings go from half a star to five.");

  const result = await store.saveReview(slug, body);
  await setShelfRating(slug, rating || undefined);
  refresh();
  return {
    ok: true,
    message: result === "added" ? `Reviewed ${owned.game.title}` : `Updated your review of ${owned.game.title}`,
  };
}

export async function deleteReview(slug: string): Promise<SaveResult> {
  const game = await getGameBySlug(slug);
  await store.removeReview(slug);
  refresh();
  return { ok: true, message: `Deleted your review${game ? ` of ${game.title}` : ""}` };
}

/* ---------------------------------------------------------------------------
 * Lists
 * ------------------------------------------------------------------------- */

function listFields(formData: FormData) {
  const title = text(formData, "title");
  const description = text(formData, "description");
  if (!title) return { error: "Give the list a title." } as const;
  if (title.length > LIMITS.listTitle) return { error: `Keep the title under ${LIMITS.listTitle} characters.` } as const;
  if (description.length > LIMITS.listDescription)
    return { error: `Keep the description under ${LIMITS.listDescription} characters.` } as const;
  return { title, description } as const;
}

export type ListResult = (SaveResult & { id?: string }) | undefined;

export async function createListAction(_prev: ListResult, formData: FormData): Promise<ListResult> {
  const f = listFields(formData);
  if ("error" in f) return { ok: false, error: f.error ?? "" };
  const list = await store.createList(f.title, f.description);
  refresh();
  return { ok: true, message: `Created ${list.title}`, id: list.id };
}

export async function editListAction(_prev: SaveResult, formData: FormData): Promise<SaveResult> {
  const id = text(formData, "id");
  const f = listFields(formData);
  if ("error" in f) return fail(f.error ?? "");
  const list = await store.editList(id, (l) => {
    l.title = f.title;
    l.description = f.description;
  });
  if (!list) return fail("That list no longer exists.");
  refresh();
  return { ok: true, message: `Saved ${list.title}` };
}

export async function deleteListAction(id: string) {
  await store.deleteList(id);
  refresh();
  redirect(`/u/${(await store.getProfile()).username}/lists`);
}

export async function addToList(id: string, slug: string): Promise<SaveResult> {
  const game = await getGameBySlug(slug);
  if (!game) return fail("That game isn't in the catalog.");
  let already = false;
  const list = await store.editList(id, (l) => {
    already = l.slugs.includes(slug);
    if (!already) l.slugs.push(slug);
  });
  if (!list) return fail("That list no longer exists.");
  if (already) return fail(`${game.title} is already on ${list.title}.`);
  refresh();
  return { ok: true, message: `Added ${game.title} to ${list.title}` };
}

export async function removeFromList(id: string, slug: string): Promise<SaveResult> {
  const game = await getGameBySlug(slug);
  const list = await store.editList(id, (l) => {
    l.slugs = l.slugs.filter((s) => s !== slug);
  });
  if (!list) return fail("That list no longer exists.");
  refresh();
  return { ok: true, message: `Removed ${game?.title ?? "the game"} from ${list.title}` };
}

/** Moves a game one place up (-1) or down (+1). */
export async function moveInList(id: string, slug: string, by: -1 | 1): Promise<SaveResult> {
  const list = await store.editList(id, (l) => {
    const i = l.slugs.indexOf(slug);
    const j = i + by;
    if (i < 0 || j < 0 || j >= l.slugs.length) return;
    [l.slugs[i], l.slugs[j]] = [l.slugs[j], l.slugs[i]];
  });
  if (!list) return fail("That list no longer exists.");
  refresh();
  return undefined;
}

/* ---------------------------------------------------------------------------
 * Follows and likes
 * ------------------------------------------------------------------------- */

export async function toggleFollow(username: string, follow: boolean): Promise<SaveResult> {
  const person = store.personOf(username);
  if (!person) return fail("That player doesn't exist.");
  await store.setFollowing(username, follow);
  refresh();
  return { ok: true, message: follow ? `Followed ${person.name}` : `Unfollowed ${person.name}` };
}

export async function toggleLike(slug: string, liked: boolean): Promise<SaveResult> {
  const game = await getGameBySlug(slug);
  if (!game) return fail("That game isn't in the catalog.");
  await store.setLiked(slug, liked);
  refresh();
  return { ok: true, message: liked ? `Liked ${game.title}` : `Unliked ${game.title}` };
}
