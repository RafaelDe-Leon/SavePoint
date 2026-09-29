import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./icon";
import { IconButton } from "./icon-button";

const TONES = {
  default: { color: "var(--text-2)", icon: "info" },
  success: { color: "var(--accent)", icon: "circle-check-big" },
  danger: { color: "var(--danger)", icon: "triangle-alert" },
} satisfies Record<string, { color: string; icon: IconName }>;

export interface ToastProps {
  /** Past tense, no exclamation: "Marked Celeste as beaten". */
  title: React.ReactNode;
  description?: React.ReactNode;
  tone?: keyof typeof TONES;
  /** Overrides the tone's default glyph. */
  icon?: IconName;
  /** Usually an undo Button. */
  action?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Toast({
  title,
  description,
  tone = "default",
  icon,
  action,
  onClose,
  className,
}: ToastProps) {
  const t = TONES[tone];

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "bg-surface-4 rounded-lg flex w-[360px] max-w-full items-start gap-3 py-3 pr-2.5 pl-3.5",
        "shadow-[var(--shadow-lg),inset_0_0_0_1px_var(--border-3)]",
        className,
      )}
    >
      <Icon
        name={icon ?? t.icon}
        size={18}
        className="mt-px"
        style={{ color: t.color }}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <span className="text-text-1 font-body text-md font-semibold leading-[1.3]">
          {title}
        </span>
        {description ? (
          <span className="text-text-2 font-body text-sm leading-[1.4]">
            {description}
          </span>
        ) : null}
      </div>

      {action}
      {onClose ? (
        <IconButton icon="x" label="Dismiss" size="sm" onClick={onClose} />
      ) : null}
    </div>
  );
}
