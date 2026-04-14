"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/store/app-store";

function minutesFromSeconds(s: number): number {
  return Math.round(s / 60);
}

function secondsFromMinutes(m: number): number {
  return Math.max(1, Math.round(m)) * 60;
}

export function SessionSettingsCard() {
  const settings = useAppStore((s) => s.settings);
  const patchSettings = useAppStore((s) => s.patchSettings);
  const lang = settings.language;

  const totalSessions = settings.longBreakAfter;
  const productiveMin = minutesFromSeconds(settings.workDuration) * totalSessions;
  const shortBreakMin = minutesFromSeconds(settings.shortBreak) * (totalSessions - 1);
  const longBreakMin = minutesFromSeconds(settings.longBreak);
  const totalMin = productiveMin + shortBreakMin + longBreakMin;

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-lg">{t(lang, "session_settings_title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-xl border border-[color-mix(in_oklch,var(--color-card-border),transparent_30%)] bg-[color-mix(in_oklch,var(--color-card),transparent_45%)] px-4 py-3 text-sm text-[var(--color-foreground)]">
          {t(lang, "session_settings_summary", {
            total: totalMin,
            productive: productiveMin,
          })}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <Label>{t(lang, "session_settings_work")}</Label>
            <span className="text-sm text-[var(--color-muted)]">
              {minutesFromSeconds(settings.workDuration)} {t(lang, "settings_minutes")}
            </span>
          </div>
          <Slider
            value={[minutesFromSeconds(settings.workDuration)]}
            min={5}
            max={90}
            step={1}
            onValueChange={(v) =>
              patchSettings({ workDuration: secondsFromMinutes(v[0] ?? 25) })
            }
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <Label>{t(lang, "session_settings_short_break")}</Label>
            <span className="text-sm text-[var(--color-muted)]">
              {minutesFromSeconds(settings.shortBreak)} {t(lang, "settings_minutes")}
            </span>
          </div>
          <Slider
            value={[minutesFromSeconds(settings.shortBreak)]}
            min={1}
            max={30}
            step={1}
            onValueChange={(v) =>
              patchSettings({ shortBreak: secondsFromMinutes(v[0] ?? 5) })
            }
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <Label>{t(lang, "session_settings_long_break")}</Label>
            <span className="text-sm text-[var(--color-muted)]">
              {minutesFromSeconds(settings.longBreak)} {t(lang, "settings_minutes")}
            </span>
          </div>
          <Slider
            value={[minutesFromSeconds(settings.longBreak)]}
            min={5}
            max={45}
            step={1}
            onValueChange={(v) =>
              patchSettings({ longBreak: secondsFromMinutes(v[0] ?? 15) })
            }
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <Label>{t(lang, "session_settings_long_break_after")}</Label>
            <span className="text-sm text-[var(--color-muted)]">
              {settings.longBreakAfter} {t(lang, "session_settings_sessions")}
            </span>
          </div>
          <Slider
            value={[settings.longBreakAfter]}
            min={2}
            max={8}
            step={1}
            onValueChange={(v) =>
              patchSettings({ longBreakAfter: v[0] ?? settings.longBreakAfter })
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

