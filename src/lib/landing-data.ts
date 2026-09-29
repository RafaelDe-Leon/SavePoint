import type { Platform } from "@/lib/game";

/**
 * Sample content for the marketing page. There is no catalog yet, so covers
 * are tinted placeholders — swap these for real catalog queries (and `src`
 * box art) once one exists.
 */

export interface SampleGame {
  title: string;
  year: number;
  tint: string;
  platform: Platform;
  platformLabel: string;
}

/** Placeholder cover tint: a dark, moderately saturated oklch at a given hue. */
const tint = (hue: number, l = 0.4, c = 0.11) => `oklch(${l} ${c} ${hue})`;

export const TRENDING: SampleGame[] = [
  { title: "Hollow Knight: Silksong", year: 2025, tint: tint(200, 0.36, 0.09), platform: "nintendo", platformLabel: "Switch 2" },
  { title: "Clair Obscur: Expedition 33", year: 2025, tint: tint(40, 0.38, 0.08), platform: "playstation", platformLabel: "PS5" },
  { title: "Balatro", year: 2024, tint: tint(25, 0.4, 0.13), platform: "pc", platformLabel: "Steam Deck" },
  { title: "Metroid Prime 4", year: 2025, tint: tint(140, 0.38, 0.1), platform: "nintendo", platformLabel: "Switch 2" },
  { title: "Death Stranding 2", year: 2025, tint: tint(230, 0.34, 0.06), platform: "playstation", platformLabel: "PS5" },
  { title: "Hades II", year: 2025, tint: tint(320, 0.36, 0.12), platform: "pc", platformLabel: "PC" },
];

/** Titles for the hero's cover wall. Order is arbitrary; hues are spread. */
export const WALL_TITLES = [
  "Celeste", "Elden Ring", "Outer Wilds", "Hades", "Portal 2", "Undertale",
  "Tunic", "Disco Elysium", "Inside", "Returnal", "Pentiment", "Cocoon",
  "Sifu", "Animal Well", "Chained Echoes", "Dave the Diver", "Sea of Stars",
  "Lies of P", "Dredge", "Stray", "Hi-Fi Rush", "Astro Bot", "Pizza Tower",
  "Katana Zero", "Ori", "Okami", "Bloodborne", "Inscryption", "Signalis",
  "Tetris Effect", "Chants of Sennaar", "Lorelei", "Neva", "Hades II",
  "Crosscode", "Spiritfarer", "Hyper Light Drifter", "Gris", "Firewatch",
  "Rain World", "Nine Sols", "Unpacking",
].map((title, i) => ({ title, tint: tint((i * 47) % 360, 0.34 + (i % 3) * 0.03, 0.1) }));

export interface ListRow {
  title: string;
  tint: string;
  /** Mono meta line: a date, a count, an hour total. */
  meta: string;
}

export const COMING_SOON: ListRow[] = [
  { title: "Marathon", tint: tint(95, 0.42, 0.12), meta: "Oct 14" },
  { title: "Ghost of Yōtei: Legends", tint: tint(15, 0.36, 0.1), meta: "Oct 30" },
  { title: "Fable", tint: tint(150, 0.36, 0.08), meta: "Nov 11" },
  { title: "Hytale", tint: tint(215, 0.4, 0.09), meta: "Jan 2027" },
  { title: "Slay the Spire 2", tint: tint(355, 0.36, 0.11), meta: "Feb 2027" },
];

export const MOST_BACKLOGGED: ListRow[] = [
  { title: "Baldur's Gate 3", tint: tint(280, 0.34, 0.08), meta: "41.2K waiting" },
  { title: "The Witcher 3", tint: tint(60, 0.34, 0.06), meta: "38.9K waiting" },
  { title: "Persona 5 Royal", tint: tint(20, 0.4, 0.15), meta: "33.1K waiting" },
  { title: "Red Dead Redemption 2", tint: tint(35, 0.36, 0.1), meta: "30.7K waiting" },
  { title: "Xenoblade Chronicles 3", tint: tint(190, 0.38, 0.09), meta: "22.4K waiting" },
];

export const MOST_BEATEN: ListRow[] = [
  { title: "Astro Bot", tint: tint(250, 0.4, 0.12), meta: "4.1K this month" },
  { title: "Celeste", tint: tint(265, 0.42, 0.11), meta: "3.6K this month" },
  { title: "Portal 2", tint: tint(220, 0.36, 0.05), meta: "3.2K this month" },
  { title: "Inside", tint: tint(30, 0.3, 0.05), meta: "2.9K this month" },
  { title: "Super Mario Odyssey", tint: tint(25, 0.42, 0.14), meta: "2.5K this month" },
];

