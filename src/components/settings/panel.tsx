import { cn } from "@/lib/cn";

/** The heading at the top of each settings page. */
export function SettingsHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h2 className="type-h2 text-text-1">{title}</h2>
      <p className="text-text-3 font-body mt-1 text-md">{description}</p>
    </div>
  );
}

/**
 * One group of settings. The body holds the fields; `footer` is the action
 * row along the bottom, with an optional note on the left — the usual shape
 * for account-management screens.
 */
export function Card({
  title,
  description,
  children,
  footer,
  note,
  tone,
  as: Tag = "section",
  ...rest
}: {
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  note?: React.ReactNode;
  tone?: "danger";
  /** `form` to make the whole card, footer included, one form. */
  as?: "section" | "form";
} & Omit<React.FormHTMLAttributes<HTMLFormElement>, "title">) {
  return (
    <Tag
      className={cn(
        "bg-surface-1 overflow-hidden rounded-lg",
        tone === "danger" ? "shadow-[inset_0_0_0_1px_var(--danger-soft-hover)]" : "inset-hairline",
      )}
      {...rest}
    >
      <div className="p-5 sm:p-6">
        <h3 className="type-h3 text-text-1">{title}</h3>
        {description ? <p className="text-text-3 font-body mt-1 text-sm">{description}</p> : null}
        {children ? <div className="mt-5">{children}</div> : null}
      </div>
      {footer ? (
        <div className="border-border-1 bg-surface-2/40 flex flex-wrap items-center justify-end gap-3 border-t px-5 py-3 sm:px-6">
          {note ? <p className="text-text-4 font-body mr-auto text-sm">{note}</p> : null}
          {footer}
        </div>
      ) : null}
    </Tag>
  );
}

export function FormError({ children }: { children?: string }) {
  return children ? (
    <p role="alert" className="text-danger font-body mt-4 text-sm">
      {children}
    </p>
  ) : null;
}
