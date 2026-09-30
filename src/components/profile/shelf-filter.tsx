"use client";

import { useQueryState } from "@/components/app/use-query-state";
import { FilterChip, Select } from "@/components/ui";

/** Status chips and a sort for the profile's Games tab, kept in the URL. */
export function ShelfFilter({
  tab,
  sort,
  tabs,
  sorts,
}: {
  tab: string;
  sort: string;
  tabs: { value: string; label: string; count: number }[];
  sorts: { value: string; label: string }[];
}) {
  const { set, pending } = useQueryState({ tab, sort });

  return (
    <div className="flex flex-wrap items-center justify-between gap-3" aria-busy={pending}>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Status">
        {tabs.map((t) => (
          <FilterChip
            key={t.value}
            label={t.label}
            count={t.count}
            selected={t.value === tab}
            onClick={() => set({ tab: t.value === "owned" ? undefined : t.value })}
          />
        ))}
      </div>
      <Select
        aria-label="Sort"
        icon="arrow-up-down"
        selectSize="sm"
        value={sort}
        options={sorts}
        onChange={(e) => set({ sort: e.target.value === "added" ? undefined : e.target.value })}
      />
    </div>
  );
}
