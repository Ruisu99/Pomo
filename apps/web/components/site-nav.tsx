"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Timer } from "lucide-react";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

export function SiteNav() {
  const pathname = usePathname();
  const lang = useAppStore((s) => s.settings.language);
  const links = [
    { href: "/", label: t(lang, "nav_timer"), icon: Timer },
    { href: "/stats", label: t(lang, "nav_stats"), icon: BarChart3 },
  ];
  return (
    <nav className="flex items-center gap-1 rounded-lg border border-[var(--color-card-border)] bg-[var(--color-card)] p-1 shadow-sm">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                : "text-[var(--color-muted)] hover:bg-[var(--color-accent)] hover:text-[var(--color-foreground)]",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
