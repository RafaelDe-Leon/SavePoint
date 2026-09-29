"use client";

import {
  useActionState,
  useEffect,
  useId,
  useOptimistic,
  useState,
  useTransition,
} from "react";

import {
  Button,
  Dialog,
  Icon,
  PlatformTag,
  Rating,
  StatusBadge,
  Toast,
  Toggletip,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  STATUS_META,
  STATUS_ORDER,
  type GameFormat,
  type GameStatus,
  type Platform,
} from "@/lib/game";
import {
  rateGame,
  removeFromLibrary,
  saveToLibrary,
  type SaveResult,
} from "@/lib/library-actions";

type System = { id: string; label: string; platform: Platform };
type Copy = { system: string; format: GameFormat };

export interface LibraryControlProps {
  game: { slug: string; title: string };
  /** Your systems this game can run on. */
  systems: System[];
  /** Your library entry, if the game is already on your shelf or wishlist. */
  entry: {
    copies: Copy[];
    status: GameStatus;
    rating?: number;
    hours?: number;
  } | null;
}

/** Shared tile look for radios and checkboxes; the real <input> is the peer. */
const TILE = cn(
  "bg-surface-3 text-text-3 font-body flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium",
  "transition-[background-color,color,box-shadow] duration-[120ms]",
  "hover:bg-surface-4 hover:text-text-2",
  "peer-checked:bg-surface-5 peer-checked:text-text-1 peer-checked:shadow-[inset_0_0_0_1px_var(--text-2)]",
  "peer-focus-visible:outline-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2",
);

/**
 * A fieldset named by a heading rather than a <legend>: a legend must be the
 * fieldset's first child and can't sit in a row beside the help toggletip.
 */
function Fieldset({
  legend,
  help,
  children,
}: {
  legend: string;
  help?: React.ReactNode;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <fieldset aria-labelledby={id} className="flex flex-col">
      <div className="mb-2.5 flex h-4 items-center gap-1">
        <span id={id} className="type-overline text-text-4">
          {legend}
        </span>
        {help}
      </div>
      {children}
    </fieldset>
  );
}

/** Star picker for the dialog; posts as `rating` (0 = no rating). */
function RatingField({ initial }: { initial: number }) {
  const [rating, setRating] = useState(initial);
  return (
    <Fieldset legend="Your rating">
      <input type="hidden" name="rating" value={rating} />
      <div className="flex items-center gap-3">
        <Rating
          value={rating}
          size={24}
          showValue
          // Picking the current value again clears it.
          onChange={(v) => setRating(v === rating ? 0 : v)}
        />
        {rating ? (
          <button
            type="button"
            onClick={() => setRating(0)}
            className="text-text-3 hover:text-text-1 font-body text-sm transition-colors duration-[120ms]"
          >
            Clear
          </button>
        ) : (
          <span className="text-text-4 font-body text-sm">Optional</span>
        )}
      </div>
    </Fieldset>
  );
}

/**
 * The add/edit form. Mounted fresh each time the dialog opens, so it always
 * starts from what's saved.
 */
