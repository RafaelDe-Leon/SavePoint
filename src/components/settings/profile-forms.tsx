"use client";

import { useActionState, useRef, useState, useTransition } from "react";

import { Field } from "@/components/app/field";
import { GamePicker, type PickedGame } from "@/components/app/game-picker";
import { keepValues } from "@/components/app/keep-values";
import { useToast } from "@/components/app/use-toast";
import { Card, FormError } from "@/components/settings/panel";
import { Avatar, Button, GameCover, Icon, IconButton, Input, Textarea } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { SaveResult } from "@/lib/library-actions";
import {
  removeAvatar,
  saveEmail,
  saveFavorites,
  saveProfile,
  uploadAvatar,
  type ProfileFormState,
} from "@/lib/profile-actions";
import { AVATAR, LIMITS } from "@/lib/profile-shared";

/* ---------------------------------------------------------------------------
 * Email
 * ------------------------------------------------------------------------- */

export function EmailForm({ email }: { email: string }) {
  const { report } = useToast();
  const [state, action, pending] = useActionState<SaveResult, FormData>(async (prev, fd) => {
    const r = await saveEmail(prev, fd);
    if (r?.ok) report(r);
    return r;
  }, undefined);

  return (
    <Card
      as="form"
      onSubmit={keepValues(action)}
      title="Email"
      description="The address you sign in with. It's never shown on your profile."
      footer={
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? "Saving…" : "Update email"}
        </Button>
      }
    >
      <label htmlFor="email" className="sr-only">
        Email
      </label>
      <Input id="email" name="email" type="email" icon="mail" autoComplete="email" required defaultValue={email} className="max-w-md" />
      <FormError>{state && !state.ok ? state.error : undefined}</FormError>
    </Card>
  );
}

/* ---------------------------------------------------------------------------
 * Picture
 * ------------------------------------------------------------------------- */

/**
 * Center-crops an image to a square and scales it to AVATAR.size, so what's
 * uploaded is a few dozen KB whatever the camera produced. WebP where the
 * browser can encode it, JPEG otherwise.
 */
async function toAvatarBlob(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = AVATAR.size;
  canvas.getContext("2d")!.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    AVATAR.size,
    AVATAR.size,
  );
  bitmap.close();
  const encode = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.88));
  const blob = (await encode("image/webp")) ?? (await encode("image/jpeg"));
  if (!blob) throw new Error("encode");
  // Safari silently falls back to PNG for unsupported types; that's fine.
  return blob;
}

export function AvatarForm({ name, src }: { name: string; src?: string }) {
  const { report, show } = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [dragging, setDragging] = useState(false);

  const upload = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      show({ text: "That isn't an image. Pick a JPG, PNG or WebP.", tone: "danger" });
      return;
    }
    start(async () => {
      let blob: Blob;
      try {
        blob = await toAvatarBlob(file);
      } catch {
        show({ text: "Couldn't read that image. Try a JPG or PNG.", tone: "danger" });
        return;
      }
      const url = URL.createObjectURL(blob);
      setPreview(url);
      const fd = new FormData();
      fd.set("avatar", new File([blob], `avatar.${AVATAR.types[blob.type] ?? "png"}`, { type: blob.type }));
      report(await uploadAvatar(fd));
      setPreview(null);
      URL.revokeObjectURL(url);
    });
    if (input.current) input.current.value = "";
  };

  return (
    <Card
      title="Picture"
      description="Shown on your profile, in the nav, and next to your reviews."
      note="JPG, PNG or WebP. Cropped to a square."
      footer={
        <>
          {src ? (
            <Button
              variant="ghost"
              icon="trash-2"
              disabled={pending}
              onClick={() => start(async () => void report(await removeAvatar()))}
            >
              Remove
            </Button>
          ) : null}
          <Button variant="secondary" icon="upload" disabled={pending} onClick={() => input.current?.click()}>
            {pending ? "Uploading…" : src ? "Upload new picture" : "Upload a picture"}
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-5">
        {/* The avatar is a drop target and a second way to open the picker. */}
        <button
          type="button"
          aria-label="Choose a new picture"
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            upload(e.dataTransfer.files[0]);
          }}
          className={cn(
            "group relative shrink-0 cursor-pointer rounded-[29px]",
            "focus-visible:outline-accent focus-visible:outline-2 focus-visible:outline-offset-2",
            dragging && "outline-accent outline-2 outline-offset-2",
          )}
        >
          <Avatar name={name} src={preview ?? src} size={96} className={cn(pending && "opacity-60")} />
          <span
            aria-hidden="true"
            className="bg-overlay text-text-1 absolute inset-0 flex items-center justify-center rounded-[29px] opacity-0 transition-opacity duration-[120ms] group-hover:opacity-100"
          >
            <span className="font-body flex flex-col items-center gap-1 text-xs font-semibold">
              <Icon name="camera" size={20} />
              Change
            </span>
          </span>
        </button>
        <p className="text-text-3 font-body text-sm">
          Drop an image on your picture, or use the button below. You&rsquo;ll see it everywhere as soon as it uploads.
        </p>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => upload(e.target.files?.[0])}
      />
    </Card>
  );
}

