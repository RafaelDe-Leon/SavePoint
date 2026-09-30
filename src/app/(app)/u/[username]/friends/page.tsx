import type { Metadata } from "next";

import { FriendsView } from "@/components/profile/friends-view";
import { getFollowing } from "@/lib/profile";
import { PEOPLE } from "@/lib/profile-shared";

export const metadata: Metadata = { title: "Friends · Savepoint" };

export default async function FriendsPage() {
  const following = await getFollowing();
  return <FriendsView people={PEOPLE} following={following.map((f) => f.username)} />;
}
