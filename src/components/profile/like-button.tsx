"use client";

import { useOptimistic, useTransition } from "react";

import { useToast } from "@/components/app/use-toast";
import { Button, IconButton } from "@/components/ui";
import { toggleLike } from "@/lib/profile-actions";

/**
 * Heart toggle for a game. `compact` is the icon-only form used on cards;
 * the default is a labelled button for the game page.
 */
export function LikeButton({
  slug,
  title,
  liked,
  compact = false,
}: {
  slug: string;
  title: string;
  liked: boolean;
  compact?: boolean;
}) {
  const { report } = useToast();
  const [on, setOn] = useOptimistic(liked);
  const [, start] = useTransition();

  const toggle = () =>
    start(async () => {
      setOn(!on);
      report(await toggleLike(slug, !on));
    });

  return compact ? (
    <IconButton
      icon="heart"
      label={on ? `Unlike ${title}` : `Like ${title}`}
      size="sm"
      active={on}
      onClick={toggle}
    />
  ) : (
    <Button
      variant="ghost"
      icon="heart"
      aria-pressed={on}
      onClick={toggle}
      className={on ? "text-accent hover:text-accent" : undefined}
    >
      {on ? "Liked" : "Like"}
    </Button>
  );
}
