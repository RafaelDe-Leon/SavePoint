import Link from "next/link";

import { SettingsNav } from "@/components/settings/settings-nav";
import { Icon } from "@/components/ui";
import { getProfile } from "@/lib/profile";

/** Settings shell: sidebar of sections on the left, the chosen one on the right. */
export default async function SettingsLayout({ children }: LayoutProps<"/settings">) {
  const profile = await getProfile();

  return (
    <main className="mx-auto w-full max-w-page px-4 pt-8 pb-20 sm:px-8">
      <Link
        href={`/u/${profile.username}`}
        className="type-label text-text-2 hover:text-text-1 mb-4 inline-flex items-center gap-1.5 transition-colors duration-[120ms]"
      >
        <Icon name="chevron-left" size={14} />
        Your profile
      </Link>
      <h1 className="type-h1 text-text-1 mb-8">Settings</h1>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
        <SettingsNav />
        <div className="flex max-w-3xl min-w-0 flex-col gap-6">{children}</div>
      </div>
    </main>
  );
}
