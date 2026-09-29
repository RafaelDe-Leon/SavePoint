# Savepoint

A game backlog tracker built around ownership. Every game is tied to the system
you own it on, and the question the product answers is: *of the games I own,
which have I beaten?*

Next.js 16 · React 19 · TypeScript · Tailwind v4 · App Router.

## Getting started

```bash
npm install
npm run dev
```

- `/` — landing
- `/styleguide` — every component and variant, rendered from the live tokens

## Layout

```
src/
  app/
    globals.css               design tokens: :root + @theme + type utilities
    layout.tsx                Bricolage Grotesque / Onest / Geist Mono
    page.tsx
    (styleguide)/styleguide/  living component reference
  components/
    ui/                       21 components, barrel-exported from index.ts
    theme/                    accent theming: provider, no-flash script, picker
  lib/
    cn.ts                     clsx + tailwind-merge
    game.ts                   GameStatus / Platform vocabulary and metadata
    accents.ts                accent registry — add a color here
```

## Changing the accent

The accent is user-selectable and persists per browser. Adding a color to
choose from is one line in `src/lib/accents.ts`:

```ts
teal: accent("Teal", "#2dd4bf", "dark"),
```

No CSS or component changes — the picker, the no-flash script, and every
component that reads `--accent` pick it up automatically. See
[AGENTS.md](./AGENTS.md#accent-theming) for how the layering works.

## Design system

The source of truth is the **Savepoint Design System** project on claude.ai.
`src/` is a port of it. See [AGENTS.md](./AGENTS.md) for the token ownership
rules, the constraints that are easy to get wrong (dark only; one volt button
per view; status is never color alone), and where the port deliberately
diverges from the reference implementation.

Re-reading the remote system requires design-system authorization — run
`/design-login` in Claude Code, then the `DesignSync` tool can list and read it.

## Scripts

```bash
npm run dev      # dev server
npm run build    # production build
npm run lint     # eslint
npx tsc --noEmit # typecheck
```
