"use client";

import { useEffect, useState } from "react";

import { FilterChip, Input, Select } from "@/components/ui";
import { PLATFORM_META, type Platform } from "@/lib/game";
import { useQueryState } from "./use-query-state";

/** "Other" isn't a browsable family, so it doesn't get a chip. */
const FAMILIES: Platform[] = ["playstation", "xbox", "nintendo", "pc", "mobile", "retro"];

export interface GamesToolbarProps {
  q: string;
  platforms: Platform[];
  genre: string;
  sort: string;
  genres: string[];
  /** Passed in so the catalog module stays out of the client bundle. */
  sortOptions: { value: string; label: string }[];
}

export function GamesToolbar({
  q,
  platforms,
  genre,
  sort,
  genres,
  sortOptions,
}: GamesToolbarProps) {
  const { set, pending } = useQueryState({
    q: q || undefined,
    platform: platforms.join(",") || undefined,
    genre: genre || undefined,
    sort: sort === "popular" ? undefined : sort,
  });

  const [text, setText] = useState(q);
  // Keep the field in sync when the query changes from elsewhere (nav search).
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    setPrevQ(q);
    setText(q);
  }

  useEffect(() => {
    if (text === q) return;
    const t = setTimeout(() => set({ q: text }), 250);
    return () => clearTimeout(t);
  }, [text, q, set]);

  const toggle = (p: Platform) =>
    set({
      platform: platforms.includes(p)
        ? platforms.filter((x) => x !== p)
        : [...platforms, p],
    });

  return (
    <div className="flex flex-col gap-4" aria-busy={pending}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          set({ q: text });
        }}
      >
        <Input
          icon="search"
          inputSize="lg"
          type="search"
          name="q"
          placeholder="Search by title or developer"
          aria-label="Search games"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </form>

      <div className="border-border-1 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div className="flex flex-wrap gap-2">
          {FAMILIES.map((p) => (
            <FilterChip
              key={p}
              label={PLATFORM_META[p].label}
              color={PLATFORM_META[p].color}
              selected={platforms.includes(p)}
              removable
              onClick={() => toggle(p)}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <Select
            selectSize="sm"
            icon="layers"
            aria-label="Genre"
            value={genre}
            onChange={(e) => set({ genre: e.target.value })}
            options={[{ value: "", label: "All genres" }, ...genres]}
          />
          <Select
            selectSize="sm"
            icon="arrow-up-down"
            aria-label="Sort"
            value={sort}
            onChange={(e) => set({ sort: e.target.value === "popular" ? undefined : e.target.value })}
            options={sortOptions}
          />
        </div>
      </div>
    </div>
  );
}
