import type { Metadata } from "next";
import Link from "next/link";

import { Greeting } from "@/components/app/greeting";
import { GameLinkCard } from "@/components/app/game-link";
import { PlatformTag, ProgressBar, Stat } from "@/components/ui";
import {
  getShelf,
  isBeaten,
  isOwned,
  SAMPLE_USER,
  systemOf,
  SYSTEMS,
  uniqueGames,
  type ShelfGame,
} from "@/lib/sample-library";

export const metadata: Metadata = { title: "Home · Savepoint" };

function SectionHead({
  title,
  action,
}: {
  title: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-4">
      <h2 className="type-h2 text-text-1">{title}</h2>
      {action ? (
        <Link
          href={action.href}
          className="type-label text-text-3 hover:text-text-1 transition-colors duration-[120ms]"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

function Shelf({ games }: { games: ShelfGame[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-[repeat(auto-fill,150px)] sm:gap-6">
      {games.map((g) => {
        const s = systemOf(g.system);
        return (
          <GameLinkCard
            key={g.id}
            slug={g.slug}
            title={g.title}
            year={g.year}
            tint={g.tint}
            platform={s.platform}
            platformLabel={s.label}
            format={g.format}
            status={g.status}
            rating={g.rating}
            hours={g.hours}
            width={150}
            fluid
          />
        );
      })}
    </div>
  );
}

export default async function HomePage() {
  // Copies drive the per-system cards; everything else counts each game once.
  const copies = (await getShelf()).filter(isOwned);
  const owned = uniqueGames(copies);
  const beaten = owned.filter(isBeaten).length;
  const playing = owned.filter((g) => g.status === "playing");
  const backlog = owned.filter((g) => g.status === "backlog");

  return (
    <main className="mx-auto flex w-full max-w-page flex-col gap-12 px-4 pt-8 pb-20 sm:px-8">
      <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10">
        <Greeting name={SAMPLE_USER.name} waiting={backlog.length} />

        <div className="bg-surface-1 inset-hairline flex flex-col gap-5 rounded-lg p-5">
          <div className="grid grid-cols-4 gap-3">
            <Stat label="Owned" value={owned.length} />
            <Stat label="Beaten" value={beaten} color="var(--status-beaten)" />
            <Stat label="Playing" value={playing.length} color="var(--status-playing)" />
            <Stat label="Backlog" value={backlog.length} color="var(--status-backlog)" />
          </div>
          <ProgressBar
            label="Shelf cleared"
            showValue
            max={owned.length}
            segments={[
              { value: beaten, color: "var(--status-beaten)", label: "Beaten" },
              { value: playing.length, color: "var(--status-playing)", label: "Playing" },
            ]}
          />
        </div>
      </div>

      <section>
        <SectionHead title="Now playing" />
        <Shelf games={playing} />
      </section>

      <section>
        <SectionHead
          title="Up next from your backlog"
          action={{ href: "/library", label: "Open library" }}
        />
        <Shelf games={backlog.slice(0, 6)} />
      </section>

      <section>
        <SectionHead title="By system" />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
          {SYSTEMS.map((s) => {
            const games = copies.filter((g) => g.system === s.id);
            const done = games.filter(isBeaten).length;
            return (
              <Link
                key={s.id}
                href={`/library?system=${s.id}`}
                className="bg-surface-1 inset-hairline hover:bg-surface-2 flex flex-col gap-3.5 rounded-lg p-4 transition-colors duration-[120ms]"
              >
                <div className="flex items-center justify-between">
                  <PlatformTag platform={s.platform} label={s.label} />
                  <span className="type-mono text-text-3">
                    {done}/{games.length}
                  </span>
                </div>
                <ProgressBar
                  value={done}
                  max={games.length || 1}
                  color={`var(--plat-${s.platform})`}
                  height={4}
                />
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
