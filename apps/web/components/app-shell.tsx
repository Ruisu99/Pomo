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
        <div className="leading-tight">
          <Image
            src="/logo_wordmark.png"
            alt="Pomo"
            width={260}
            height={80}
            className="h-12 w-auto"
            priority
          />
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {t(lang, "header_title")}
          </p>
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

