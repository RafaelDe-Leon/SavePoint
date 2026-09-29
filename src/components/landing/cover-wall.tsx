import { GameCover } from "@/components/ui";
import { WALL_TITLES } from "@/lib/landing-data";

const ROWS = 5;
/** Enough covers per row to span a 4K-wide viewport (24 × 160px ≈ 3840px). */
const PER_ROW = 24;

const FADES = {
  /** Landing hero: covers clearly visible, fading out at the bottom. */
  hero: {
    wall: "opacity-80",
    linear:
      "bg-[linear-gradient(180deg,rgba(13,14,16,0.2)_0%,rgba(13,14,16,0.5)_40%,rgba(13,14,16,0.85)_75%,var(--bg-app)_100%)]",
    radial:
      "bg-[radial-gradient(ellipse_at_40%_60%,rgba(13,14,16,0.7)_0%,transparent_65%)]",
  },
  /** Behind forms and panels: a quiet texture, never competing with the copy. */
  strong: {
    wall: "opacity-35",
    linear:
      "bg-[linear-gradient(180deg,rgba(13,14,16,0.55)_0%,rgba(13,14,16,0.8)_45%,var(--bg-app)_90%)]",
    radial:
      "bg-[radial-gradient(ellipse_at_50%_40%,transparent_0%,rgba(13,14,16,0.6)_70%)]",
  },
} as const;

/**
 * Decorative backdrop: fills its positioned parent edge to edge, with rows of
 * covers staggered and faded into the page by a protection gradient so the
 * headline stays readable. Titles cycle so rows never run out on wide screens.
 * Static — the design system rules out looping animation.
 */
export function CoverWall({ fade = "hero" }: { fade?: keyof typeof FADES }) {
  const f = FADES[fade];
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      <div className={`absolute top-0 left-[-80px] flex flex-col gap-3 ${f.wall}`}>
        {Array.from({ length: ROWS }, (_, r) => (
          <div
            key={r}
            className="flex gap-3"
            style={{ transform: `translateX(${r % 2 ? -70 : 0}px)` }}
          >
            {Array.from({ length: PER_ROW }, (_, i) => {
              // Offset each row so the same titles don't stack vertically.
              const g = WALL_TITLES[(r * 9 + i) % WALL_TITLES.length];
              return (
                <GameCover
                  key={i}
                  title={g.title}
                  tint={g.tint}
                  width={148}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Protection gradients: fade down into the page, darken behind the copy. */}
      <div className={`absolute inset-0 ${f.linear}`} />
      <div className={`absolute inset-0 ${f.radial}`} />
    </div>
  );
}
