"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, Timer } from "lucide-react";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

export function SiteNav() {
  const pathname = usePathname();
  const lang = useAppStore((s) => s.settings.language);
  const patchSettings = useAppStore((s) => s.patchSettings);
  const links = [
    { href: "/", label: t(lang, "nav_timer"), icon: Timer },
    { href: "/stats", label: t(lang, "nav_stats"), icon: BarChart3 },
    { href: "/tutorial", label: t(lang, "nav_tutorial"), icon: BookOpen },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      <nav className="glass flex items-center gap-1 rounded-2xl border border-[color-mix(in_oklch,var(--color-card-border),transparent_30%)] bg-[color-mix(in_oklch,var(--color-card),transparent_55%)] p-1 shadow-[0_16px_40px_-30px_rgba(0,0,0,0.8)]">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-[color-mix(in_oklch,var(--color-primary),white_12%)] text-[var(--color-primary-foreground)] shadow-[0_14px_34px_-24px_rgba(0,0,0,0.8)]"
                  : "text-[var(--color-muted)] hover:bg-[color-mix(in_oklch,var(--color-card),transparent_35%)] hover:text-[var(--color-foreground)]",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div
        className="glass flex items-center rounded-2xl border border-[color-mix(in_oklch,var(--color-card-border),transparent_30%)] bg-[color-mix(in_oklch,var(--color-card),transparent_55%)] p-1"
        role="group"
        aria-label={t(lang, "settings_language")}
      >
        {(["en", "de"] as const).map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => patchSettings({ language: code })}
            className={cn(
              "rounded-xl px-2.5 py-2 text-xs font-semibold uppercase tracking-wide transition-colors",
              lang === code
                ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
            )}
          >
            {code}
          </button>
        ))}
      </div>
    </div>
  );
}
