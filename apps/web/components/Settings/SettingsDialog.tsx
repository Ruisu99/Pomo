"use client";

import { useState } from "react";
import type { BackgroundPreset, Language, ThemeMode } from "@pomodoro/core";
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
                  onValueChange={(v: number[]) =>
                    patchSettings({ soundVolume: ((v[0] ?? 60) as number) / 100 })
                  }
                />
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>{t(lang, "settings_theme")}</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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

          <div className="space-y-2">
            <Label>{t(lang, "settings_background")}</Label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "pomoRed", label: t(lang, "settings_background_pomo") },
                  { id: "pomoSlate", label: t(lang, "settings_background_slate") },
                  { id: "pomoGold", label: t(lang, "settings_background_gold") },
                  { id: "solid", label: t(lang, "settings_background_solid") },
                  { id: "customImage", label: t(lang, "settings_background_custom") },
                ] as const satisfies ReadonlyArray<{ id: BackgroundPreset; label: string }>
              ).map((opt) => (
                <Button
                  key={opt.id}
                  type="button"
                  variant={settings.backgroundPreset === opt.id ? "default" : "secondary"}
                  className={cn(
                    "w-full",
                    settings.backgroundPreset !== opt.id && "bg-transparent",
                  )}
                  onClick={() => patchSettings({ backgroundPreset: opt.id })}
                >
                  {opt.label}
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-card-border)] p-3">
              <div className="space-y-1">
                <Label>{t(lang, "settings_background_color")}</Label>
                <p className="text-xs text-[var(--color-muted)]">{settings.backgroundSolid}</p>
              </div>
              <input
                aria-label={t(lang, "settings_background_color")}
                type="color"
                value={settings.backgroundSolid}
                onChange={(e) => patchSettings({ backgroundSolid: e.target.value })}
                className="h-10 w-12 cursor-pointer rounded-md border border-[var(--color-card-border)] bg-transparent p-1"
              />
            </div>

            {settings.backgroundPreset === "customImage" ? (
              <div className="space-y-2 rounded-lg border border-[var(--color-card-border)] p-3">
                <Label>{t(lang, "settings_background_upload")}</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const result = typeof reader.result === "string" ? reader.result : null;
                      patchSettings({ backgroundImageDataUrl: result });
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="block w-full text-sm text-[var(--color-muted)] file:mr-3 file:rounded-lg file:border file:border-[var(--color-card-border)] file:bg-[var(--color-card)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[var(--color-foreground)] hover:file:bg-[var(--color-accent)]"
                />
                {settings.backgroundImageDataUrl ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={() => patchSettings({ backgroundImageDataUrl: null })}
                  >
                    {t(lang, "settings_background_remove")}
                  </Button>
                ) : null}
              </div>
            ) : null}
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
