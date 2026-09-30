import type { Metadata } from "next";
import Link from "next/link";

import { Empty, Section } from "@/components/app/field";
import { GameLinkCard } from "@/components/app/game-link";
import { RatingsChart } from "@/components/profile/ratings-chart";
import { ReviewCard } from "@/components/profile/review-card";
import { Stat } from "@/components/ui";
import { getGamesBySlugs } from "@/lib/catalog/queries";
import { getJournal, getProfile, getReviews } from "@/lib/profile";
import { LIMITS } from "@/lib/profile-shared";
import { getShelf, isBeaten, isOwned, uniqueGames } from "@/lib/sample-library";

export async function generateMetadata(): Promise<Metadata> {
  const p = await getProfile();
  return { title: `${p.displayName} · Savepoint` };
}

const LINK = "type-label text-text-3 hover:text-text-1 transition-colors duration-[120ms]";

export default async function ProfilePage() {
  const [profile, shelf, journal, reviews] = await Promise.all([
    getProfile(),
    getShelf(),
    getJournal(),
    getReviews(),
  ]);
  const base = `/u/${profile.username}`;

  const games = uniqueGames(shelf);
  const owned = games.filter(isOwned);
  const beaten = owned.filter(isBeaten).length;
  const backlog = owned.filter((g) => g.status === "backlog").length;
  const hours = Math.round(games.reduce((n, g) => n + (g.hours ?? 0), 0));
  const year = new Date().getFullYear();
  const hoursThisYear = journal
    .filter((e) => e.date.startsWith(String(year)))
    .reduce((n, e) => n + e.hours, 0);
  const ratings = games.flatMap((g) => (g.rating ? [g.rating] : []));

  const favorites = await getGamesBySlugs(profile.favorites);
  // Distinct games from your latest sessions, newest first.
  const recentSlugs = [...new Set(journal.map((e) => e.slug))].slice(0, 6);
  const recent = recentSlugs.flatMap((slug) => games.find((g) => g.slug === slug) ?? []);
  const reviewGames = await getGamesBySlugs(reviews.slice(0, 2).map((r) => r.slug));

  return (
    <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14">
      <aside className="flex flex-col gap-8">
        <div>
          <p className="type-overline text-text-4 border-border-1 mb-3 border-b pb-2">Bio</p>
          {profile.bio ? (
            <p className="type-body text-text-2 whitespace-pre-line">{profile.bio}</p>
          ) : (
            <p className="text-text-4 font-body text-sm">
              No bio yet.{" "}
              <Link href="/settings" className="text-text-2 hover:text-text-1 underline underline-offset-2">
                Add one
              </Link>
              .
            </p>
          )}
        </div>
        <div>
          <p className="type-overline text-text-4 border-border-1 mb-4 border-b pb-2">Your ratings</p>
          <RatingsChart ratings={ratings} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col gap-12">
        <div className="border-border-1 grid grid-cols-2 gap-6 border-b pb-8 sm:grid-cols-4">
          <Stat size="lg" label="Owned" value={owned.length} sub={`${shelf.filter(isOwned).length} copies`} />
          <Stat
            size="lg"
            label="Beaten"
            value={beaten}
            color="var(--status-beaten)"
            sub={`${owned.length ? Math.round((beaten / owned.length) * 100) : 0}% of owned`}
          />
          <Stat size="lg" label="Backlog" value={backlog} color="var(--status-backlog)" sub="waiting" />
          <Stat size="lg" label="Hours" value={hours} sub={`${hoursThisYear}h logged in ${year}`} />
        </div>

        <Section title="Favorites" action={<Link href="/settings" className={LINK}>Edit</Link>}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-[repeat(4,minmax(0,180px))]">
            {favorites.map((g) => (
              <GameLinkCard key={g.id} slug={g.slug} title={g.title} year={g.year} tint={g.tint} width={160} fluid />
            ))}
            {Array.from({ length: LIMITS.favorites - favorites.length }).map((_, i) => (
              <Link
                key={i}
                href="/settings"
                className="border-border-2 text-text-4 hover:text-text-2 hover:border-border-3 font-body flex aspect-[3/4] items-center justify-center rounded-cover border border-dashed p-4 text-center text-sm transition-colors duration-[120ms]"
              >
                Pick a favorite
              </Link>
            ))}
          </div>
        </Section>

        <Section title="Recently played" action={<Link href={`${base}/journal`} className={LINK}>Journal</Link>}>
          {recent.length ? (
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
              {recent.map((g) => (
                <GameLinkCard key={g.id} slug={g.slug} title={g.title} tint={g.tint} status={g.status} hours={g.hours} width={120} fluid />
              ))}
            </div>
          ) : (
            <Empty>Nothing logged yet. Log a session in your journal.</Empty>
          )}
        </Section>

        <Section title="Recent reviews" action={<Link href={`${base}/reviews`} className={LINK}>All reviews</Link>}>
          {reviewGames.length ? (
            <div className="flex flex-col gap-3">
              {reviews.slice(0, 2).map((r) => {
                const g = reviewGames.find((x) => x.slug === r.slug);
                if (!g) return null;
                return (
                  <ReviewCard key={r.slug} game={g} review={r} rating={games.find((x) => x.slug === r.slug)?.rating} />
                );
              })}
            </div>
          ) : (
            <Empty>No reviews yet. Write one from the Reviews tab.</Empty>
          )}
        </Section>
      </div>
    </div>
  );
}
