import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ListEditor } from "@/components/profile/list-editor";
import { getGamesBySlugs } from "@/lib/catalog/queries";
import { getList, getProfile } from "@/lib/profile";

export async function generateMetadata({ params }: PageProps<"/u/[username]/lists/[id]">): Promise<Metadata> {
  const list = await getList((await params).id);
  return { title: `${list?.title ?? "List not found"} · Savepoint` };
}

export default async function ListPage({ params }: PageProps<"/u/[username]/lists/[id]">) {
  const [list, profile] = await Promise.all([getList((await params).id), getProfile()]);
  if (!list) notFound();
  const games = await getGamesBySlugs(list.slugs);

  return (
    <ListEditor
      base={`/u/${profile.username}`}
      list={{ id: list.id, title: list.title, description: list.description, updated: list.updated }}
      games={games.map((g) => ({ slug: g.slug, title: g.title, year: g.year, tint: g.tint, developer: g.developer }))}
    />
  );
}
