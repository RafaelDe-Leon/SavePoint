import type { Metadata } from "next";

import { Empty } from "@/components/app/field";
import { GameLinkCard } from "@/components/app/game-link";
import { LikeButton } from "@/components/profile/like-button";
import { getGamesBySlugs } from "@/lib/catalog/queries";
import { getLikes } from "@/lib/profile";
import { formatDate } from "@/lib/profile-shared";
import { getShelfStatuses } from "@/lib/sample-library";

export const metadata: Metadata = { title: "Likes · Savepoint" };

/** Games you've hearted, whether or not you own them. */
export default async function LikesPage() {
  const likes = await getLikes();
  const [games, statuses] = await Promise.all([
    getGamesBySlugs(likes.map((l) => l.slug)),
    getShelfStatuses(),
  ]);

  if (!games.length)
    return <Empty>No likes yet. Heart a game from its page to keep it here.</Empty>;

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:gap-x-5">
      {games.map((g) => {
        const since = likes.find((l) => l.slug === g.slug)!.since;
        return (
          <div key={g.id} className="flex flex-col gap-1">
            <GameLinkCard slug={g.slug} title={g.title} year={g.year} tint={g.tint} status={statuses.get(g.id)} width={140} fluid />
            <div className="flex items-center justify-between">
              <span className="text-text-4 font-mono text-xs">{formatDate(since)}</span>
              <LikeButton slug={g.slug} title={g.title} liked compact />
            </div>
          </div>
        );
      })}
    </div>
  );
}
