import type { Metadata } from "next";

import { ReviewsView } from "@/components/profile/reviews-view";
import { getGamesBySlugs } from "@/lib/catalog/queries";
import { getReviews } from "@/lib/profile";
import { getShelf, isOwned, uniqueGames } from "@/lib/sample-library";

export const metadata: Metadata = { title: "Reviews · Savepoint" };

export default async function ReviewsPage() {
  const [reviews, shelf] = await Promise.all([getReviews(), getShelf()]);
  const games = uniqueGames(shelf);
  const catalog = await getGamesBySlugs(reviews.map((r) => r.slug));

  return (
    <ReviewsView
      reviews={reviews.flatMap((review) => {
        const game = catalog.find((g) => g.slug === review.slug);
        return game ? [{ review, game, rating: games.find((g) => g.slug === review.slug)?.rating }] : [];
      })}
      games={games
        .filter(isOwned)
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((g) => ({
          slug: g.slug,
          title: g.title,
          rating: g.rating,
          review: reviews.find((r) => r.slug === g.slug)?.body,
        }))}
    />
  );
}
