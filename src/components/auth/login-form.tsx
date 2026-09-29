"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import { Button, Checkbox, IconButton, Input } from "@/components/ui";
import { login, type LoginState } from "@/lib/auth-actions";

function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="text-danger font-body mt-1.5 text-sm">
      {children}
    </p>
  );
}

/**
 * The one volt button on the landing page lives here. Everything else in the
 * card stays neutral so "Log in" is the obvious next step.
 */
export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    login,
    undefined,
  );
  const [showPassword, setShowPassword] = useState(false);
  const errors = state?.errors;

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
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
        <div className="mb-2 flex items-baseline justify-between">
          <label htmlFor="password" className="type-label text-text-2">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-text-3 hover:text-text-1 font-body text-sm transition-colors duration-[120ms]"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          icon="lock"
          inputSize="lg"
          required
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

      <Checkbox name="remember" label="Keep me logged in" defaultChecked />

      {state?.message ? (
        <p
          role="status"
          className="bg-surface-2 text-text-2 font-body inset-hairline rounded-md px-3 py-2.5 text-sm"
        >
          {state.message}
        </p>
      ) : null}

      <Button type="submit" size="lg" fullWidth disabled={pending}>
        {pending ? "Logging in…" : "Log in"}
      </Button>

      <p className="text-text-3 font-body text-center text-sm">
        New to Savepoint?{" "}
        <Link
          href="/signup"
          className="text-text-1 font-medium underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
