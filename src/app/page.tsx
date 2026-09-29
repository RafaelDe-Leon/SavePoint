import Link from "next/link";

import { CoverWall } from "@/components/landing/cover-wall";
import { FeatureImage } from "@/components/landing/feature-image";
import { SiteNav, Wordmark } from "@/components/landing/site-nav";
import {
  buttonClassName,
  GameCard,
  GameCover,
  Icon,
} from "@/components/ui";
import {
  COMING_SOON,
  MOST_BACKLOGGED,
  MOST_BEATEN,
  TRENDING,
  type ListRow,
} from "@/lib/landing-data";

function SectionHead({ title, href }: { title: string; href?: string }) {
  return (
    <div className="mb-5 flex items-baseline justify-between gap-4">
      <h2 className="type-h3 text-text-1">{title}</h2>
      {href ? (
        <Link
          href={href}
          className="text-text-3 hover:text-text-1 font-body text-sm transition-colors duration-[120ms]"
        >
          See more
        </Link>
      ) : null}
    </div>
  );
}

function Feature({
  overline,
  title,
  body,
  image,
  flip = false,
}: {
  overline: string;
  title: string;
  body: string;
  image: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <div className="grid items-center gap-8 md:grid-cols-2 md:gap-16">
      <div className={flip ? "md:order-2" : undefined}>{image}</div>
      <div className={flip ? "md:order-1" : undefined}>
        <p className="type-overline text-accent mb-3">{overline}</p>
        <h3 className="type-h1 text-text-1 text-balance">{title}</h3>
        <p className="type-body-lg text-text-3 mt-4 max-w-prose">{body}</p>
      </div>
    </div>
  );
}

function GameList({ title, rows }: { title: string; rows: ListRow[] }) {
  return (
    <div>
      <SectionHead title={title} />
      <ul className="flex flex-col gap-3">
        {rows.map((r) => (
          <li key={r.title} className="flex items-center gap-3.5">
            <GameCover title="" tint={r.tint} width={44} />
            <div className="min-w-0">
              <p className="text-text-1 font-body truncate text-md font-semibold">
                {r.title}
              </p>
              <p className="text-text-3 font-mono mt-0.5 text-xs">{r.meta}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteNav />

      {/* ---------------------------------------------------------------- */}
      <section className="relative -mt-nav">
        <CoverWall />
        <div className="relative mx-auto w-full max-w-page px-4 pt-56 pb-20 sm:px-8 sm:pt-72 sm:pb-24">
          <h1 className="type-h1 sm:type-display text-text-1 max-w-3xl text-balance">
            Of the games you own, which have you beaten?
          </h1>
          <p className="type-body-lg text-text-2 mt-5 max-w-xl">
            Track your collection by the system you own it on. Log what you
            play, mark what you finish, and see what&rsquo;s still waiting.
          </p>


          <div className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-3">
            <Link href="/signup" className={buttonClassName({ size: "lg" })}>
              Create a free account
              <Icon name="chevron-right" size={18} />
            </Link>
            <p className="text-text-3 font-body text-md">
              or{" "}
              <Link href="/login" className="text-text-1 font-medium hover:underline underline-offset-4">
                log in
              </Link>{" "}
              if you have an account
            </p>
          </div>
        </div>
      </section>

      <main className="relative mx-auto flex w-full max-w-page flex-col gap-24 px-4 pb-24 sm:px-8">
        {/* -------------------------------------------------------------- */}
        <section>
          <SectionHead title="Recently trending" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
            {TRENDING.map((g) => (
              <GameCard
                key={g.title}
                title={g.title}
                year={g.year}
                tint={g.tint}
                platform={g.platform}
                platformLabel={g.platformLabel}
                className="w-full!"
                width={180}
              />
            ))}
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        <section className="flex flex-col gap-20">
          <div className="max-w-3xl">
            <h2 className="type-h1 text-text-1">What is Savepoint?</h2>
            <p className="type-body-lg text-text-3 mt-4">
              A backlog tracker that starts from what you own. Every game on
              your shelf is tied to a system, so the question it answers is
              simple: of the games you have, which have you actually finished?
            </p>
          </div>

          <Feature
            overline="Collection"
            title="Your shelf, grouped by system"
            body="Switch, PS5, Steam Deck, the SNES in the closet. See what you own on each one, physical or digital, and how much of it you've beaten."
            image={<FeatureImage alt="Library shelf grouped by system" />}
          />
          <Feature
            flip
            overline="Logging"
            title="Log a game in two steps"
            body="Search, then pick the system, format and status. Seven statuses cover everything from Backlog to 100%, so nothing sits in a vague pile."
            image={<FeatureImage alt="Log a game dialog" />}
          />
          <Feature
            overline="Progress"
            title="Numbers, not vibes"
            body="Counts, hours and completion per system. Watch the backlog shrink, or at least know exactly how big it is."
            image={<FeatureImage alt="Stats and progress per system" />}
          />
        </section>

        {/* -------------------------------------------------------------- */}
        <section className="grid gap-12 md:grid-cols-3 md:gap-10">
          <GameList title="Coming soon" rows={COMING_SOON} />
          <GameList title="Most backlogged" rows={MOST_BACKLOGGED} />
          <GameList title="Most beaten" rows={MOST_BEATEN} />
        </section>

        {/* -------------------------------------------------------------- */}
        <section className="bg-surface-1 inset-hairline flex flex-col items-start gap-6 rounded-xl p-8 sm:p-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="type-h1 text-text-1 text-balance">
              Your backlog won&rsquo;t beat itself.
            </h2>
            <p className="type-body-lg text-text-3 mt-2">
              Free. Start with the games you already own.
            </p>
          </div>
          <Link
            href="/signup"
            className={buttonClassName({ size: "lg", variant: "secondary", className: "shrink-0" })}
          >
            Create a free account
          </Link>
        </section>
      </main>

      <footer className="border-border-1 bg-surface-1 border-t">
        <div className="mx-auto flex w-full max-w-page flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-8">
          <div className="flex flex-col gap-1.5">
            <Wordmark className="text-lg" />
            <p className="text-text-4 font-mono text-xs">© 2026 Savepoint</p>
          </div>
          <nav className="font-body text-text-3 flex gap-5 text-sm">
            <Link href="/login" className="hover:text-text-1">Log in</Link>
            <Link href="/signup" className="hover:text-text-1">Sign up</Link>
            <Link href="/styleguide" className="hover:text-text-1">Design system</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
