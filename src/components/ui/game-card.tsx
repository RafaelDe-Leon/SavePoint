"use client";

import { cn } from "@/lib/cn";
import type { GameFormat, GameStatus, Platform } from "@/lib/game";
import { GameCover } from "./game-cover";
import { PlatformTag } from "./platform-tag";
import { Rating } from "./rating";
import { StatusBadge } from "./status-badge";

export interface GameCardProps {
  title: string;
  year?: number | string;
  src?: string;
  tint?: string;
  status?: GameStatus;
  platform?: Platform;
  /** Specific system ("Switch") rather than the family ("Nintendo"). */
  platformLabel?: string;
  format?: GameFormat;
  rating?: number;
  hours?: number;
  width?: number;
  onClick?: () => void;
  className?: string;
}

/** The shelf unit: cover, title, ownership, and your log at a glance. */
export function GameCard({
  title,
  year,
  src,
  tint,
  status,
  platform,
  platformLabel,
  format,
  rating,
  hours,
  width = 160,
  onClick,
  className,
}: GameCardProps) {
  return (
    <div
      className={cn("flex flex-col gap-2.5", className)}
      style={{ width }}
    >
      <GameCover
        title={title}
        src={src}
        tint={tint}
        width={width}
        // No corner marker: the StatusBadge under the title already says it.
        onClick={onClick}
        dimmed={status === "wishlist"}
      />

      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex min-w-0 items-baseline gap-1.5">
          <span className="text-text-1 truncate text-md font-semibold leading-[1.25]">
            {title}
          </span>
          {year ? (
            <span className="text-text-4 shrink-0 font-mono text-xs leading-none">
              {year}
            </span>
          ) : null}
        </div>

        {platform || status ? (
          <div className="flex flex-wrap gap-1">
            {platform ? (
              <PlatformTag
                platform={platform}
                label={platformLabel}
                format={format}
                size="sm"
              />
            ) : null}
            {status ? <StatusBadge status={status} size="sm" /> : null}
          </div>
        ) : null}

        {rating != null || hours != null ? (
          <div className="flex items-center justify-between gap-2">
            {rating != null ? <Rating value={rating} size={11} /> : <span />}
            {hours != null ? (
              <span className="text-text-3 font-mono text-[11px] font-medium leading-none">
                {hours}h
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
