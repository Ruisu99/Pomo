"use client";

import Image from "next/image";
import { SiteNav } from "@/components/site-nav";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/store/app-store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const lang = useAppStore((s) => s.settings.language);
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-7 px-4 py-6 sm:gap-8 sm:py-10">
      <header className="flex items-center justify-between gap-3">
        <div className="leading-tight">
          <Image
            src="/logo_wordmark.png"
            alt="Pomo"
            width={510}
            height={667}
            className="h-14 w-auto sm:h-[4.5rem]"
            priority
          />
        </div>
        <SiteNav />
      </header>
      <main className="flex-1">{children}</main>
      <footer
        className="text-center text-xs"
        style={{ color: "var(--app-footer-color)" }}
      >
        {t(lang, "footer")}
      </footer>
    </div>
  );
}
