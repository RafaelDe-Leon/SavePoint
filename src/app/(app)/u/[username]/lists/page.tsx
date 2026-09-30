import type { Metadata } from "next";

import { ListsView } from "@/components/profile/lists-view";
import { getGamesBySlugs } from "@/lib/catalog/queries";
import { getLists, getProfile } from "@/lib/profile";

export const metadata: Metadata = { title: "Lists · Savepoint" };

export default async function ListsPage() {
  const [profile, lists] = await Promise.all([getProfile(), getLists()]);

  const summaries = await Promise.all(
    lists.map(async (l) => ({
      id: l.id,
      title: l.title,
      description: l.description,
      count: l.slugs.length,
      updated: l.updated,
      covers: (await getGamesBySlugs(l.slugs.slice(0, 4))).map((g) => g.tint),
    })),
  );

  return <ListsView base={`/u/${profile.username}`} lists={summaries} />;
}
