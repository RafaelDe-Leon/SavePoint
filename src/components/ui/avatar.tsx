import { cn } from "@/lib/cn";

export interface AvatarProps {
  name?: string;
  src?: string;
  /** Edge length in px; radius and initials scale from it. */
  size?: number;
  className?: string;
}

/** Squircle-ish avatar. Falls back to up to two initials in the display face. */
export function Avatar({ name = "", src, size = 32, className }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <span
      title={name || undefined}
      className={cn(
        "bg-surface-5 text-text-1 font-display inset-hairline inline-flex shrink-0 items-center justify-center overflow-hidden font-semibold leading-none",
        className,
      )}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.3),
        fontSize: Math.round(size * 0.4),
      }}
    >
      {src ? (
        // Avatars come from arbitrary user-supplied URLs.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="size-full object-cover" />
      ) : (
        initials
      )}
    </span>
  );
}