/* ---------------------------------------------------------------------------
 * Details
 * ------------------------------------------------------------------------- */

export function ProfileForm({ profile }: { profile: { displayName: string; username: string; bio: string } }) {
  const { report } = useToast();
  const [state, action, pending] = useActionState<ProfileFormState, FormData>(async (prev, fd) => {
    const r = await saveProfile(prev, fd);
    if (r?.ok) report(r);
    return r;
  }, undefined);
  const errors = state && !state.ok ? state.errors : {};

  return (
    <Card
      as="form"
      onSubmit={keepValues(action)}
      title="Details"
      description="Your name and bio appear at the top of your profile."
      footer={
        <Button type="submit" variant="secondary" icon="check" disabled={pending}>
          {pending ? "Saving…" : "Save details"}
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Display name" htmlFor="displayName" error={errors.displayName}>
            <Input
              id="displayName"
              name="displayName"
              required
              maxLength={LIMITS.displayName}
              defaultValue={profile.displayName}
              invalid={Boolean(errors.displayName)}
            />
          </Field>
          <Field
            label="Username"
            htmlFor="username"
            error={errors.username}
            hint="3–20 letters, numbers or underscores. Changing it changes your profile link."
          >
            <Input
              id="username"
              name="username"
              required
              autoComplete="username"
              defaultValue={profile.username}
              invalid={Boolean(errors.username)}
              aria-describedby="username-note"
              icon="user"
            />
          </Field>
        </div>
        <Field label="Bio" htmlFor="bio" error={errors.bio}>
          <Textarea
            id="bio"
            name="bio"
            rows={3}
            maxLength={LIMITS.bio}
            count
            defaultValue={profile.bio}
            placeholder="What you play, what you're chasing."
            invalid={Boolean(errors.bio)}
          />
        </Field>
      </div>
    </Card>
  );
}

/* ---------------------------------------------------------------------------
 * Favorites
 * ------------------------------------------------------------------------- */

export function FavoritesForm({ favorites: initial }: { favorites: PickedGame[] }) {
  const { report } = useToast();
  const [favorites, setFavorites] = useState(initial);
  const [state, action, pending] = useActionState<SaveResult, FormData>(async (prev, fd) => {
    const r = await saveFavorites(prev, fd);
    if (r?.ok) report(r);
    return r;
  }, undefined);

  const full = favorites.length >= LIMITS.favorites;
  const dirty = favorites.map((g) => g.slug).join() !== initial.map((g) => g.slug).join();
  const swap = (i: number, j: number) =>
    setFavorites((fs) => {
      const next = [...fs];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <Card
      as="form"
      onSubmit={keepValues(action)}
      title="Favorite games"
      description={`Up to ${LIMITS.favorites}, shown in this order at the top of your profile.`}
      note={
        <span className="font-mono">
          {favorites.length}/{LIMITS.favorites}
        </span>
      }
      footer={
        <>
          {dirty ? (
            <Button variant="ghost" onClick={() => setFavorites(initial)}>
              Discard
            </Button>
          ) : null}
          <Button type="submit" variant="secondary" icon="check" disabled={pending || !dirty}>
            {pending ? "Saving…" : "Save favorites"}
          </Button>
        </>
      }
    >
      {favorites.map((g) => (
        <input key={g.slug} type="hidden" name="favorite" value={g.slug} />
      ))}

      <GamePicker
        placeholder={full ? "Remove one to pick another" : "Search for a game to add"}
        disabled={full}
        exclude={favorites.map((g) => g.slug)}
        onPick={(g) => setFavorites((fs) => (fs.length < LIMITS.favorites ? [...fs, g] : fs))}
      />

      <ol className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: LIMITS.favorites }).map((_, i) => {
          const g = favorites[i];
          if (!g)
            return (
              <li
                key={`empty-${i}`}
                className="border-border-2 text-text-4 font-body flex aspect-[3/4] items-center justify-center rounded-cover border border-dashed p-3 text-center text-sm"
              >
                <span>
                  <span className="font-mono">{i + 1}</span>
                  <br />
                  Empty
                </span>
              </li>
            );
          return (
            <li key={g.slug} className="flex min-w-0 flex-col gap-2">
              <GameCover title={g.title} tint={g.tint} width={160} className="w-full! shadow-cover" />
              <div className="flex items-center gap-0.5">
                <span className="text-text-1 font-body min-w-0 flex-1 truncate text-sm font-medium" title={g.title}>
                  {g.title}
                </span>
                <IconButton icon="chevron-left" size="sm" label={`Move ${g.title} earlier`} disabled={i === 0} onClick={() => swap(i, i - 1)} />
                <IconButton
                  icon="chevron-right"
                  size="sm"
                  label={`Move ${g.title} later`}
                  disabled={i === favorites.length - 1}
                  onClick={() => swap(i, i + 1)}
                />
                <IconButton icon="x" size="sm" label={`Remove ${g.title}`} onClick={() => setFavorites((fs) => fs.filter((x) => x.slug !== g.slug))} />
              </div>
            </li>
          );
        })}
      </ol>
      <FormError>{state && !state.ok ? state.error : undefined}</FormError>
    </Card>
  );
}
