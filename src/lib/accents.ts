/**
 * Accent themes.
 *
 * Savepoint uses exactly one accent, and it carries a lot: the primary button,
 * the active nav underline, focus rings, text selection, and the "Beaten"
 * status. Swapping it repoints all of them at once.
 *
 * ── Adding a color ────────────────────────────────────────────────────────
 * Add one line to ACCENTS:
 *
 *     teal: accent("Teal", "#2dd4bf", "dark"),
 *
 * The hover/press/deep steps are derived, and `on` says whether text sitting
 * *on top of* the accent should be dark ink or light ink. No CSS changes, no
 * new utility classes — every component already reads `--accent`.
 *
 * Use an explicit ramp (see `volt`) only when the derived steps aren't right.
 */

/** Which ink reads legibly on top of the accent. */
type OnAccent = "dark" | "light";

export interface AccentRamp {
  /** Hover step — lighter. */
  300: string;
  /** The accent itself. */
  400: string;
  /** Press step — darker. */
  500: string;
  /** Deep step, for rare high-contrast needs. */
  600: string;
  /** Text color on top of the accent. */
  contrast: string;
}

export interface AccentTheme {
  label: string;
  ramp: AccentRamp;
}

const INK_DARK = "#0d0e10";
const INK_LIGHT = "#eef0f3";

/**
 * Derives the ramp from a single base color. Mixing happens in oklch so
 * lightness steps stay perceptually even across hues.
 */
function accent(label: string, base: string, on: OnAccent): AccentTheme {
  return {
    label,
    ramp: {
      300: `color-mix(in oklch, ${base} 80%, white)`,
      400: base,
      500: `color-mix(in oklch, ${base} 88%, black)`,
      600: `color-mix(in oklch, ${base} 68%, black)`,
      contrast: on === "dark" ? INK_DARK : INK_LIGHT,
    },
  };
}

export const ACCENTS = {
  /** The brand default. Hand-tuned in the design system, so no derivation. */
  volt: {
    label: "Volt",
    ramp: {
      300: "#e4ff7a",
      400: "#d4ff3a",
      500: "#bce81e",
      600: "#93b80a",
      contrast: INK_DARK,
    },
  },
  sky: accent("Sky", "#5aaeff", "dark"),
  mint: accent("Mint", "#4fe0b0", "dark"),
  gold: accent("Gold", "#ffc94a", "dark"),
  ember: accent("Ember", "#ff9a4a", "dark"),
  rose: accent("Rose", "#ff5f6d", "dark"),
  iris: accent("Iris", "#b597ff", "dark"),
} satisfies Record<string, AccentTheme>;

export type AccentId = keyof typeof ACCENTS;

export const DEFAULT_ACCENT: AccentId = "volt";

export const ACCENT_IDS = Object.keys(ACCENTS) as AccentId[];

/** Where the preference is persisted. Read by the no-flash script too. */
export const ACCENT_STORAGE_KEY = "sp-accent";

export function isAccentId(v: unknown): v is AccentId {
  return typeof v === "string" && v in ACCENTS;
}

/**
 * The custom properties one accent sets on <html>. These are the only five
 * properties a theme touches — globals.css derives --accent, --accent-hover,
 * --accent-press, --on-accent, --accent-ring, --accent-soft and
 * --status-beaten from them.
 */
export function accentVars(id: AccentId): Record<string, string> {
  const { ramp } = ACCENTS[id];
  return {
    "--accent-300": ramp[300],
    "--accent-400": ramp[400],
    "--accent-500": ramp[500],
    "--accent-600": ramp[600],
    "--accent-contrast": ramp.contrast,
  };
}

/** Serialized into the blocking script in layout.tsx to prevent a flash. */
export const ACCENT_VARS: Record<AccentId, Record<string, string>> =
  Object.fromEntries(ACCENT_IDS.map((id) => [id, accentVars(id)])) as Record<
    AccentId,
    Record<string, string>
  >;
