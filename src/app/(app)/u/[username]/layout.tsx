import { notFound } from "next/navigation";
import Link from "next/link";

import { CopyLinkButton } from "@/components/profile/copy-link-button";
import { ProfileNav } from "@/components/profile/profile-nav";
import { Avatar, buttonClassName, Icon } from "@/components/ui";
import {
  getFollowing,
  getJournal,
  getLikes,
  getLists,
  getProfile,
  getReviews,
  getSettings,
} from "@/lib/profile";
import { VISIBILITY } from "@/lib/profile-shared";
import { getShelf, uniqueGames } from "@/lib/sample-library";

const joinedFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Profile shell: who you are, and a tab per page under `/u/<username>`.
 * There's only one account until auth exists, so any other username 404s.
 */
export default async function ProfileLayout({ children, params }: LayoutProps<"/u/[username]">) {
  const { username } = await params;
  const profile = await getProfile();
  if (username.toLowerCase() !== profile.username) notFound();

  const [shelf, journal, reviews, lists, following, likes, settings] = await Promise.all([
    getShelf(),
    getJournal(),
    getReviews(),
    getLists(),
    getFollowing(),
    getLikes(),
    getSettings(),
  ]);
  const base = `/u/${profile.username}`;

  return (
    <main className="mx-auto w-full max-w-page px-4 pt-8 pb-20 sm:px-8">
      <header className="flex items-center gap-5 sm:gap-6">
        <Avatar name={profile.displayName} src={profile.avatarUrl} size={88} className="shadow-cover" />
        <div className="flex min-w-0 flex-col gap-3">
          <div>
            <h1 className="type-h1 text-text-1 truncate">{profile.displayName}</h1>
            <p className="text-text-3 mt-1 truncate font-mono text-sm">
              @{profile.username} · joined {joinedFormat.format(new Date(profile.joined))}
              {settings.visibility !== "public" ? (
                <Link href="/settings/privacy" className="hover:text-text-1 ml-2 inline-flex items-center gap-1 align-[-2px]">
                  <Icon name="lock" size={13} />
                  {VISIBILITY[settings.visibility].label}
                </Link>
              ) : null}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/settings" className={buttonClassName({ variant: "secondary", size: "sm" })}>
              <Icon name="pencil" size={14} />
              Edit profile
            </Link>
            <CopyLinkButton path={base} />
          </div>
        </div>
      </header>

      <div className="mt-8">
        <ProfileNav
          base={base}
          counts={{
            games: uniqueGames(shelf).length,
            journal: journal.length,
            reviews: reviews.length,
            lists: lists.length,
            friends: following.length,
            likes: likes.length,
          }}
        />
      </div>

      <div className="pt-8">{children}</div>
    </main>
  );
}
