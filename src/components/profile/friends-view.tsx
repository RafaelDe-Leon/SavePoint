"use client";

import { useOptimistic, useState, useTransition } from "react";

import { Empty } from "@/components/app/field";
import { useToast } from "@/components/app/use-toast";
import { Avatar, Button, Input, SegmentedControl } from "@/components/ui";
import { toggleFollow } from "@/lib/profile-actions";
import type { Person } from "@/lib/profile-shared";

const VIEWS = [
  { value: "following", label: "Following" },
  { value: "followers", label: "Followers" },
  { value: "find", label: "Find people" },
];

export function FriendsView({ people, following }: { people: Person[]; following: string[] }) {
  const { report } = useToast();
  const [view, setView] = useState("following");
  const [q, setQ] = useState("");
  const [, start] = useTransition();
  // The button flips at once; the server confirms with a toast.
  const [followed, setFollowed] = useOptimistic(following);

  const follow = (p: Person, on: boolean) =>
    start(async () => {
      setFollowed(on ? [...followed, p.username] : followed.filter((u) => u !== p.username));
      report(await toggleFollow(p.username, on));
    });

  const needle = q.trim().toLowerCase();
  const shown = people.filter((p) => {
    if (view === "following" && !followed.includes(p.username)) return false;
    if (view === "followers" && !p.followsYou) return false;
    return !needle || p.name.toLowerCase().includes(needle) || p.username.includes(needle);
  });

  const counts: Record<string, number> = {
    following: followed.length,
    followers: people.filter((p) => p.followsYou).length,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          aria-label="Show"
          value={view}
          onChange={setView}
          options={VIEWS.map((v) => ({ ...v, label: v.value in counts ? `${v.label} ${counts[v.value]}` : v.label }))}
        />
        <Input
          icon="search"
          inputSize="sm"
          type="search"
          aria-label="Filter people"
          placeholder="Filter by name"
          className="w-full sm:w-60"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {shown.length ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => {
            const on = followed.includes(p.username);
            return (
              <li key={p.username} className="bg-surface-1 inset-hairline flex items-center gap-3.5 rounded-lg p-4">
                <Avatar name={p.name} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="text-text-1 font-body truncate text-md font-semibold">{p.name}</p>
                  <p className="text-text-4 truncate font-mono text-xs">
                    @{p.username}
                    {p.followsYou ? " · follows you" : ""}
                  </p>
                  <p className="text-text-3 mt-1 font-mono text-xs">
                    {p.owned} owned · {p.beaten} beaten
                  </p>
                </div>
                <Button
                  variant={on ? "ghost" : "secondary"}
                  size="sm"
                  icon={on ? "user-check" : "user-plus"}
                  aria-pressed={on}
                  onClick={() => follow(p, !on)}
                >
                  {on ? "Following" : "Follow"}
                </Button>
              </li>
            );
          })}
        </ul>
      ) : (
        <Empty>
          {needle
            ? "Nobody matches that. Try another name."
            : view === "following"
              ? "You don't follow anyone yet. Find people to follow."
              : "Nobody here yet."}
        </Empty>
      )}
    </div>
  );
}
