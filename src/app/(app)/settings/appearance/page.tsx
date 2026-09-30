import type { Metadata } from "next";
import Link from "next/link";

import { ResetTabOrder } from "@/components/settings/account-forms";
import { Card, SettingsHeader } from "@/components/settings/panel";
import { AccentPicker } from "@/components/theme/accent-picker";
import { getLibraryTabOrder } from "@/lib/preferences";
import { SHELF_TABS } from "@/lib/sample-library";

export const metadata: Metadata = { title: "Appearance · Savepoint" };

export default async function AppearanceSettingsPage() {
  const order = await getLibraryTabOrder();
  const custom = order.join() !== Object.keys(SHELF_TABS).join();

  return (
    <>
      <SettingsHeader title="Appearance" description="How Savepoint looks and is laid out for you." />
      <Card
        title="Accent color"
        description="Drives the primary button, focus rings, the active tab and the Beaten status."
        note="Saved on this device."
      >
        <AccentPicker />
      </Card>
      <Card
        title="Library tab order"
        description={
          <>
            Currently{" "}
            <span className="text-text-2">{order.map((k) => SHELF_TABS[k].label).join(", ")}</span>.{" "}
            <Link href="/library" className="text-text-2 hover:text-text-1 underline underline-offset-2">
              Reorder them in your library
            </Link>
            .
          </>
        }
        note={custom ? "Custom order" : "Default order"}
        footer={<ResetTabOrder custom={custom} />}
      />
    </>
  );
}
