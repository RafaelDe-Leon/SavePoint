import type { Metadata } from "next";

import { NotificationSettings } from "@/components/settings/account-forms";
import { Card, SettingsHeader } from "@/components/settings/panel";
import { getProfile, getSettings } from "@/lib/profile";

export const metadata: Metadata = { title: "Notifications · Savepoint" };

export default async function NotificationSettingsPage() {
  const [settings, profile] = await Promise.all([getSettings(), getProfile()]);

  return (
    <>
      <SettingsHeader title="Notifications" description="Choose what lands in your inbox. Changes save as you flip them." />
      <Card title="Email" description={<>Sent to <span className="text-text-2">{profile.email}</span>.</>}>
        <NotificationSettings values={settings.notifications} />
      </Card>
    </>
  );
}
