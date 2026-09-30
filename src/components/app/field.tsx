/**
 * A labelled form row: label, control, then either the error or a hint.
 * Pass the control's `id` as `htmlFor`; the error/hint id is `<htmlFor>-note`
 * for `aria-describedby`.
 */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="type-label text-text-2 mb-2 block">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-note`} role="alert" className="text-danger font-body mt-1.5 text-sm">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-note`} className="text-text-4 font-body mt-1.5 text-sm">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Heading-plus-body block for the profile's section cards. */
export function Section({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="border-border-1 mb-4 flex items-baseline justify-between gap-4 border-b pb-3">
        <h2 className="type-h3 text-text-1">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** "Nothing here yet" — always says what to do next. */
export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface-1 inset-hairline text-text-3 font-body rounded-lg px-6 py-12 text-center text-md">
      {children}
    </div>
  );
}
