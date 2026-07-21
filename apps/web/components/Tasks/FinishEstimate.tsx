"use client";

import { estimateFinishAt, remainingOpenPomos } from "@pomodoro/core";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/store/app-store";

/** Only renders when there are open pomodoros to estimate. */
export function FinishEstimate() {
  const tasks = useAppStore((s) => s.tasks);
  const settings = useAppStore((s) => s.settings);
  const lang = settings.language;

  const open = remainingOpenPomos(tasks);
  const finishAt = estimateFinishAt(tasks, settings);

  if (open <= 0 || finishAt == null) return null;

  const locale = lang === "de" ? "de-DE" : undefined;
  const timeStr = new Date(finishAt).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <p className="text-center text-sm text-[var(--color-muted)]">
      {t(lang, "eta_label", { count: open, time: timeStr })}
    </p>
  );
}
