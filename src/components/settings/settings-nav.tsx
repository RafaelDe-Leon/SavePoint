"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon, type IconName } from "@/components/ui";
import { cn } from "@/lib/cn";

export const SETTINGS_SECTIONS: {
  heading: string;
  items: { href: string; label: string; icon: IconName }[];
}[] = [
  {
    heading: "Account",
    items: [
      { href: "/settings", label: "Profile", icon: "user" },
      { href: "/settings/security", label: "Security", icon: "shield-check" },
      { href: "/settings/notifications", label: "Notifications", icon: "bell" },
      { href: "/settings/privacy", label: "Privacy", icon: "eye" },
    ],
  },
  {
    heading: "App",
    items: [
      { href: "/settings/appearance", label: "Appearance", icon: "palette" },
      { href: "/settings/data", label: "Your data", icon: "hard-drive" },
    ],
  },
];

/**
 * Settings sidebar. A sticky column of grouped links on wide screens; on
 * narrow ones it folds into a single scrolling row above the content.
 */
export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Settings" className="min-w-0 lg:sticky lg:top-[calc(var(--nav-height)+32px)]">
      <div className="-mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-6 lg:overflow-visible lg:px-0">
        {SETTINGS_SECTIONS.map((section) => (
          <div key={section.heading} className="flex gap-1 lg:flex-col">
            <p className="type-overline text-text-4 hidden px-3 pb-2 lg:block">{section.heading}</p>
            {section.items.map((it) => {
              const on = pathname === it.href;
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "font-body flex h-9 shrink-0 items-center gap-2.5 rounded-md px-3 text-md whitespace-nowrap",
                    "transition-colors duration-[120ms]",
                    on
                      ? "bg-surface-3 text-text-1 font-semibold"
                      : "text-text-3 hover:bg-surface-2 hover:text-text-1 font-medium",
                  )}
                >
                  <Icon name={it.icon} size={16} className={on ? "text-text-1" : "text-text-4"} />
                  {it.label}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </nav>
  );
}
