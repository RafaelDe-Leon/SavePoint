"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";

import { keepValues } from "@/components/app/keep-values";
import { Field, Empty } from "@/components/app/field";
import { useToast } from "@/components/app/use-toast";
import { Button, Dialog, GameCover, IconButton, Input, Select, Textarea } from "@/components/ui";
import type { SaveResult } from "@/lib/library-actions";
import { deleteSession, logSession } from "@/lib/profile-actions";
import { formatDate, LIMITS, today } from "@/lib/profile-shared";

export interface JournalRow {
  id: string;
  slug: string;
  title: string;
  tint: string;
  date: string;
  hours: number;
  note: string;
}

const monthFormat = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

/** Sessions grouped by month, newest first, plus the log-a-session dialog. */
export function JournalView({
  entries,
  games,
}: {
  entries: JournalRow[];
  /** Games in your library you can log time against. */
  games: { slug: string; title: string }[];
}) {
  const { report } = useToast();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);
  const [deleting, startDelete] = useTransition();

  const [state, action, pending] = useActionState<SaveResult, FormData>(async (prev, fd) => {
    const r = await logSession(prev, fd);
    if (r?.ok) {
      setOpen(false);
      report(r);
    }
    return r;
  }, undefined);

  const months = new Map<string, JournalRow[]>();
  for (const e of entries) {
    const key = e.date.slice(0, 7);
    months.set(key, [...(months.get(key) ?? []), e]);
  }
  const total = entries.reduce((n, e) => n + e.hours, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-text-3 font-body text-md">
          <span className="text-text-1 font-mono">{entries.length}</span> sessions,{" "}
          <span className="text-text-1 font-mono">{Math.round(total * 10) / 10}h</span> logged.
          Hours you log here add to each game&rsquo;s total.
        </p>
        <Button
          variant="secondary"
          icon="notebook-pen"
          onClick={() => {
            setSession((n) => n + 1);
            setOpen(true);
          }}
        >
          Log a session
        </Button>
      </div>

      {entries.length === 0 ? (
        <Empty>Your journal is empty. Log a session to start it.</Empty>
      ) : (
        [...months].map(([month, rows]) => (
          <section key={month}>
            <h2 className="type-overline text-text-4 border-border-1 mb-2 border-b pb-2">
              {monthFormat.format(new Date(`${month}-01T00:00:00Z`))}
            </h2>
            <ul className="flex flex-col">
              {rows.map((e) => (
                <li
                  key={e.id}
                  className="border-border-1 grid grid-cols-[56px_32px_minmax(0,1fr)_auto] items-start gap-4 border-b py-3 last:border-b-0"
                >
                  <span className="text-text-3 pt-1 font-mono text-sm">{formatDate(e.date).split(",")[0]}</span>
                  <Link href={`/games/${e.slug}`}>
                    <GameCover title="" tint={e.tint} width={32} />
                  </Link>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <Link
                        href={`/games/${e.slug}`}
                        className="text-text-1 hover:text-text-2 font-body truncate text-md font-semibold"
                      >
                        {e.title}
                      </Link>
                      <span className="text-text-3 font-mono text-sm">{e.hours}h</span>
                    </div>
                    {e.note ? <p className="type-body text-text-2 mt-1 whitespace-pre-line">{e.note}</p> : null}
                  </div>
                  <IconButton
                    icon="trash-2"
                    label={`Delete ${e.title} session on ${formatDate(e.date)}`}
                    size="sm"
                    disabled={deleting}
                    onClick={() => startDelete(async () => void report(await deleteSession(e.id)))}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Log a session"
        description="What did you play, and for how long?"
        width={520}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="journal-form" disabled={pending || !games.length}>
              {pending ? "Saving…" : "Log session"}
            </Button>
          </>
        }
      >
        {open ? (
          <form key={session} id="journal-form" onSubmit={keepValues(action)} className="flex flex-col gap-5">
            {games.length ? (
              <Field label="Game" htmlFor="journal-game">
                <Select id="journal-game" name="slug" className="w-full" options={games.map((g) => ({ value: g.slug, label: g.title }))} />
              </Field>
            ) : (
              <p className="text-text-3 font-body text-sm">Add a game to your library first.</p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date" htmlFor="journal-date">
                <Input id="journal-date" name="date" type="date" defaultValue={today()} max={today()} required />
              </Field>
              <Field label="Hours" htmlFor="journal-hours">
                <Input id="journal-hours" name="hours" type="number" min={0.1} max={24} step={0.1} defaultValue={1} required />
              </Field>
            </div>
            <Field label="Note" htmlFor="journal-note" hint="Optional. Where you got to, what you thought.">
              <Textarea id="journal-note" name="note" rows={3} maxLength={LIMITS.journalNote} count aria-describedby="journal-note-note" />
            </Field>
            {state && !state.ok ? (
              <p role="alert" className="text-danger font-body text-sm">
                {state.error}
              </p>
            ) : null}
          </form>
        ) : null}
      </Dialog>
    </div>
  );
}
