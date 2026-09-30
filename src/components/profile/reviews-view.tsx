"use client";

import { useActionState, useState, useTransition } from "react";

import { keepValues } from "@/components/app/keep-values";
import { Empty, Field } from "@/components/app/field";
import { useToast } from "@/components/app/use-toast";
import { ReviewCard } from "@/components/profile/review-card";
import { Button, Dialog, Rating, Select, Textarea } from "@/components/ui";
import type { CatalogGame } from "@/lib/catalog/queries";
import type { SaveResult } from "@/lib/library-actions";
import type { Review } from "@/lib/profile";
import { deleteReview, saveReviewAction } from "@/lib/profile-actions";
import { LIMITS } from "@/lib/profile-shared";

/** A game in your library you could review, with what you've already said. */
export interface Reviewable {
  slug: string;
  title: string;
  rating?: number;
  review?: string;
}

function ReviewForm({
  games,
  initialSlug,
  action,
  error,
}: {
  games: Reviewable[];
  initialSlug?: string;
  action: (fd: FormData) => void;
  error?: string;
}) {
  const [slug, setSlug] = useState(initialSlug ?? games.find((g) => !g.review)?.slug ?? games[0]?.slug);
  const game = games.find((g) => g.slug === slug);
  const [rating, setRating] = useState(game?.rating ?? 0);
  const [body, setBody] = useState(game?.review ?? "");

  // Switching games loads what you'd already written about the new one.
  const pick = (next: string) => {
    const g = games.find((x) => x.slug === next);
    setSlug(next);
    setRating(g?.rating ?? 0);
    setBody(g?.review ?? "");
  };

  return (
    <form id="review-form" onSubmit={keepValues(action)} className="flex flex-col gap-5">
      {initialSlug ? (
        <input type="hidden" name="slug" value={slug} />
      ) : (
        <Field label="Game" htmlFor="review-game">
          <Select
            id="review-game"
            name="slug"
            className="w-full"
            value={slug}
            onChange={(e) => pick(e.target.value)}
            options={games.map((g) => ({ value: g.slug, label: g.review ? `${g.title} (reviewed)` : g.title }))}
          />
        </Field>
      )}
      <div>
        <p className="type-label text-text-2 mb-2">Your rating</p>
        <input type="hidden" name="rating" value={rating} />
        <div className="flex items-center gap-3">
          <Rating value={rating} size={24} showValue onChange={(v) => setRating(v === rating ? 0 : v)} />
          {rating ? (
            <button type="button" onClick={() => setRating(0)} className="text-text-3 hover:text-text-1 font-body text-sm">
              Clear
            </button>
          ) : null}
        </div>
      </div>
      <Field label="Review" htmlFor="review-body">
        <Textarea
          id="review-body"
          name="body"
          rows={7}
          maxLength={LIMITS.review}
          count
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What worked, what didn't, who should play it."
        />
      </Field>
      {error ? (
        <p role="alert" className="text-danger font-body text-sm">
          {error}
        </p>
      ) : null}
    </form>
  );
}

export function ReviewsView({
  reviews,
  games,
}: {
  reviews: { review: Review; game: CatalogGame; rating?: number }[];
  games: Reviewable[];
}) {
  const { report } = useToast();
  const [editing, setEditing] = useState<{ slug?: string; session: number } | null>(null);
  const [deleting, startDelete] = useTransition();

  const [state, action, pending] = useActionState<SaveResult, FormData>(async (prev, fd) => {
    const r = await saveReviewAction(prev, fd);
    if (r?.ok) {
      setEditing(null);
      report(r);
    }
    return r;
  }, undefined);

  const open = (slug?: string) => setEditing((e) => ({ slug, session: (e?.session ?? 0) + 1 }));
  const title = editing?.slug ? `Edit your review of ${games.find((g) => g.slug === editing.slug)?.title}` : "Write a review";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-text-3 font-body text-md">
          <span className="text-text-1 font-mono">{reviews.length}</span> reviews. One per game; the stars are your shelf rating.
        </p>
        <Button variant="secondary" icon="message-square-text" onClick={() => open()} disabled={!games.length}>
          Write a review
        </Button>
      </div>

      {reviews.length ? (
        <div className="flex flex-col gap-3">
          {reviews.map(({ review, game, rating }) => (
            <ReviewCard
              key={review.slug}
              game={game}
              review={review}
              rating={rating}
              actions={
                <>
                  <Button variant="ghost" size="sm" icon="pencil" onClick={() => open(review.slug)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="trash-2"
                    disabled={deleting}
                    onClick={() => startDelete(async () => void report(await deleteReview(review.slug)))}
                  >
                    Delete
                  </Button>
                </>
              }
            />
          ))}
        </div>
      ) : (
        <Empty>No reviews yet. Write one for a game you&rsquo;ve played.</Empty>
      )}

      <Dialog
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={title}
        width={600}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" form="review-form" disabled={pending}>
              {pending ? "Saving…" : "Save review"}
            </Button>
          </>
        }
      >
        {editing ? (
          <ReviewForm
            key={editing.session}
            games={games}
            initialSlug={editing.slug}
            action={action}
            error={state && !state.ok ? state.error : undefined}
          />
        ) : null}
      </Dialog>
    </div>
  );
}
