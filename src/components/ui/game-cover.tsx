"use client";

import { cn } from "@/lib/cn";
import { STATUS_META, type GameStatus } from "@/lib/game";
import { Icon } from "./icon";

/** Wishlist and backlog get no corner marker — the shelf would be all dots. */
const MARKED: GameStatus[] = [
  "playing",
  "beaten",
  "completed",
  "onhold",
  "abandoned",
  "wishlist",
];

export interface GameCoverProps {
  title?: string;
  /** Box art. Without it, a tinted placeholder with the title renders. */
  src?: string;
  /** Placeholder fill when there's no art — an oklch tint derived per game. */
  tint?: string;
  /** Rendered width in px; height follows the strict 3:4 ratio. */
  width?: number;
  status?: GameStatus;
  /** Dims the cover — used for wishlist items, which aren't owned. */
  dimmed?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Covers are strict 3:4, 6px radius. Status shows as a corner marker rather
 * than a badge so the art stays readable at shelf size.
 */
export function GameCover({
  title = "",
  src,
  tint,
  width = 132,
  status,
  dimmed = false,
  onClick,
  className,
}: GameCoverProps) {
  const mark = status && MARKED.includes(status) ? STATUS_META[status] : null;
  const interactive = Boolean(onClick);

  const content = (
    <>
      {src ? (
        // Box art comes from arbitrary remote catalogs, so this stays a plain
        // <img> rather than next/image — no host allowlist to maintain.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={title}
          className="block size-full object-cover"
          loading="lazy"
        />
      ) : (
        <div
          className="absolute inset-0 flex items-end"
          style={{ padding: Math.max(8, width * 0.08) }}
        >
          <span
            className="font-display text-balance font-bold text-white/90"
            style={{
              fontSize: Math.max(11, Math.round(width * 0.115)),
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </span>
        </div>
      )}

      {/* Hairline + wishlist dim, above the art. */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] transition-shadow duration-200",
          interactive &&
            "group-hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]",
          dimmed && "bg-ink-950/55",
        )}
      />

      {mark ? (
        <span
          aria-hidden="true"
          style={{ background: mark.color }}
          className="text-ink-950 absolute top-1.5 right-1.5 flex size-[22px] items-center justify-center rounded-full shadow-[0_0_0_2px_rgba(13,14,16,0.6)]"
        >
          <Icon name={mark.icon} size={12} />
        </span>
      ) : null}
    </>
  );

  const shared = cn(
    "group relative block shrink-0 overflow-hidden rounded-cover",
    interactive &&
      "cursor-pointer transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-[3px] hover:shadow-cover",
    className,
  );

  const style = {
    width,
    aspectRatio: "3 / 4",
    background: tint ?? "var(--surface-3)",
  };

  if (!interactive) {
    return (
      <div className={shared} style={style} title={title}>
        {content}
      </div>
    );
  }

  return (
    <button type="button" className={shared} style={style} onClick={onClick}>
      {content}
      <span className="sr-only">{title}</span>
    </button>
  );
}
