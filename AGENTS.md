<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Savepoint

A game backlog tracker built around ownership. Every game is tied to the system
you own it on; the product answers "of the games I own, which have I beaten?"

## Design system

The source of truth is the **Savepoint Design System** project on claude.ai
(`projectId a049f091-8c51-4449-a6f3-774cfab3668e`), readable with the
`DesignSync` tool. `src/` is a port of it, not a copy — read the remote
`readme.md` before making design decisions.

### Tokens — `src/app/globals.css`

Every custom property is declared in **exactly one** place:

| Where | Owns |
| --- | --- |
| `:root` | color ramp, composite `--type-*` roles, layout, `--dur-*` |
| `@theme inline` | color aliases only (`--color-accent` → `var(--accent)`) |
| `@theme` | fonts, sizes, tracking, leading, radii, shadows, easing |

**Never write `--x: var(--x)` inside a `@theme` block.** It is a self-reference,
invalid at computed-value time, and the utility silently disappears from the
build. This is why fonts/shadows/tracking live in a non-inline `@theme` — those
names are owned by Tailwind, which emits them to `:root` for plain CSS anyway.

Tailwind's default color, font-size and radius scales are reset with
`--color-*: initial` etc. — Savepoint's ramp *is* the palette. The default
spacing scale is kept deliberately: the design system's 2/4/6/8/12/16/20/24/32/
40/56/80 scale maps exactly onto `p-0.5 … p-20`.

Composite type roles are utilities, not theme keys, because CSS `font:`
shorthand can't be one: `type-display`, `type-h1..h3`, `type-body`,
`type-body-lg`, `type-label`, `type-caption`, `type-overline`, `type-stat`,
`type-mono`. Plus `inset-hairline` for the card treatment.

### Accent theming

The accent is user-changeable at runtime and persists in `localStorage`.

**To add a color, add one line to `ACCENTS` in `src/lib/accents.ts`:**

```ts
teal: accent("Teal", "#2dd4bf", "dark"),
```

That is the whole change. No CSS edits, no new utilities, no picker changes —
`AccentPicker` maps over the registry and the no-flash script serializes it.
The hover/press/deep steps are derived by mixing in oklch; the third argument
says whether text *on top of* the accent should be dark or light ink. Pass an
explicit ramp instead (see `volt`) only when the derived steps look wrong.

How it hangs together:

| Piece | Role |
| --- | --- |
| `lib/accents.ts` | registry; the single place a color is defined |
| `globals.css` | `--accent-300/400/500/600` + `--accent-contrast` → everything else derives from them |
| `theme/accent-script.tsx` | blocking inline script; applies the stored accent before first paint |
| `theme/accent-provider.tsx` | `useSyncExternalStore` over `localStorage`, with cross-tab sync |
| `theme/accent-picker.tsx` | swatch row |

A theme overrides exactly five custom properties. `--accent`,
`--accent-hover`, `--accent-press`, `--on-accent`, `--accent-ring`,
`--accent-soft` and `--status-beaten` all derive from those, so components
never need to know a theme exists — they just read `--accent`.

**`--status-beaten` follows the accent** by design: the design system defines
Beaten *as* the accent color. The other six status colors are fixed.

Don't reintroduce a hardcoded volt value anywhere except the `--volt-*` ramp
and the `volt` registry entry. `--accent-ring` and `--accent-soft` use
`color-mix`, so they track whatever accent is active; lightningcss emits an
opaque fallback behind `@supports` for browsers without `color-mix`.

### Rules that are easy to get wrong

- **Dark only.** There is no light theme. Don't add `prefers-color-scheme`.
- **One volt button per view.** `--accent` is also the focus ring, the active
  nav underline, and the "Beaten" status. `Button variant="primary"` is loud
  on purpose; `FilterChip` inverts to `--text-1` when selected rather than
  going volt, for exactly this reason.
- **Status is never color alone** — always a label or glyph too.
- **Platform color** appears only as the small swatch and as progress-bar fill.
- **Cards** use `inset-hairline`, not a border, and have no drop shadow.
  Shadows are only for covers (`shadow-cover`) and overlays (`shadow-overlay`).
- **Covers** are strict 3:4 at `rounded-cover` (6px).
- **Blur** appears in exactly two places: the sticky nav (14px) and the dialog
  scrim (8px).
- **Motion** is 120/200/320ms on `ease-out`. `ease-spring` is only for toggles
  and entering toasts. No looping animation.
- **Copy**: sentence case, second person, no emoji, no exclamation marks.
  Confirmations are past tense ("Marked Celeste as beaten"). Counts, hours and
  years use the mono face.

### Components — `src/components/ui/`

23 components, barrel-exported from `src/components/ui/index.ts`. Domain
vocabulary (`GameStatus`, `STATUS_META`, `Platform`, `PLATFORM_META`) lives in
`src/lib/game.ts` — use it rather than re-typing status strings.

Ports deviate from the design system's reference `.jsx` in three deliberate
ways, all documented inline:

1. **No `useState` for hover/focus.** The reference tracks these in JS; the port
   uses CSS `hover:` / `focus-within:` / `peer-*`, so most components stay
   Server Components.
2. **Real form controls.** `Checkbox` and `Switch` wrap an actual
   `<input type="checkbox">` instead of a `role`-annotated `<span>`, so
   keyboard, form participation and AT semantics come from the platform.
3. **`Dialog` is a native `<dialog>`** — focus trap, Escape, inerting and
   top-layer stacking for free.

Icons are `lucide-react` through a typed registry in `icon.tsx` (the design
system uses the `lucide-static` CDN icon font, which doesn't suit a bundler).
The kebab-case `<Icon name="gamepad-2" />` API is preserved. **To add a glyph,
import it and add one line to `ICONS`** — `IconName` is derived from that object,
so an unregistered name is a type error rather than a blank square.

`/styleguide` renders every component and variant. Add to it when you add a
component.
