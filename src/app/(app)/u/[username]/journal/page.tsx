import type { Metadata } from "next";

import { JournalView } from "@/components/profile/journal-view";
import { getGamesBySlugs } from "@/lib/catalog/queries";
import { getJournal } from "@/lib/profile";
import { getShelf, isOwned, uniqueGames } from "@/lib/sample-library";

export const metadata: Metadata = { title: "Journal · Savepoint" };

export default async function JournalPage() {
  const [journal, shelf] = await Promise.all([getJournal(), getShelf()]);
  const catalog = await getGamesBySlugs([...new Set(journal.map((e) => e.slug))]);

  return (
    <JournalView
      entries={journal.flatMap((e) => {
        const g = catalog.find((x) => x.slug === e.slug);
        return g ? [{ ...e, title: g.title, tint: g.tint }] : [];
      })}
      games={uniqueGames(shelf)
        .filter(isOwned)
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((g) => ({ slug: g.slug, title: g.title }))}
    />
  );
}
