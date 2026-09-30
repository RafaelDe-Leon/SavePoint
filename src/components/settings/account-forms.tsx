"use client";

import { useActionState, useOptimistic, useState, useTransition } from "react";

import { Field } from "@/components/app/field";
import { useToast } from "@/components/app/use-toast";
import { Card, FormError } from "@/components/settings/panel";
import { Button, Dialog, Input, Switch } from "@/components/ui";
import { cn } from "@/lib/cn";
import { saveLibraryTabOrder, type SaveResult } from "@/lib/library-actions";
import {
  changePassword,
  resetAllData,
  setNotification,
  setPrivacy,
  setVisibility,
} from "@/lib/profile-actions";
import {
  NOTIFICATIONS,
  PRIVACY_TOGGLES,
  VISIBILITY,
  type NotificationKey,
  type PrivacyToggle,
  type Visibility,
} from "@/lib/profile-shared";

/* ---------------------------------------------------------------------------
 * Security
 * ------------------------------------------------------------------------- */

export function PasswordForm() {
  const { report } = useToast();
  // Remounted after a successful change so the fields clear.
  const [session, setSession] = useState(0);
  const [state, action, pending] = useActionState<SaveResult, FormData>(async (prev, fd) => {
    const r = await changePassword(prev, fd);
    if (r?.ok) {
      report(r);
      setSession((n) => n + 1);
    }
    return r;
  }, undefined);

  return (
    <Card
      key={session}
      as="form"
      action={action}
      title="Password"
      description="Use at least 8 characters. A passphrase is easier to remember than symbols."
      footer={
        <Button type="submit" variant="secondary" icon="lock" disabled={pending}>
          {pending ? "Saving…" : "Change password"}
        </Button>
      }
    >
      <div className="flex max-w-md flex-col gap-4">
        <Field label="Current password" htmlFor="current">
          <Input id="current" name="current" type="password" autoComplete="current-password" required />
        </Field>
        <Field label="New password" htmlFor="next">
          <Input id="next" name="next" type="password" autoComplete="new-password" minLength={8} required />
        </Field>
        <Field label="Confirm new password" htmlFor="confirm">
          <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required />
        </Field>
      </div>
      <FormError>{state && !state.ok ? state.error : undefined}</FormError>
    </Card>
  );
}

/* ---------------------------------------------------------------------------
 * Switch lists — each switch saves the moment it flips
 * ------------------------------------------------------------------------- */

function SwitchList<K extends string>({
  items,
  values,
  save,
}: {
  items: Record<K, { label: string; description: string }>;
  values: Record<K, boolean>;
  save: (key: K, on: boolean) => Promise<SaveResult>;
}) {
  const { report } = useToast();
  const [shown, setShown] = useOptimistic(values);
  const [, start] = useTransition();

  return (
    <ul className="divide-border-1 -my-3 divide-y">
      {(Object.keys(items) as K[]).map((key) => (
        <li key={key} className="flex items-center justify-between gap-6 py-3.5">
          <div className="min-w-0">
            <p id={`${key}-label`} className="text-text-1 font-body text-md font-medium">
              {items[key].label}
            </p>
            <p className="text-text-3 font-body text-sm">{items[key].description}</p>
          </div>
          <Switch
            aria-labelledby={`${key}-label`}
            checked={shown[key]}
            onChange={(e) => {
              const on = e.target.checked;
              start(async () => {
                setShown({ ...shown, [key]: on });
                report(await save(key, on));
              });
            }}
          />
        </li>
      ))}
    </ul>
  );
}

export function NotificationSettings({ values }: { values: Record<NotificationKey, boolean> }) {
  return <SwitchList items={NOTIFICATIONS} values={values} save={setNotification} />;
}

export function PrivacyToggles({ values }: { values: Record<PrivacyToggle, boolean> }) {
  return <SwitchList items={PRIVACY_TOGGLES} values={values} save={setPrivacy} />;
}

/** Radio tiles for who can see your profile. Saves on change. */
export function VisibilityPicker({ value }: { value: Visibility }) {
  const { report } = useToast();
  const [shown, setShown] = useOptimistic(value);
  const [, start] = useTransition();

  return (
    <div role="radiogroup" aria-label="Who can see your profile" className="grid gap-2 sm:grid-cols-3">
      {(Object.keys(VISIBILITY) as Visibility[]).map((v) => (
        <label key={v} className="relative cursor-pointer">
          <input
            type="radio"
            name="visibility"
            value={v}
            checked={shown === v}
            onChange={() =>
              start(async () => {
                setShown(v);
                report(await setVisibility(v));
              })
            }
            className="peer sr-only"
          />
          <span
            className={cn(
              "bg-surface-2 flex h-full flex-col gap-1 rounded-md p-3.5",
              "transition-[background-color,box-shadow] duration-[120ms]",
              "hover:bg-surface-3",
              "peer-checked:bg-surface-4 peer-checked:shadow-[inset_0_0_0_1px_var(--text-2)]",
              "peer-focus-visible:outline-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2",
            )}
          >
            <span className="text-text-1 font-body text-md font-semibold">{VISIBILITY[v].label}</span>
            <span className="text-text-3 font-body text-sm">{VISIBILITY[v].description}</span>
          </span>
        </label>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Appearance and data
 * ------------------------------------------------------------------------- */

export function ResetTabOrder({ custom }: { custom: boolean }) {
  const { report } = useToast();
  const [pending, start] = useTransition();
  return (
    <Button
      variant="secondary"
      icon="rotate-ccw"
      disabled={!custom || pending}
      onClick={() => start(async () => void report(await saveLibraryTabOrder(null)))}
    >
      Reset order
    </Button>
  );
}

export function ResetData() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [pending, start] = useTransition();
  const armed = confirm.trim().toLowerCase() === "reset";

  return (
    <>
      <Button
        variant="danger"
        icon="rotate-ccw"
        onClick={() => {
          setConfirm("");
          setOpen(true);
        }}
      >
        Reset all data
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Reset all data?"
        description="Everything you've logged is replaced with the sample data. This can't be undone."
        width={460}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" icon="rotate-ccw" disabled={!armed || pending} onClick={() => start(() => resetAllData())}>
              {pending ? "Resetting…" : "Reset everything"}
            </Button>
          </>
        }
      >
        <Field label="Type reset to confirm" htmlFor="confirm-reset">
          <Input id="confirm-reset" autoComplete="off" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </Field>
      </Dialog>
    </>
  );
}
