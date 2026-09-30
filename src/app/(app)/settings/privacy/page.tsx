import type { Metadata } from "next";

import { PrivacyToggles, VisibilityPicker } from "@/components/settings/account-forms";
import { Card, SettingsHeader } from "@/components/settings/panel";
import { getSettings } from "@/lib/profile";

export const metadata: Metadata = { title: "Privacy · Savepoint" };

export default async function PrivacySettingsPage() {
  const settings = await getSettings();

  return (
    <>
      <SettingsHeader title="Privacy" description="Decide who sees your profile and what's on it. Changes save as you make them." />
      <Card title="Profile visibility" description="You always see everything on your own profile.">
        <VisibilityPicker value={settings.visibility} />
      </Card>
      <Card title="What others see" description="Applies whenever your profile is visible to someone.">
        <PrivacyToggles values={settings.privacy} />
      </Card>
    </>
  );
}
