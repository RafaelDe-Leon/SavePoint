import type { IconName } from "@/components/ui/icon";

/**
 * Status is a first-class attribute in Savepoint, not a tag. The vocabulary is
 * fixed: Backlog, Playing, Beaten, Completed ("100%"), On hold, Abandoned
 * ("Dropped"), Wishlist. Status is always shown as color *plus* label or glyph,
 * never color alone.
 */
export type GameStatus =
  | "backlog"
  | "playing"
  | "beaten"
  | "completed"
  | "onhold"
  | "abandoned"
  | "wishlist";

export const STATUS_META: Record<
  GameStatus,
  { label: string; icon: IconName; color: string }
> = {
  backlog: { label: "Backlog", icon: "layers", color: "var(--status-backlog)" },
  playing: {
    label: "Playing",
    icon: "gamepad-2",
    color: "var(--status-playing)",
  },
  beaten: { label: "Beaten", icon: "flag", color: "var(--status-beaten)" },
  completed: {
    label: "100%",
    icon: "trophy",
    color: "var(--status-completed)",
  },
  onhold: { label: "On hold", icon: "pause", color: "var(--status-onhold)" },
  abandoned: { label: "Dropped", icon: "x", color: "var(--status-abandoned)" },
  wishlist: {
    label: "Wishlist",
    icon: "bookmark",
    color: "var(--status-wishlist)",
  },
};

export const STATUS_ORDER = Object.keys(STATUS_META) as GameStatus[];

/**
 * Ownership is the primary axis of the product, so platform is a required
 * attribute of a shelved game rather than metadata.
 */
export type Platform =
  | "playstation"
  | "xbox"
  | "nintendo"
  | "pc"
  | "mobile"
  | "retro"
  | "other";

export const PLATFORM_META: Record<Platform, { label: string; color: string }> =
  {
    playstation: {
      label: "PlayStation",
      color: "var(--plat-playstation)",
    },
    xbox: { label: "Xbox", color: "var(--plat-xbox)" },
    nintendo: { label: "Nintendo", color: "var(--plat-nintendo)" },
    pc: { label: "PC", color: "var(--plat-pc)" },
    mobile: { label: "Mobile", color: "var(--plat-mobile)" },
    retro: { label: "Retro", color: "var(--plat-retro)" },
    other: { label: "Other", color: "var(--plat-other)" },
  };

export const PLATFORM_ORDER = Object.keys(PLATFORM_META) as Platform[];

/** How a copy is owned. Drives the disc / cloud glyph on PlatformTag. */
export type GameFormat = "physical" | "digital";
