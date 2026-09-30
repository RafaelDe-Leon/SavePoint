import type { Metadata } from "next";

import { SettingsHeader } from "@/components/settings/panel";
import { AvatarForm, EmailForm, FavoritesForm, ProfileForm } from "@/components/settings/profile-forms";
import { getGamesBySlugs } from "@/lib/catalog/queries";
import { getProfile } from "@/lib/profile";

export const metadata: Metadata = { title: "Profile settings · Savepoint" };

export default async function ProfileSettingsPage() {
  const profile = await getProfile();
  const favorites = await getGamesBySlugs(profile.favorites);

  return (
    <>
      <SettingsHeader title="Profile" description="How you sign in, and what people see on your profile." />
      <EmailForm email={profile.email} />
      <AvatarForm name={profile.displayName} src={profile.avatarUrl} />
      <ProfileForm profile={profile} />
      <FavoritesForm favorites={favorites.map(({ slug, title, year, tint }) => ({ slug, title, year, tint }))} />
    </>
  );
}
