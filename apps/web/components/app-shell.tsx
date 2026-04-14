"use client";

import Image from "next/image";
import { SiteNav } from "@/components/site-nav";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/store/app-store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const lang = useAppStore((s) => s.settings.language);
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--color-card-border),transparent_25%)] bg-[color-mix(in_oklch,var(--color-card),transparent_10%)] shadow-[0_10px_26px_-22px_rgba(0,0,0,0.35)]">
            <Image
              src="/logo_symb.png"
              alt="Pomo"
              fill
              className="object-contain p-1.5"
              priority
            />
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <Image
                src="/logo_wordmark.png"
                alt="Pomo"
                width={120}
                height={32}
                className="h-7 w-auto"
                priority
              />
              <span className="rounded-full border border-[color-mix(in_oklch,var(--color-card-border),transparent_25%)] bg-[color-mix(in_oklch,var(--color-card),transparent_8%)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                Beta
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {t(lang, "header_title")}
            </p>
          </div>
        </div>
        <SiteNav />
      </header>
      <main className="flex-1">{children}</main>
      <footer className="text-center text-xs text-[var(--color-muted)]">
        {t(lang, "footer")}
      </footer>
    </div>
  );
}

