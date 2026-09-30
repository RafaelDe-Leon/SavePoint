"use client";

import { useEffect, useId, useRef, useState } from "react";

import { GameCover, Input } from "@/components/ui";
import { cn } from "@/lib/cn";

export interface PickedGame {
  slug: string;
  title: string;
  year: number;
  tint: string;
}

/**
 * Catalog typeahead that hands the chosen game back instead of navigating —
 * for adding games to lists and favorites. Same endpoint and ARIA combobox
 * pattern as NavSearch.
 */
export function GamePicker({
  onPick,
  exclude = [],
  placeholder = "Search the catalog",
  disabled,
  className,
}: {
  onPick: (game: PickedGame) => void;
  /** Slugs already chosen; shown but not pickable. */
  exclude?: string[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<PickedGame[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const query = q.trim();
    if (!query) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/games/search?q=${encodeURIComponent(query)}&limit=8`, {
          signal: ctrl.signal,
        });
        const data: { results: PickedGame[] } = await res.json();
        setResults(data.results);
        setActive(-1);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setResults([]);
      }
    }, 150);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  const shown = q.trim() ? results : [];
  const showList = open && shown.length > 0;

  const pick = (g: PickedGame) => {
    if (exclude.includes(g.slug)) return;
    onPick(g);
    setQ("");
    setResults([]);
    setActive(-1);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (shown.length ? (i + 1) % shown.length : -1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (shown.length ? (i <= 0 ? shown.length - 1 : i - 1) : -1));
    } else if (e.key === "Enter") {
      // Never submit the surrounding form from the search box.
      e.preventDefault();
      if (active >= 0 && shown[active]) pick(shown[active]);
    } else if (e.key === "Escape" && showList) {
      // Keep Escape from also closing a surrounding dialog.
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
    }
  };

  return (
    <div
      className={cn("relative", className)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <Input
        ref={inputRef}
        icon="search"
        type="search"
        placeholder={placeholder}
        role="combobox"
        aria-label={placeholder}
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        disabled={disabled}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />

      {showList ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Games"
          className="bg-surface-3 shadow-overlay absolute top-[calc(100%+6px)] right-0 left-0 z-40 max-h-80 overflow-y-auto rounded-lg p-1.5"
        >
          {shown.map((g, i) => {
            const taken = exclude.includes(g.slug);
            return (
              <li
                key={g.slug}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                aria-disabled={taken || undefined}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(g);
                }}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-2 py-1.5",
                  taken ? "cursor-default opacity-50" : "cursor-pointer",
                  i === active && !taken && "bg-surface-5",
                )}
              >
                <GameCover title="" tint={g.tint} width={24} />
                <span className="text-text-1 font-body min-w-0 flex-1 truncate text-md font-medium">
                  {g.title}
                </span>
                <span className="text-text-4 font-mono text-xs">{taken ? "Added" : g.year}</span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
