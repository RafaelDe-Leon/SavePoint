import type { Metadata } from "next";

import { PasswordForm } from "@/components/settings/account-forms";
import { SettingsHeader } from "@/components/settings/panel";

export const metadata: Metadata = { title: "Security · Savepoint" };

export default function SecuritySettingsPage() {
  return (
    <>
      <SettingsHeader title="Security" description="Keep your account yours." />
      <PasswordForm />
    </>
  );
}