function LibraryForm({
  formId,
  game,
  systems,
  entry,
  action,
  error,
}: LibraryControlProps & {
  formId: string;
  action: (formData: FormData) => void;
  error?: string;
}) {
  // Ticked systems and each one's format. Defaults: your saved copies, or the
  // only candidate system when there's just one.
  const [copies, setCopies] = useState<Copy[]>(
    entry?.copies ??
      (systems.length === 1 ? [{ system: systems[0].id, format: "physical" }] : []),
  );
  const has = (id: string) => copies.some((c) => c.system === id);

  const toggle = (id: string) =>
    setCopies((cs) =>
      cs.some((c) => c.system === id)
        ? cs.filter((c) => c.system !== id)
        : // Keep the systems' display order so format rows don't jump around.
          systems.flatMap((s) => {
            const c = cs.find((x) => x.system === s.id);
            if (c) return [c];
            return s.id === id ? [{ system: id, format: "physical" as const }] : [];
          }),
    );

  const setFormat = (id: string, format: GameFormat) =>
    setCopies((cs) => cs.map((c) => (c.system === id ? { ...c, format } : c)));

  return (
    <form id={formId} action={action} className="flex flex-col gap-6">
      <input type="hidden" name="slug" value={game.slug} />

      <Fieldset
        legend="Systems"
        help={
          <Toggletip
            label="About owning a game on more than one system"
            size="sm"
            side="bottom"
            align="start"
            content={
              <>
                Own it on more than one system? Select each one. Every copy
                gets its own spot on that system&rsquo;s shelf, and your status
                is shared between them.
              </>
            }
          />
        }
      >
        {systems.length ? (
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {systems.map((s) => (
              <label key={s.id} className="relative cursor-pointer">
                <input
                  type="checkbox"
                  name="system"
                  value={s.id}
                  checked={has(s.id)}
                  onChange={() => toggle(s.id)}
                  className="peer sr-only"
                />
                <span className={TILE}>
                  <span
                    aria-hidden="true"
                    className="size-2 rounded-[2px]"
                    style={{ background: `var(--plat-${s.platform})` }}
                  />
                  {s.label}
                  {has(s.id) ? <Icon name="check" size={14} className="-mr-1" /> : null}
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p className="text-text-3 font-body text-sm">
            None of your systems can play this. Add the system in settings first.
          </p>
        )}
      </Fieldset>

      {copies.length ? (
        <Fieldset legend="Format">
          <div className="flex flex-col gap-2">
            {copies.map((c) => {
              const s = systems.find((x) => x.id === c.system);
              if (!s) return null;
              return (
                <div
                  key={c.system}
                  role="radiogroup"
                  aria-label={`${s.label} format`}
                  className="flex items-center gap-3"
                >
                  {/* Fixed label column so every row's options line up, and
                   * sit right beside the system name. */}
                  <span className="text-text-2 font-body w-24 shrink-0 truncate text-sm">
                    {s.label}
                  </span>
                  <div className="grid max-w-60 flex-1 grid-cols-2 gap-1.5">
                    {(["physical", "digital"] as const).map((f) => (
                      <label key={f} className="relative cursor-pointer">
                        <input
                          type="radio"
                          name={`format-${c.system}`}
                          value={f}
                          checked={c.format === f}
                          onChange={() => setFormat(c.system, f)}
                          className="peer sr-only"
                        />
                        <span className={cn(TILE, "h-9 capitalize")}>{f}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Fieldset>
      ) : null}

      <Fieldset legend="Status">
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {STATUS_ORDER.map((st) => (
            <label key={st} className="relative cursor-pointer">
              <input
                type="radio"
                name="status"
                value={st}
                defaultChecked={st === (entry?.status ?? "backlog")}
                className="peer sr-only"
              />
              <span className={TILE}>
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full"
                  style={{ background: STATUS_META[st].color }}
                />
                {STATUS_META[st].label}
              </span>
            </label>
          ))}
        </div>
      </Fieldset>

      <RatingField initial={entry?.rating ?? 0} />

      {error ? (
        <p role="alert" className="text-danger font-body text-sm">
          {error}
        </p>
      ) : null}
    </form>
  );
}

export function LibraryControl({ game, systems, entry }: LibraryControlProps) {
  const [open, setOpen] = useState(false);
  // Bumped on every open so the form remounts from the saved values.
  const [session, setSession] = useState(0);
  const [toast, setToast] = useState<{ text: string; tone: "success" | "danger" } | null>(null);
  const [removing, startRemove] = useTransition();

  const finish = (result: SaveResult) => {
    if (result?.ok) {
      setOpen(false);
      setToast({ text: result.message, tone: "success" });
    }
    return result;
  };

  const [state, action, pending] = useActionState<SaveResult, FormData>(
    async (prev, formData) => finish(await saveToLibrary(prev, formData)),
    undefined,
  );

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Stars in the card save immediately; show the new value while it saves.
  const [shownRating, setShownRating] = useOptimistic(entry?.rating ?? 0);
  const [rating, startRating] = useTransition();
  const rate = (v: number) =>
    startRating(async () => {
      setShownRating(v);
      const result = await rateGame(game.slug, v);
      if (result)
        setToast(
          result.ok
            ? { text: result.message, tone: "success" }
            : { text: result.error, tone: "danger" },
        );
    });

  const openDialog = () => {
    setSession((n) => n + 1);
    setOpen(true);
  };

  const formId = `library-${game.slug}`;

  return (
    <>
      <div className="bg-surface-1 inset-hairline flex flex-col gap-4 rounded-lg p-4">
        <p className="type-overline text-text-4">Your log</p>

        {/* Min-height summary so the button below sits in the same place
         * whether or not the game is in your library. */}
        <div className="flex min-h-[58px] flex-col justify-center gap-4">
          {entry ? (
            <>
              <div className="flex flex-wrap gap-1.5">
                {entry.copies.map((c) => {
                  const s = systems.find((x) => x.id === c.system);
                  return s ? (
                    <PlatformTag
                      key={c.system}
                      platform={s.platform}
                      label={s.label}
                      format={entry.status === "wishlist" ? undefined : c.format}
                    />
                  ) : null;
                })}
                <StatusBadge status={entry.status} />
              </div>
              <div className="flex items-center justify-between">
                {/* Rate once here; after that the stars are display-only and
                 * the rating is changed or cleared in Edit. */}
                {shownRating ? (
                  <Rating value={shownRating} size={18} className={cn(rating && "opacity-70")} />
                ) : (
                  <span className="flex items-center gap-2">
                    <Rating value={0} size={18} onChange={rate} />
                    <span className="text-text-4 font-body text-xs">Rate it</span>
                  </span>
                )}
                <span className="type-mono text-text-3">{entry.hours ?? 0}h</span>
              </div>
            </>
          ) : (
            <p className="text-text-3 font-body text-sm">
              Not in your library yet. Add it to start tracking it.
            </p>
          )}
        </div>

        {entry ? (
          <Button variant="secondary" icon="settings" fullWidth onClick={openDialog}>
            Edit
          </Button>
        ) : (
          <Button variant="secondary" icon="plus" fullWidth onClick={openDialog}>
            Add game
          </Button>
        )}
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={entry ? `Edit ${game.title}` : `Add ${game.title}`}
        description="Which systems is it on, and where are you with it?"
        width={560}
        footer={
          <>
            {entry ? (
              <Button
                variant="danger"
                icon="trash-2"
                className="mr-auto"
                disabled={removing || pending}
                onClick={() =>
                  startRemove(async () => {
                    finish(await removeFromLibrary(game.slug));
                  })
                }
              >
                Remove
              </Button>
            ) : null}
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form={formId}
              disabled={pending || removing || !systems.length}
            >
              {pending ? "Saving…" : entry ? "Save changes" : "Add to library"}
            </Button>
          </>
        }
      >
        {open ? (
          <LibraryForm
            key={session}
            formId={formId}
            game={game}
            systems={systems}
            entry={entry}
            action={action}
            error={state && !state.ok ? state.error : undefined}
          />
        ) : null}
      </Dialog>

      <div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
        {toast ? (
          <Toast
            tone={toast.tone}
            title={toast.text}
            onClose={() => setToast(null)}
            className="animate-[toast-in_320ms_var(--ease-spring)]"
          />
        ) : null}
      </div>
    </>
  );
}
