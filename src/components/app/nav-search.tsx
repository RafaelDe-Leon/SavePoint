"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { GameCover, Input } from "@/components/ui";
import { cn } from "@/lib/cn";
import { PLATFORM_META, type Platform } from "@/lib/game";

interface Suggestion {
  slug: string;
  title: string;
  year: number;
  tint: string;
  platforms: Platform[];
}

/**
 * Typeahead over /api/games/search, following the ARIA combobox pattern:
 * focus stays in the input and arrow keys move `aria-activedescendant`.
 *
 * Enter opens the highlighted game, or the full results page when nothing is
 * highlighted. `/` focuses the field from anywhere that isn't a text input.
 */
export function NavSearch({ className }: { className?: string }) {
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [q, setQ] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);

  // The nav outlives page changes, so clear the field whenever you land on a
  // different page — search starts fresh everywhere.
  const pathname = usePathname();
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setQ("");
    setResults([]);
    setOpen(false);
    setActive(-1);
  }

  // Debounced fetch; each new query aborts the one still in flight so a slow
  // response can't overwrite a newer one.
  useEffect(() => {
    const query = q.trim();
    if (!query) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/games/search?q=${encodeURIComponent(query)}&limit=6`, {
          signal: ctrl.signal,
        });
        const data: { results: Suggestion[] } = await res.json();
        setResults(data.results);
        setActive(-1);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setResults([]);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 150);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName);
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const hasQuery = q.trim().length > 0;
  const showList = open && hasQuery;
  const shown = hasQuery ? results : [];

  const close = () => {
    setOpen(false);
    setActive(-1);
  };

  const go = (href: string) => {
    close();
    setQ("");
    inputRef.current?.blur();
    router.push(href);
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
      e.preventDefault();
      if (active >= 0 && shown[active]) go(`/games/${shown[active].slug}`);
      else if (hasQuery) go(`/games?q=${encodeURIComponent(q.trim())}`);
    } else if (e.key === "Escape") {
      if (showList) close();
      else inputRef.current?.blur();
    }
  };

  return (
    <div
      className={cn("relative", className)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) close();
      }}
    >
      <Input
        ref={inputRef}
        icon="search"
        inputSize="sm"
        type="search"
        placeholder="Search games"
        role="combobox"
        aria-label="Search games"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        trailing={
          <kbd className="text-text-4 border-border-2 rounded-xs border px-1 font-mono text-[11px] leading-4">
            /
          </kbd>
        }
      />

      {showList ? (
        <div className="bg-surface-2 shadow-overlay absolute top-[calc(100%+6px)] right-0 z-40 w-[340px] overflow-hidden rounded-lg p-1.5">
          <ul id={listId} role="listbox" aria-label="Games">
            {shown.map((g, i) => (
              <li
                key={g.slug}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                // mousedown, not click: fires before the input's blur closes the list.
                onMouseDown={(e) => {
                  e.preventDefault();
                  go(`/games/${g.slug}`);
                }}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5",
                  i === active && "bg-surface-4",
                )}
              >
                <GameCover title="" tint={g.tint} width={28} />
                <div className="min-w-0">
                  <p className="text-text-1 font-body truncate text-md font-semibold">{g.title}</p>
                  <p className="text-text-4 truncate font-mono text-xs">
                    {g.year} · {g.platforms.map((p) => PLATFORM_META[p].label).join(", ")}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {!loading && shown.length === 0 ? (
            <p className="text-text-3 font-body px-2 py-3 text-sm">
              No games match “{q.trim()}”.
            </p>
          ) : null}

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              go(`/games?q=${encodeURIComponent(q.trim())}`);
            }}
            className="text-text-3 hover:text-text-1 hover:bg-surface-3 font-body mt-1 flex w-full items-center justify-between rounded-md px-2 py-2 text-sm"
          >
            <span>
              See all results for <span className="text-text-1">“{q.trim()}”</span>
            </span>
            <span className="font-mono text-xs">↵</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
