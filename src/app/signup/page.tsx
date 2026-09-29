import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "Create an account · Savepoint" };

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Free. Start with the games you already own."
      panelTitle="Of the games you own, which have you beaten?"
    >
      <SignupForm />
    </AuthShell>
  );
}
