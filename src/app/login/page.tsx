import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Log in · Savepoint" };

export default function LoginPage() {
  return (
    <AuthShell
      title="Log in"
      subtitle="Pick up where you left off."
      panelTitle="Your shelf is right where you left it."
    >
      <LoginForm />
    </AuthShell>
  );
}
