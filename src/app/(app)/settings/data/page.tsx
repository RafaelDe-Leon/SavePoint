import type { Metadata } from "next";

import { ResetData } from "@/components/settings/account-forms";
import { Card, SettingsHeader } from "@/components/settings/panel";
import { buttonClassName, Icon } from "@/components/ui";

export const metadata: Metadata = { title: "Your data · Savepoint" };

export default function DataSettingsPage() {
  return (
    <>
      <SettingsHeader title="Your data" description="Take it with you, or start over." />
      <Card
        title="Download your data"
        description="Your library, journal, reviews, lists, follows, likes, profile and settings, as one JSON file."
        footer={
          <a href="/api/export" download className={buttonClassName({ variant: "secondary" })}>
            <Icon name="download" size={16} />
            Download JSON
          </a>
        }
      />
      <Card
        tone="danger"
        title="Reset all data"
        description="Puts everything back to the sample data. Download a copy first if you want to keep it."
        footer={<ResetData />}
      />
    </>
  );
}
