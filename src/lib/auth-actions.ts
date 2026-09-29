"use server";

import { redirect } from "next/navigation";

export type LoginField = "email" | "password";

export type LoginState =
  | {
      /** Per-field messages, shown under the matching input. */
      errors?: Partial<Record<LoginField, string>>;
      /** Form-level message, shown above the submit button. */
      message?: string;
      /** Echoed back so the email survives a failed attempt. */
      email?: string;
    }
  | undefined;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates on the server regardless of what the browser already checked —
 * `required` and `type="email"` are a convenience, not a guarantee.
 */
export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const errors: Partial<Record<LoginField, string>> = {};
  if (!email) errors.email = "Enter your email.";
  else if (!EMAIL.test(email)) errors.email = "That doesn't look like an email.";
  if (!password) errors.password = "Enter your password.";

  if (Object.keys(errors).length > 0) return { errors, email };

  // TODO: verify credentials with the auth provider and create a session
  // (`formData.get("remember")` sets its lifetime). Until then, any valid
  // input is let straight through to the fake signed-in home.
  redirect("/home");
}

export type SignupField = "username" | "email" | "password";

export type SignupState =
  | {
      errors?: Partial<Record<SignupField, string>>;
      message?: string;
      /** Echoed back so non-secret fields survive a failed attempt. */
      username?: string;
      email?: string;
    }
  | undefined;

const USERNAME = /^[a-z0-9_]{3,20}$/i;

export async function signup(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const errors: Partial<Record<SignupField, string>> = {};
  if (!USERNAME.test(username))
    errors.username = "3–20 letters, numbers or underscores.";
  if (!email) errors.email = "Enter your email.";
  else if (!EMAIL.test(email)) errors.email = "That doesn't look like an email.";
  if (password.length < 8) errors.password = "Use at least 8 characters.";

  if (Object.keys(errors).length > 0) return { errors, username, email };

  // TODO: create the account with the auth provider and start a session.
  // Until then, any valid input goes straight to the fake signed-in home.
  redirect("/home");
}
