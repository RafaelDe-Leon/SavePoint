"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";

import { Empty } from "@/components/app/field";
import { ListForm } from "@/components/profile/list-form";
import { Button, Dialog, GameCover } from "@/components/ui";
import { createListAction, type ListResult } from "@/lib/profile-actions";
import { formatDate } from "@/lib/profile-shared";

export interface ListSummary {
  id: string;
  title: string;
  description: string;
  count: number;
  updated: string;
  /** Tints of the first few games, for the fanned cover stack. */
  covers: string[];
}

export function ListsView({ base, lists }: { base: string; lists: ListSummary[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);

  const [state, action, pending] = useActionState<ListResult, FormData>(async (prev, fd) => {
    const r = await createListAction(prev, fd);
    // Straight into the new list to start adding games.
    if (r?.ok && r.id) router.push(`${base}/lists/${r.id}`);
    return r;
  }, undefined);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-text-3 font-body text-md">
          <span className="text-text-1 font-mono">{lists.length}</span> lists. Any game in the catalog can go on one.
        </p>
        <Button
          variant="secondary"
          icon="list-plus"
          onClick={() => {
            setSession((n) => n + 1);
            setOpen(true);
          }}
        >
          New list
        </Button>
      </div>

      {lists.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((l) => (
            <Link
              key={l.id}
              href={`${base}/lists/${l.id}`}
              className="bg-surface-1 inset-hairline hover:bg-surface-2 flex flex-col gap-4 rounded-lg p-4 transition-colors duration-[120ms]"
            >
              <div className="flex h-[92px] items-end">
                {l.covers.length ? (
                  l.covers.map((tint, i) => (
                    <GameCover
                      key={i}
                      tint={tint}
                      width={66}
                      className="shadow-cover -mr-5 last:mr-0"
                    />
                  ))
                ) : (
                  <span className="text-text-4 font-body text-sm">No games yet</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="type-h3 text-text-1 truncate">{l.title}</p>
                {l.description ? <p className="text-text-3 font-body mt-1 line-clamp-2 text-sm">{l.description}</p> : null}
                <p className="text-text-4 mt-2 font-mono text-xs">
                  {l.count} {l.count === 1 ? "game" : "games"} · updated {formatDate(l.updated)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <Empty>No lists yet. Make one for a ranking, a challenge or a to-play pile.</Empty>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="New list"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="new-list" disabled={pending}>
              {pending ? "Creating…" : "Create list"}
            </Button>
          </>
        }
      >
        {open ? (
          <ListForm key={session} id="new-list" action={action} error={state && !state.ok ? state.error : undefined} />
        ) : null}
      </Dialog>
    </div>
  );
}
