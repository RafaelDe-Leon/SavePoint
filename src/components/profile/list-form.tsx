"use client";

import { keepValues } from "@/components/app/keep-values";
import { Field } from "@/components/app/field";
import { Input, Textarea } from "@/components/ui";
import { LIMITS } from "@/lib/profile-shared";

/** Title + description, shared by the create and edit dialogs. */
export function ListForm({
  id,
  action,
  list,
  error,
}: {
  id: string;
  action: (fd: FormData) => void;
  list?: { id: string; title: string; description: string };
  error?: string;
}) {
  return (
    <form id={id} onSubmit={keepValues(action)} className="flex flex-col gap-5">
      {list ? <input type="hidden" name="id" value={list.id} /> : null}
      <Field label="Title" htmlFor={`${id}-title`}>
        <Input
          id={`${id}-title`}
          name="title"
          required
          maxLength={LIMITS.listTitle}
          defaultValue={list?.title}
          placeholder="Games to finish before the sequel"
          autoFocus
        />
      </Field>
      <Field label="Description" htmlFor={`${id}-description`} hint="Optional.">
        <Textarea
          id={`${id}-description`}
          name="description"
          rows={3}
          maxLength={LIMITS.listDescription}
          count
          defaultValue={list?.description}
          aria-describedby={`${id}-description-note`}
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
