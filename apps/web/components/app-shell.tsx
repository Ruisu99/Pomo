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
            width={420}
            height={140}
            className="h-20 w-auto"
            priority
          />
        </div>
        <SiteNav />
      </header>
      <main className="flex-1">{children}</main>
      <footer className="text-center text-xs" style={{ color: "var(--app-footer-color)" }}>
        {t(lang, "footer")}
      </footer>
    </div>
  );
}

