"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import { Button, IconButton, Input } from "@/components/ui";
import { signup, type SignupState } from "@/lib/auth-actions";

function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="text-danger font-body mt-1.5 text-sm">
      {children}
    </p>
  );
}

export function SignupForm() {
  const [state, action, pending] = useActionState<SignupState, FormData>(
    signup,
    undefined,
  );
  const [showPassword, setShowPassword] = useState(false);
  const errors = state?.errors;

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      <div>
        <label htmlFor="username" className="type-label text-text-2 mb-2 block">
          Username
        </label>
        <Input
          id="username"
          name="username"
          autoComplete="username"
          placeholder="player_one"
          icon="user"
          inputSize="lg"
          required
          defaultValue={state?.username}
          invalid={Boolean(errors?.username)}
          aria-describedby={errors?.username ? "username-error" : undefined}
        />
        <FieldError id="username-error">{errors?.username}</FieldError>
      </div>

      <div>
        <label htmlFor="email" className="type-label text-text-2 mb-2 block">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          icon="mail"
          inputSize="lg"
          required
          defaultValue={state?.email}
          invalid={Boolean(errors?.email)}
          aria-describedby={errors?.email ? "email-error" : undefined}
        />
        <FieldError id="email-error">{errors?.email}</FieldError>
      </div>

      <div>
        <label htmlFor="password" className="type-label text-text-2 mb-2 block">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          icon="lock"
          inputSize="lg"
          required
          minLength={8}
          invalid={Boolean(errors?.password)}
          aria-describedby={errors?.password ? "password-error" : undefined}
          className="pr-1.5"
          trailing={
            <IconButton
              icon={showPassword ? "eye-off" : "eye"}
              label={showPassword ? "Hide password" : "Show password"}
              size="sm"
              active={showPassword}
              onClick={() => setShowPassword((v) => !v)}
            />
          }
        />
        <FieldError id="password-error">{errors?.password}</FieldError>
      </div>

      {state?.message ? (
        <p
          role="status"
          className="bg-surface-2 text-text-2 font-body inset-hairline rounded-md px-3 py-2.5 text-sm"
        >
          {state.message}
        </p>
      ) : null}

      <Button type="submit" size="lg" fullWidth disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-text-3 font-body text-center text-sm">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-text-1 font-medium underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
