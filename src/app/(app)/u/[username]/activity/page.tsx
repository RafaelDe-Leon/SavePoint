import type { Metadata } from "next";
import Link from "next/link";

import { Empty } from "@/components/app/field";
import { GameCover, Icon, type IconName } from "@/components/ui";
import { getGamesBySlugs, type CatalogGame } from "@/lib/catalog/queries";
import {
  getFollowing,
  getJournal,
  getLikes,
  getLists,
  getProfile,
  getReviews,
  personOf,
} from "@/lib/profile";
import { formatDate } from "@/lib/profile-shared";
import { getShelf, systemOf, uniqueGames } from "@/lib/sample-library";

export const metadata: Metadata = { title: "Activity · Savepoint" };

const PAGE = 40;
const listFormat = new Intl.ListFormat("en", { type: "conjunction" });

interface Item {
  key: string;
  date: string;
  icon: IconName;
  text: React.ReactNode;
  game?: CatalogGame;
  detail?: string;
}

function GameName({ game }: { game: CatalogGame }) {
  return (
    <Link href={`/games/${game.slug}`} className="text-text-1 hover:text-text-2 font-semibold">
      {game.title}
    </Link>
  );
}

/**
 * Everything you've done, newest first, derived from the records themselves —
 * there's no separate event log to fall out of sync.
 */
export default async function ActivityPage({ searchParams }: PageProps<"/u/[username]/activity">) {
  const { all } = await searchParams;
  const [profile, shelf, journal, reviews, lists, following, likes] = await Promise.all([
    getProfile(),
    getShelf(),
    getJournal(),
    getReviews(),
    getLists(),
    getFollowing(),
    getLikes(),
  ]);
  const base = `/u/${profile.username}`;

  const slugs = [
    ...new Set([...journal.map((e) => e.slug), ...reviews.map((r) => r.slug), ...likes.map((l) => l.slug)]),
  ];
  const catalog = new Map((await getGamesBySlugs(slugs)).map((g) => [g.slug, g]));
  const games = uniqueGames(shelf);
  for (const g of games) catalog.set(g.slug, g);

  const items: Item[] = [];

  for (const g of games) {
    items.push({
      key: `add-${g.slug}`,
      date: g.added,
      icon: g.status === "wishlist" ? "bookmark" : "plus",
      game: g,
      text:
        g.status === "wishlist" ? (
          <>Added <GameName game={g} /> to your wishlist</>
        ) : (
          <>Added <GameName game={g} /> on {listFormat.format(g.copies.map((c) => systemOf(c.system).label))}</>
        ),
    });
  }
  for (const e of journal) {
    const g = catalog.get(e.slug);
    if (!g) continue;
    items.push({
      key: `play-${e.id}`,
      date: e.date,
      icon: "gamepad-2",
      game: g,
      detail: e.note,
      text: (
        <>
          Played <GameName game={g} /> for <span className="font-mono">{e.hours}h</span>
        </>
      ),
    });
  }
  for (const r of reviews) {
    const g = catalog.get(r.slug);
    if (!g) continue;
    items.push({
      key: `review-${r.slug}`,
      date: r.updated ?? r.created,
      icon: "message-square-text",
      game: g,
      detail: r.body,
      text: <>{r.updated ? "Updated a review of" : "Reviewed"} <GameName game={g} /></>,
    });
  }
  for (const l of lists) {
    const name = (
      <Link href={`${base}/lists/${l.id}`} className="text-text-1 hover:text-text-2 font-semibold">
        {l.title}
      </Link>
    );
    items.push({ key: `list-${l.id}`, date: l.created, icon: "list-plus", text: <>Created the list {name}</> });
    if (l.updated !== l.created)
      items.push({ key: `list-up-${l.id}`, date: l.updated, icon: "list", text: <>Updated the list {name}</> });
  }
  for (const f of following) {
    const p = personOf(f.username);
    if (p)
      items.push({
        key: `follow-${f.username}`,
        date: f.since,
        icon: "user-plus",
        text: <>Followed <span className="text-text-1 font-semibold">{p.name}</span></>,
      });
  }
  for (const l of likes) {
    const g = catalog.get(l.slug);
    if (g) items.push({ key: `like-${l.slug}`, date: l.since, icon: "heart", game: g, text: <>Liked <GameName game={g} /></> });
  }

  items.sort((a, b) => b.date.localeCompare(a.date));
  const shown = all ? items : items.slice(0, PAGE);

  if (!items.length) return <Empty>No activity yet. Log a game to get started.</Empty>;

  // Group consecutive items by day.
  const days = new Map<string, Item[]>();
  for (const it of shown) days.set(it.date, [...(days.get(it.date) ?? []), it]);

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      {[...days].map(([date, dayItems]) => (
        <section key={date}>
          <h2 className="type-overline text-text-4 border-border-1 mb-1 border-b pb-2">{formatDate(date)}</h2>
          <ul>
            {dayItems.map((it) => (
              <li key={it.key} className="flex items-start gap-3.5 py-3">
                <span className="bg-surface-2 text-text-3 mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md">
                  <Icon name={it.icon} size={16} />
                </span>
                <div className="font-body text-text-2 min-w-0 flex-1 pt-1.5 text-md">
                  <p>{it.text}</p>
                  {it.detail ? <p className="text-text-3 mt-1 line-clamp-2 text-sm">{it.detail}</p> : null}
                </div>
                {it.game ? (
                  <Link href={`/games/${it.game.slug}`} className="shrink-0" tabIndex={-1} aria-hidden="true">
                    <GameCover title="" tint={it.game.tint} width={32} />
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
      {!all && items.length > PAGE ? (
        <Link href="?all=1" scroll={false} className="type-label text-text-3 hover:text-text-1 self-start">
          Show all <span className="font-mono">{items.length}</span>
        </Link>
      ) : null}
    </div>
  );
}
