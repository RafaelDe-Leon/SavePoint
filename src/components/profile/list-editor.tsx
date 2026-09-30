"use client";

import Link from "next/link";
import { useActionState, useOptimistic, useState, useTransition } from "react";

import { Empty } from "@/components/app/field";
import { GamePicker, type PickedGame } from "@/components/app/game-picker";
import { useToast } from "@/components/app/use-toast";
import { ListForm } from "@/components/profile/list-form";
import { Button, Dialog, GameCover, Icon, IconButton } from "@/components/ui";
import type { SaveResult } from "@/lib/library-actions";
import {
  addToList,
  deleteListAction,
  editListAction,
  moveInList,
  removeFromList,
} from "@/lib/profile-actions";
import { formatDate } from "@/lib/profile-shared";

type Row = PickedGame & { developer: string };

/** One list: its games in order, with add, reorder, remove, edit and delete. */
export function ListEditor({
  base,
  list,
  games,
}: {
  base: string;
  list: { id: string; title: string; description: string; updated: string };
  games: Row[];
}) {
  const { report } = useToast();
  const [dialog, setDialog] = useState<"edit" | "delete" | null>(null);
  const [session, setSession] = useState(0);
  const [busy, start] = useTransition();

  // Reordering shows the new order immediately rather than after the round trip.
  const [shown, setShown] = useOptimistic(games);
  const move = (slug: string, by: -1 | 1) =>
    start(async () => {
      const i = shown.findIndex((g) => g.slug === slug);
      const next = [...shown];
      [next[i], next[i + by]] = [next[i + by], next[i]];
      setShown(next);
      report(await moveInList(list.id, slug, by));
    });

  const [editState, editAction, saving] = useActionState<SaveResult, FormData>(async (prev, fd) => {
    const r = await editListAction(prev, fd);
    if (r?.ok) {
      setDialog(null);
      report(r);
    }
    return r;
  }, undefined);

  const openDialog = (d: "edit" | "delete") => {
    setSession((n) => n + 1);
    setDialog(d);
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href={`${base}/lists`}
          className="type-label text-text-2 hover:text-text-1 mb-4 inline-flex items-center gap-1.5 transition-colors duration-[120ms]"
        >
          <Icon name="chevron-left" size={14} />
          Lists
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 max-w-prose">
            <h2 className="type-h2 text-text-1">{list.title}</h2>
            {list.description ? <p className="type-body text-text-2 mt-2">{list.description}</p> : null}
            <p className="text-text-4 mt-2 font-mono text-xs">
              {shown.length} {shown.length === 1 ? "game" : "games"} · updated {formatDate(list.updated)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon="pencil" onClick={() => openDialog("edit")}>
              Edit
            </Button>
            <Button variant="danger" size="sm" icon="trash-2" onClick={() => openDialog("delete")}>
              Delete
            </Button>
          </div>
        </div>
      </div>

      <GamePicker
        className="max-w-md"
        placeholder="Add a game to this list"
        exclude={shown.map((g) => g.slug)}
        disabled={busy}
        onPick={(g) => start(async () => void report(await addToList(list.id, g.slug)))}
      />

      {shown.length ? (
        <ol className="flex flex-col gap-0.5">
          {shown.map((g, i) => (
            <li
              key={g.slug}
              className="hover:bg-surface-1 grid grid-cols-[28px_40px_minmax(0,1fr)_auto] items-center gap-4 rounded-md px-3 py-2 transition-colors duration-[120ms]"
            >
              <span className="text-text-4 text-right font-mono text-sm">{i + 1}</span>
              <Link href={`/games/${g.slug}`}>
                <GameCover title="" tint={g.tint} width={40} />
              </Link>
              <div className="min-w-0">
                <Link href={`/games/${g.slug}`} className="text-text-1 hover:text-text-2 font-body block truncate text-md font-semibold">
                  {g.title}
                </Link>
                <p className="text-text-4 truncate font-mono text-xs">
                  {g.year} · {g.developer}
                </p>
              </div>
              <div className="flex gap-0.5">
                <IconButton icon="chevron-up" label={`Move ${g.title} up`} size="sm" disabled={busy || i === 0} onClick={() => move(g.slug, -1)} />
                <IconButton
                  icon="chevron-down"
                  label={`Move ${g.title} down`}
                  size="sm"
                  disabled={busy || i === shown.length - 1}
                  onClick={() => move(g.slug, 1)}
                />
                <IconButton
                  icon="x"
                  label={`Remove ${g.title}`}
                  size="sm"
                  disabled={busy}
                  onClick={() => start(async () => void report(await removeFromList(list.id, g.slug)))}
                />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <Empty>This list is empty. Search above to add a game.</Empty>
      )}

      <Dialog
        open={dialog === "edit"}
        onClose={() => setDialog(null)}
        title="Edit list"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button type="submit" form="edit-list" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </>
        }
      >
        {dialog === "edit" ? (
          <ListForm key={session} id="edit-list" list={list} action={editAction} error={editState && !editState.ok ? editState.error : undefined} />
        ) : null}
      </Dialog>

      <Dialog
        open={dialog === "delete"}
        onClose={() => setDialog(null)}
        title={`Delete ${list.title}?`}
        description="The list goes for good. The games stay in your library."
        width={440}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button variant="danger" icon="trash-2" disabled={busy} onClick={() => start(() => deleteListAction(list.id))}>
              Delete list
            </Button>
          </>
        }
      />
    </div>
  );
}
