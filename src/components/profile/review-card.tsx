import Link from "next/link";

import { GameCover, Rating } from "@/components/ui";
import type { CatalogGame } from "@/lib/catalog/queries";
import type { Review } from "@/lib/profile";
import { formatDate } from "@/lib/profile-shared";

/** A review beside its cover. `actions` is the owner's edit/delete row. */
export function ReviewCard({
  game,
  review,
  rating,
  actions,
}: {
  game: CatalogGame;
  review: Review;
  rating?: number;
  actions?: React.ReactNode;
}) {
  return (
    <article className="bg-surface-1 inset-hairline flex gap-4 rounded-lg p-4 sm:gap-5 sm:p-5">
      <Link href={`/games/${game.slug}`} className="shrink-0">
        <GameCover title={game.title} tint={game.tint} width={72} className="shadow-cover" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <Link
            href={`/games/${game.slug}`}
            className="type-h3 text-text-1 hover:text-text-2 transition-colors duration-[120ms]"
          >
            {game.title}
          </Link>
          <span className="text-text-4 font-mono text-xs">{game.year}</span>
        </div>
        <div className="flex items-center gap-3">
          {rating ? <Rating value={rating} size={14} /> : <span className="text-text-4 font-body text-sm">Unrated</span>}
          <span className="text-text-4 font-mono text-xs">
            {formatDate(review.updated ?? review.created)}
            {review.updated ? " · edited" : ""}
          </span>
        </div>
        <p className="type-body text-text-2 whitespace-pre-line">{review.body}</p>
        {actions ? <div className="mt-1 flex gap-1">{actions}</div> : null}
      </div>
    </article>
  );
}
