import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GameLinkCard } from "@/components/app/game-link";
import { GameCover, Icon, PlatformTag, Stat } from "@/components/ui";
import {
  getGameBySlug,
  getSimilarGames,
} from "@/lib/catalog/queries";
import { PLATFORM_META } from "@/lib/game";
import { LibraryControl } from "@/components/app/library-control";
import { LikeButton } from "@/components/profile/like-button";
import { getLikes } from "@/lib/profile";
import {
  compatibleSystems,
  getShelfEntry,
  systemOf,
} from "@/lib/sample-library";

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export async function generateMetadata({
  params,
}: PageProps<"/games/[slug]">): Promise<Metadata> {
  const game = await getGameBySlug((await params).slug);
  return { title: game ? `${game.title} · Savepoint` : "Game not found · Savepoint" };
}

export default async function GamePage({ params }: PageProps<"/games/[slug]">) {
  const game = await getGameBySlug((await params).slug);
  if (!game) notFound();

  const [entry, similar, likes] = await Promise.all([
    getShelfEntry(game.id),
    getSimilarGames(game),
    getLikes(),
  ]);
  // Your systems that can play it — plus any your copies are on, in case one
  // was logged somewhere the catalog doesn't list.
  const systems = compatibleSystems(game);
  for (const c of entry?.copies ?? []) {
    if (!systems.some((s) => s.id === c.system)) systems.push(systemOf(c.system));
  }

  const stats = [
    { label: "Avg rating", value: game.avgRating.toFixed(1), sub: `${compact.format(game.ratingCount)} ratings` },
    { label: "To beat", value: game.hoursMain ? `${game.hoursMain}h` : "—", sub: "main story" },
    { label: "To 100%", value: game.hoursComplete ? `${game.hoursComplete}h` : "—", sub: "completionist" },
    { label: "Released", value: game.year, sub: game.developer },
  ];

  return (
    <div>
      {/* The one gradient the design system allows: the game's tint fading
       * into the app background behind the title. */}
      <div
        aria-hidden="true"
        className="h-64 sm:h-80"
        style={{
          background: `radial-gradient(120% 90% at 70% 0%, transparent 0%, var(--bg-app) 85%), ${game.tint}`,
        }}
      />

      <main className="relative mx-auto -mt-52 w-full max-w-page px-4 pb-20 sm:-mt-64 sm:px-8">
        <Link
          href="/games"
          className="type-label text-text-2 hover:text-text-1 mb-6 inline-flex items-center gap-1.5 transition-colors duration-[120ms]"
        >
          <Icon name="chevron-left" size={14} />
          Games
        </Link>

        <div className="grid gap-8 md:grid-cols-[260px_minmax(0,1fr)] md:gap-12">
          <div className="flex flex-col gap-4">
            <GameCover
              title={game.title}
              tint={game.tint}
              width={260}
              className="shadow-cover max-md:w-44!"
            />

            <LibraryControl
              game={{ slug: game.slug, title: game.title }}
              systems={systems}
              entry={
                entry
                  ? {
                      copies: entry.copies,
                      status: entry.status,
                      rating: entry.rating,
                      hours: entry.hours,
                    }
                  : null
              }
            />
          </div>

          <div className="flex min-w-0 flex-col gap-7 md:pt-28">
            <div>
              <h1 className="type-h1 sm:type-display text-text-1 text-balance">{game.title}</h1>
              <p className="type-body-lg text-text-2 mt-3">
                {game.developer} · <span className="font-mono">{game.year}</span> ·{" "}
                {game.genres.join(", ")}
              </p>
              <div className="mt-3 -ml-3.5">
                <LikeButton
                  slug={game.slug}
                  title={game.title}
                  liked={likes.some((l) => l.slug === game.slug)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <p className="type-overline text-text-4">Released on</p>
              <div className="flex flex-wrap gap-2">
                {game.platforms.map((p) => (
                  <Link key={p} href={`/games?platform=${p}`}>
                    <PlatformTag platform={p} label={PLATFORM_META[p].label} />
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="bg-surface-1 inset-hairline rounded-lg p-4">
                  <Stat label={s.label} value={s.value} sub={s.sub} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {similar.length ? (
          <section className="mt-16">
            <h2 className="type-h2 text-text-1 mb-4">More like this</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
              {similar.map((g) => (
                <GameLinkCard
                  key={g.id}
                  slug={g.slug}
                  title={g.title}
                  year={g.year}
                  tint={g.tint}
                  width={160}
                  fluid
                />
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
