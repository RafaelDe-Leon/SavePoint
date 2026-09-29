"use client";

import { useEffect, useState } from "react";

import {
  Button,
  FilterChip,
  Input,
  SegmentedControl,
  Select,
  Tabs,
} from "@/components/ui";
import type { Platform } from "@/lib/game";
import { TabOrderDialog } from "./tab-order-dialog";
import { useQueryState } from "./use-query-state";

type Option = { value: string; label: string };

/**
 * Option lists come in as props rather than being imported from the data
 * modules, which would pull the whole catalog into the client bundle.
 */
export interface LibraryToolbarProps {
  tab: string;
  systems: string[];
  q: string;
  sort: string;
  view: string;
  /** Tabs in the user's saved order. */
  tabOptions: (Option & { count: number })[];
  defaultTabOrder: string[];
  systemOptions: { id: string; label: string; platform: Platform; count: number }[];
  sortOptions: Option[];
}

export function LibraryToolbar({
  tab,
  systems,
  q,
  sort,
  view,
  tabOptions,
  defaultTabOrder,
  systemOptions,
  sortOptions,
}: LibraryToolbarProps) {
  const [orderOpen, setOrderOpen] = useState(false);
  const { set, pending } = useQueryState({
    tab: tab === "owned" ? undefined : tab,
    system: systems.join(",") || undefined,
    q: q || undefined,
    sort: sort === "added" ? undefined : sort,
    view: view === "shelves" ? undefined : view,
  });

  // Typing filters as you go, debounced so each keystroke isn't a navigation.
  const [text, setText] = useState(q);
  // Follow the URL when it changes from outside the field (e.g. the nav's
  // Library link), so the filter resets instead of being re-applied.
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    setPrevQ(q);
    setText(q);
  }

  useEffect(() => {
    if (text === q) return;
    const t = setTimeout(() => set({ q: text }), 200);
    return () => clearTimeout(t);
  }, [text, q, set]);

  const toggleSystem = (id: string) =>
    set({
      system: systems.includes(id)
        ? systems.filter((s) => s !== id)
        : [...systems, id],
    });

  return (
    <div className="flex flex-col gap-5" aria-busy={pending}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="type-h1 text-text-1">Library</h1>
        <Input
          icon="search"
          placeholder="Filter your shelf"
          aria-label="Filter your shelf"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full sm:w-72"
        />
      </div>

      {/* The rule runs under the tabs and the edit button alike. */}
      <div className="flex items-center gap-3 shadow-[inset_0_-1px_0_var(--border-1)]">
        <Tabs
          value={tab}
          onChange={(v) => set({ tab: v === "owned" ? undefined : v })}
          items={tabOptions}
          className="min-w-0 flex-1 shadow-none"
        />
        <Button
          variant="ghost"
          size="sm"
          icon="arrow-up-down"
          className="mb-1 shrink-0"
          onClick={() => setOrderOpen(true)}
        >
          <span className="max-sm:sr-only">Edit status order</span>
        </Button>
      </div>

      <TabOrderDialog
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        tabs={tabOptions}
        defaultOrder={defaultTabOrder}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {systemOptions.map((s) => (
            <FilterChip
              key={s.id}
              label={s.label}
              color={`var(--plat-${s.platform})`}
              count={s.count}
              selected={systems.includes(s.id)}
              removable
              onClick={() => toggleSystem(s.id)}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <Select
            selectSize="sm"
            icon="arrow-up-down"
            aria-label="Sort"
            value={sort}
            onChange={(e) => set({ sort: e.target.value === "added" ? undefined : e.target.value })}
            options={sortOptions}
          />
          <SegmentedControl
            size="sm"
            aria-label="View"
            value={view}
            onChange={(v) => set({ view: v === "shelves" ? undefined : v })}
            options={[
              { value: "shelves", icon: "library", label: "Shelves" },
              { value: "grid", icon: "layout-grid" },
              { value: "list", icon: "list" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
