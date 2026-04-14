"use client";

import { t } from "@/lib/i18n";
import { useAppStore } from "@/store/app-store";

export default function OfflinePage() {
  const lang = useAppStore((s) => s.settings.language);
  return (
    <div className="mx-auto max-w-lg space-y-2 rounded-lg border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 text-center">
      <h1 className="text-xl font-semibold">{t(lang, "offline_title")}</h1>
      <p className="text-sm text-[var(--color-muted)]">
        {t(lang, "offline_desc")}
      </p>
    </div>
  );
}
