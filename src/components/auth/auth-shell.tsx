import { CoverWall } from "@/components/landing/cover-wall";
import { Wordmark } from "@/components/landing/site-nav";
import { Icon, type IconName } from "@/components/ui";

const POINTS: { icon: IconName; text: string }[] = [
  { icon: "library", text: "Every game tied to the system you own it on" },
  { icon: "flag", text: "Seven statuses, from Backlog to 100%" },
  { icon: "trophy", text: "Counts and hours per system, so you know what's left" },
];

/**
 * Shared frame for /login and /signup. On large screens a brand panel (faded
 * cover wall, headline, three points) sits beside the form; on small screens
 * it drops away and the form is the whole page.
 */
export function AuthShell({
  title,
  subtitle,
  panelTitle,
  children,
}: {
  title: string;
  subtitle: string;
  /** Headline on the brand panel. */
  panelTitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid flex-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      {/* Brand panel ---------------------------------------------------- */}
      <aside className="border-border-1 relative hidden overflow-hidden border-r lg:flex lg:flex-col lg:justify-between lg:p-12">
        <CoverWall fade="strong" />
        <Wordmark className="relative self-start" />

        <div className="relative max-w-md self-center">
          <h2 className="type-h1 text-text-1 text-balance">{panelTitle}</h2>
          <ul className="mt-8 flex flex-col gap-4">
            {POINTS.map((p) => (
              <li key={p.text} className="text-text-2 font-body flex items-center gap-3 text-md">
                <span className="bg-surface-3 inset-hairline text-text-1 flex size-8 shrink-0 items-center justify-center rounded-md">
                  <Icon name={p.icon} size={16} />
                </span>
                {p.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-text-4 relative font-mono text-xs">© 2026 Savepoint</p>
      </aside>

      {/* Form ----------------------------------------------------------- */}
      <main className="flex flex-col px-4 py-6 sm:px-8 lg:px-16">
        <header className="flex h-10 items-center lg:hidden">
          <Wordmark />
        </header>

        <div className="flex flex-1 items-center justify-center py-10">
          <section aria-labelledby="auth-heading" className="w-full max-w-[440px]">
            <h1 id="auth-heading" className="type-h1 text-text-1">
              {title}
            </h1>
            <p className="type-body-lg text-text-3 mt-2 mb-8">{subtitle}</p>
            {children}
          </section>
        </div>
      </main>
    </div>
  );
}
