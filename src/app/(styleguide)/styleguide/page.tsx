"use client";

import { useState } from "react";

import {
  Avatar,
  Button,
  Checkbox,
  Dialog,
  FilterChip,
  GameCard,
  GameCover,
  IconButton,
  Input,
  PlatformTag,
  ProgressBar,
  Rating,
  SegmentedControl,
  Select,
  Stat,
  StatusBadge,
  Switch,
  Tabs,
  Toast,
  Toggletip,
  Tooltip,
} from "@/components/ui";
import { AccentPicker } from "@/components/theme/accent-picker";
import {
  PLATFORM_META,
  PLATFORM_ORDER,
  STATUS_META,
  STATUS_ORDER,
} from "@/lib/game";

/* -------------------------------------------------------------------------- */

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-border-1 border-t py-10">
      <div className="mb-6">
        <h2 className="type-h3 text-text-1">{title}</h2>
        {note ? <p className="text-text-3 mt-1 text-sm">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Row({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-2 last:mb-0">
      {label ? <span className="type-overline text-text-4">{label}</span> : null}
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

const GAMES = [
  {
    title: "Celeste",
    year: 2018,
    tint: "oklch(0.42 0.11 265)",
    status: "beaten" as const,
    platform: "nintendo" as const,
    platformLabel: "Switch",
    format: "digital" as const,
    rating: 4.5,
    hours: 24,
  },
  {
    title: "Elden Ring",
    year: 2022,
    tint: "oklch(0.38 0.07 75)",
    status: "playing" as const,
    platform: "playstation" as const,
    platformLabel: "PS5",
    format: "physical" as const,
    rating: 5,
    hours: 96,
  },
  {
    title: "Balatro",
    year: 2024,
    tint: "oklch(0.40 0.13 25)",
    status: "completed" as const,
    platform: "pc" as const,
    platformLabel: "Steam Deck",
    format: "digital" as const,
    rating: 4,
    hours: 61,
  },
  {
    title: "Hollow Knight: Silksong",
    year: 2025,
    tint: "oklch(0.35 0.09 200)",
    status: "wishlist" as const,
    platform: "nintendo" as const,
    platformLabel: "Switch 2",
  },
];

export default function StyleguidePage() {
  const [rating, setRating] = useState(3.5);
  const [view, setView] = useState("grid");
  const [tab, setTab] = useState("owned");
  const [chips, setChips] = useState<string[]>(["beaten"]);
  const [checked, setChecked] = useState(true);
  const [switched, setSwitched] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const toggleChip = (v: string) =>
    setChips((c) => (c.includes(v) ? c.filter((x) => x !== v) : [...c, v]));

  return (
    <main className="mx-auto w-full max-w-page px-8 py-14">
      <header className="pb-10">
        <p className="type-overline text-accent mb-3">Design system</p>
        <h1 className="type-h1 text-text-1">savepoint.</h1>
        <p className="text-text-3 mt-3 max-w-prose text-lg">
          Every component and variant, rendered from the same tokens the app
          uses. 21 components across seven groups.
        </p>
      </header>

      {/* ---------------------------------------------------------------- */}
      <Section
        title="Accent theme"
        note="One accent drives the primary action, focus rings, selection, the active nav underline, and the Beaten status. Pick one — it persists."
      >
        <Row label="Choose">
          <AccentPicker />
        </Row>
        <Row label="Everything below follows it">
          <Button icon="check">Mark as beaten</Button>
          <Button variant="secondary">Secondary is unaffected</Button>
          <StatusBadge status="beaten" />
          <StatusBadge status="beaten" variant="solid" />
          <FilterChip label="Focus me with Tab" />
          <div className="w-56">
            <ProgressBar label="Beaten" value={31} max={57} showValue />
          </div>
        </Row>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section title="Color" note="Dark only. One accent; box art carries the rest.">
        <Row label="Surfaces">
          {["--bg-app", "--surface-1", "--surface-2", "--surface-3", "--surface-4", "--surface-5"].map(
            (t) => (
              <div key={t} className="flex flex-col gap-1.5">
                <div
                  className="size-16 rounded-md shadow-[inset_0_0_0_1px_var(--border-2)]"
                  style={{ background: `var(${t})` }}
                />
                <span className="text-text-4 font-mono text-[11px]">
                  {t.replace("--", "")}
                </span>
              </div>
            ),
          )}
        </Row>

        <Row label="Accent">
          {["--volt-300", "--volt-400", "--volt-500", "--volt-600"].map((t) => (
            <div key={t} className="flex flex-col gap-1.5">
              <div
                className="size-16 rounded-md"
                style={{ background: `var(${t})` }}
              />
              <span className="text-text-4 font-mono text-[11px]">
                {t.replace("--", "")}
              </span>
            </div>
          ))}
        </Row>

        <Row label="Status">
          {STATUS_ORDER.map((s) => (
            <div key={s} className="flex flex-col gap-1.5">
              <div
                className="size-16 rounded-md"
                style={{ background: STATUS_META[s].color }}
              />
              <span className="text-text-4 font-mono text-[11px]">{s}</span>
            </div>
          ))}
        </Row>

        <Row label="Platform">
          {PLATFORM_ORDER.map((p) => (
            <div key={p} className="flex flex-col gap-1.5">
              <div
                className="size-16 rounded-md"
                style={{ background: PLATFORM_META[p].color }}
              />
              <span className="text-text-4 font-mono text-[11px]">{p}</span>
            </div>
          ))}
        </Row>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section title="Type" note="Bricolage Grotesque · Onest · Geist Mono.">
        <div className="flex flex-col gap-5">
          <div className="type-display text-text-1">Display 64</div>
          <div className="type-h1 text-text-1">Heading 1 · 36</div>
          <div className="type-h2 text-text-1">Heading 2 · 22</div>
          <div className="type-h3 text-text-1">Heading 3 · 18</div>
          <div className="type-body-lg text-text-2">
            Body large · 16. Of the games you own, which have you beaten?
          </div>
          <div className="type-body text-text-2">
            Body · 14. Ownership is the primary axis — every game on your shelf
            is tied to the system you own it on.
          </div>
          <div className="type-label text-text-2">Label · 13</div>
          <div className="type-caption text-text-3">Caption · 12</div>
          <div className="type-overline text-text-4">Overline · 11 mono</div>
          <div className="type-stat text-text-1">248</div>
          <div className="type-mono text-text-2">57 on Switch · 31 beaten</div>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section title="Button" note="At most one primary per view.">
        <Row label="Variants">
          <Button variant="primary">Log a game</Button>
          <Button variant="secondary">Add to shelf</Button>
          <Button variant="ghost">Skip</Button>
          <Button variant="danger">Remove</Button>
        </Row>
        <Row label="Sizes">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </Row>
        <Row label="With icons">
          <Button icon="plus">Log a game</Button>
          <Button variant="secondary" iconRight="chevron-right">
            All games
          </Button>
          <Button variant="ghost" icon="heart">
            Favorite
          </Button>
        </Row>
        <Row label="States">
          <Button disabled>Disabled</Button>
          <Button variant="secondary" disabled>
            Disabled
          </Button>
        </Row>
        <Row label="Full width">
          <div className="w-80">
            <Button fullWidth icon="check">
              Mark as beaten
            </Button>
          </div>
        </Row>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section title="IconButton">
        <Row label="Ghost / secondary / active">
          <IconButton icon="search" label="Search" />
          <IconButton icon="bell" label="Notifications" />
          <IconButton icon="settings" label="Settings" variant="secondary" />
          <IconButton icon="layout-grid" label="Grid view" active />
          <IconButton icon="list" label="List view" />
          <IconButton icon="trash-2" label="Delete" disabled />
        </Row>
        <Row label="Sizes">
          <IconButton icon="plus" label="Add" size="sm" variant="secondary" />
          <IconButton icon="plus" label="Add" size="md" variant="secondary" />
          <IconButton icon="plus" label="Add" size="lg" variant="secondary" />
        </Row>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section title="StatusBadge" note="Never color alone — always a label.">
        <Row label="Soft">
          {STATUS_ORDER.map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
        </Row>
        <Row label="Solid">
          {STATUS_ORDER.map((s) => (
            <StatusBadge key={s} status={s} variant="solid" />
          ))}
        </Row>
        <Row label="Small / no icon">
          {STATUS_ORDER.slice(0, 4).map((s) => (
            <StatusBadge key={s} status={s} size="sm" />
          ))}
          <StatusBadge status="beaten" showIcon={false} />
        </Row>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section title="PlatformTag">
        <Row label="Families">
          {PLATFORM_ORDER.map((p) => (
            <PlatformTag key={p} platform={p} />
          ))}
        </Row>
        <Row label="Specific systems, with format">
          <PlatformTag platform="nintendo" label="Switch" format="physical" />
          <PlatformTag platform="playstation" label="PS5" format="digital" />
          <PlatformTag platform="pc" label="Steam Deck" format="digital" size="sm" />
          <PlatformTag platform="retro" label="SNES" format="physical" size="sm" />
        </Row>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section title="Rating" note="Lucide stars at half-star precision.">
        <Row label="Read only">
          <Rating value={4.5} />
          <Rating value={3} showValue />
          <Rating value={0} showValue />
          <Rating value={5} size={20} />
        </Row>
        <Row label="Interactive">
          <Rating value={rating} onChange={setRating} size={22} showValue />
        </Row>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section title="GameCover" note="Strict 3:4. Status as a corner marker.">
        <Row>
          {GAMES.map((g) => (
            <GameCover
              key={g.title}
              title={g.title}
              tint={g.tint}
              status={g.status}
              dimmed={g.status === "wishlist"}
              width={116}
              onClick={() => {}}
            />
          ))}
          <GameCover title="No status" tint="oklch(0.36 0.05 320)" width={116} />
        </Row>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section title="GameCard" note="The shelf unit.">
        <Row>
          {GAMES.map((g) => (
            <GameCard key={g.title} {...g} onClick={() => {}} />
          ))}
        </Row>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section title="Input">
        <div className="flex max-w-md flex-col gap-3">
          <Input placeholder="Search games" icon="search" />
          <Input placeholder="Large" inputSize="lg" icon="search" />
          <Input placeholder="Small" inputSize="sm" />
          <Input defaultValue="Invalid value" invalid />
          <Input placeholder="Disabled" disabled />
          <Input
            placeholder="With trailing"
            icon="search"
            trailing={
              <kbd className="text-text-4 border-border-2 rounded-xs border px-1.5 py-0.5 font-mono text-[11px]">
                /
              </kbd>
            }
          />
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section title="Select">
        <Row>
          <Select
            options={["All systems", "Switch", "PS5", "Steam Deck"]}
            defaultValue="All systems"
          />
          <Select icon="arrow-up-down" options={["Recent", "Rating", "Hours"]} />
          <Select selectSize="sm" options={["Owned", "All"]} />
          <Select selectSize="lg" options={["Physical", "Digital"]} />
          <Select options={["Disabled"]} disabled />
        </Row>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section title="Checkbox & Switch">
        <div className="flex flex-col gap-4">
          <Checkbox
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            label="Owned only"
            description="Hide wishlist items from this shelf."
          />
          <Checkbox label="Include DLC" />
          <Checkbox label="Disabled" disabled />
          <Switch
            checked={switched}
            onChange={(e) => setSwitched(e.target.checked)}
            label="Group by system"
          />
          <Switch label="Public profile" />
          <Switch label="Disabled" disabled />
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section title="SegmentedControl">
        <Row label="Icon only">
          <SegmentedControl
            aria-label="View mode"
            value={view}
            onChange={setView}
            options={[
              { value: "grid", icon: "layout-grid" },
              { value: "list", icon: "list" },
            ]}
          />
        </Row>
        <Row label="With labels">
          <SegmentedControl
            value={view}
            onChange={setView}
            options={[
              { value: "grid", label: "Grid", icon: "layout-grid" },
              { value: "list", label: "List", icon: "list" },
            ]}
          />
          <SegmentedControl
            size="sm"
            value={view}
            onChange={setView}
            options={["grid", "list"]}
          />
        </Row>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section title="Tabs">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { value: "owned", label: "Owned", count: 57 },
            { value: "backlog", label: "Backlog", count: 22 },
            { value: "playing", label: "Playing", count: 4 },
            { value: "beaten", label: "Beaten", count: 31 },
            { value: "wishlist", label: "Wishlist", count: 12 },
          ]}
        />
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section title="FilterChip">
        <Row label="Status filters">
          {STATUS_ORDER.map((s) => (
            <FilterChip
              key={s}
              label={STATUS_META[s].label}
              color={STATUS_META[s].color}
              selected={chips.includes(s)}
              onClick={() => toggleChip(s)}
              removable
            />
          ))}
        </Row>
        <Row label="With counts and icons">
          <FilterChip label="Switch" count={57} icon="gamepad-2" />
          <FilterChip label="Physical" count={19} icon="disc-3" selected />
          <FilterChip label="Digital" count={38} icon="cloud" size="sm" />
        </Row>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section title="Stat & ProgressBar">
        <Row label="Stats">
          <div className="flex gap-12">
            <Stat label="Owned" value={248} sub="+12 this month" />
            <Stat
              label="Beaten"
              value={131}
              sub="53% of shelf"
              color="var(--status-beaten)"
            />
            <Stat label="Hours" value="1,204" size="lg" />
          </div>
        </Row>
        <Row label="Progress">
          <div className="flex w-full max-w-lg flex-col gap-5">
            <ProgressBar label="Switch" value={31} max={57} showValue />
            <ProgressBar
              label="PS5"
              value={18}
              max={42}
              showValue
              color="var(--plat-playstation)"
            />
            <ProgressBar
              label="Whole shelf"
              showValue
              height={10}
              max={100}
              segments={[
                { value: 131, color: "var(--status-beaten)", label: "Beaten" },
                { value: 22, color: "var(--status-playing)", label: "Playing" },
                { value: 95, color: "var(--status-backlog)", label: "Backlog" },
              ]}
            />
          </div>
        </Row>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section title="Avatar">
        <Row>
          <Avatar name="Adrian Vega" size={24} />
          <Avatar name="Adrian Vega" size={32} />
          <Avatar name="Adrian Vega" size={44} />
          <Avatar name="Rafael" size={56} />
        </Row>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section title="Tooltip" note="Hover or tab to the trigger.">
        <Row>
          <Tooltip content="Physical copy">
            <IconButton icon="disc-3" label="Physical" variant="secondary" />
          </Tooltip>
          <Tooltip content="Mark as beaten" side="bottom">
            <Button variant="secondary" icon="flag">
              Beaten
            </Button>
          </Tooltip>
        </Row>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section
        title="Toggletip"
        note="Click, not hover — for help text that has to work on touch. Escape or an outside click closes it."
      >
        <Row>
          <span className="type-overline text-text-4 inline-flex items-center gap-1">
            Systems
            <Toggletip
              label="About systems"
              size="sm"
              side="bottom"
              align="start"
              content="Own it on more than one system? Select each one."
            />
          </span>
        </Row>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section title="Toast">
        <div className="flex flex-col gap-3">
          <Toast
            tone="success"
            title="Marked Celeste as beaten"
            description="24 hours logged."
            onClose={() => {}}
          />
          <Toast
            title="Added Balatro to your shelf"
            action={
              <Button size="sm" variant="ghost">
                Undo
              </Button>
            }
            onClose={() => {}}
          />
          <Toast
            tone="danger"
            title="Could not sync your shelf"
            description="Retrying in 30 seconds."
            onClose={() => {}}
          />
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section title="Dialog" note="Native <dialog> — Escape and click-outside close it.">
        <Row>
          <Button onClick={() => setDialogOpen(true)} icon="plus">
            Log a game
          </Button>
        </Row>

        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title="Log a game"
          description="Pick the system you own it on."
          footer={
            <>
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setDialogOpen(false)}>Add to shelf</Button>
            </>
          }
        >
          <div className="flex flex-col gap-5">
            <Input placeholder="Search games" icon="search" autoFocus />
            <div className="flex flex-wrap gap-2">
              {PLATFORM_ORDER.slice(0, 4).map((p) => (
                <FilterChip
                  key={p}
                  label={PLATFORM_META[p].label}
                  color={PLATFORM_META[p].color}
                />
              ))}
            </div>
            <SegmentedControl
              value={view}
              onChange={setView}
              options={[
                { value: "grid", label: "Physical", icon: "disc-3" },
                { value: "list", label: "Digital", icon: "cloud" },
              ]}
            />
            <div className="flex flex-wrap gap-2">
              {STATUS_ORDER.slice(0, 4).map((s) => (
                <StatusBadge key={s} status={s} />
              ))}
            </div>
          </div>
        </Dialog>
      </Section>
    </main>
  );
}
