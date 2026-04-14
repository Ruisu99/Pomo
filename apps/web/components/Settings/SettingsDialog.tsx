"use client";

import { useState } from "react";
import type { Language, ThemeMode } from "@pomodoro/core";
import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ensureNotificationPermission } from "@/lib/notify";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

function minutesFromSeconds(s: number): number {
  return Math.round(s / 60);
}

function secondsFromMinutes(m: number): number {
  return Math.max(1, Math.round(m)) * 60;
}

export function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const settings = useAppStore((s) => s.settings);
  const patchSettings = useAppStore((s) => s.patchSettings);
  const [notifBusy, setNotifBusy] = useState(false);
  const lang = settings.language;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          aria-label={t(lang, "settings_aria")}
        >
          <Settings className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t(lang, "settings_title")}</DialogTitle>
          <DialogDescription>
            {t(lang, "settings_desc")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label>{t(lang, "settings_focus_length")}</Label>
                <p className="text-xs text-[var(--color-muted)]">
                  {minutesFromSeconds(settings.workDuration)}{" "}
                  {t(lang, "settings_minutes")}
                </p>
              </div>
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
              <div>
                <Label>{t(lang, "settings_short_break")}</Label>
                <p className="text-xs text-[var(--color-muted)]">
                  {minutesFromSeconds(settings.shortBreak)}{" "}
                  {t(lang, "settings_minutes")}
                </p>
              </div>
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
              <div>
                <Label>{t(lang, "settings_long_break")}</Label>
                <p className="text-xs text-[var(--color-muted)]">
                  {minutesFromSeconds(settings.longBreak)}{" "}
                  {t(lang, "settings_minutes")}
                </p>
              </div>
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
              <div>
                <Label>{t(lang, "settings_long_break_after")}</Label>
                <p className="text-xs text-[var(--color-muted)]">
                  {settings.longBreakAfter} {t(lang, "settings_focus_sessions")}
                </p>
              </div>
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

          <div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--color-card-border)] p-3">
            <div className="space-y-1">
              <Label>{t(lang, "settings_auto_advance")}</Label>
              <p className="text-xs text-[var(--color-muted)]">
                {t(lang, "settings_auto_advance_desc")}
              </p>
            </div>
            <Switch
              checked={settings.autoAdvance}
              onCheckedChange={(checked) => patchSettings({ autoAdvance: checked })}
            />
          </div>

          <div className="space-y-3 rounded-lg border border-[var(--color-card-border)] p-3">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <Label>{t(lang, "settings_sound")}</Label>
                <p className="text-xs text-[var(--color-muted)]">
                  {t(lang, "settings_sound_desc")}
                </p>
              </div>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => patchSettings({ soundEnabled: checked })}
              />
            </div>
            {settings.soundEnabled ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--color-muted)]">
                    {t(lang, "settings_volume")}
                  </span>
                  <span className="text-xs text-[var(--color-muted)]">
                    {Math.round(settings.soundVolume * 100)}%
                  </span>
                </div>
                <Slider
                  value={[Math.round(settings.soundVolume * 100)]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(v) =>
                    patchSettings({ soundVolume: ((v[0] ?? 60) as number) / 100 })
                  }
                />
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>{t(lang, "settings_theme")}</Label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "system", label: t(lang, "settings_theme_system") },
                  { id: "light", label: t(lang, "settings_theme_light") },
                  { id: "dark", label: t(lang, "settings_theme_dark") },
                ] as const satisfies ReadonlyArray<{ id: ThemeMode; label: string }>
              ).map((t) => (
                <Button
                  key={t.id}
                  type="button"
                  variant={settings.theme === t.id ? "default" : "secondary"}
                  className={cn("w-full", settings.theme !== t.id && "bg-transparent")}
                  onClick={() => patchSettings({ theme: t.id })}
                >
                  {t.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t(lang, "settings_language")}</Label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: "en", label: t(lang, "settings_language_en") },
                  { id: "de", label: t(lang, "settings_language_de") },
                ] as const satisfies ReadonlyArray<{ id: Language; label: string }>
              ).map((opt) => (
                <Button
                  key={opt.id}
                  type="button"
                  variant={settings.language === opt.id ? "default" : "secondary"}
                  className={cn(
                    "w-full",
                    settings.language !== opt.id && "bg-transparent",
                  )}
                  onClick={() => patchSettings({ language: opt.id })}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-[var(--color-card-border)] p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <Label className="inline-flex items-center gap-2">
                  <Bell className="size-4" />
                  {t(lang, "settings_notifications")}
                </Label>
                <p className="text-xs text-[var(--color-muted)]">
                  {t(lang, "settings_notifications_desc")}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={notifBusy}
              onClick={async () => {
                setNotifBusy(true);
                try {
                  await ensureNotificationPermission();
                } finally {
                  setNotifBusy(false);
                }
              }}
            >
              {t(lang, "settings_enable_notifications")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
