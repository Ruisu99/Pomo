"use client";

import { Shield, ShieldOff } from "lucide-react";
import { isStrictFocusActive } from "@pomodoro/core";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

export function FocusModeToggle() {
  const settings = useAppStore((s) => s.settings);
  const timer = useAppStore((s) => s.timer);
  const setFocusModeEnabled = useAppStore((s) => s.setFocusModeEnabled);
  const lang = settings.language;
  const enabled = settings.focusModeEnabled;
  const strict = isStrictFocusActive(timer, settings);

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-colors",
        enabled
          ? "border-[color-mix(in_oklch,var(--color-accent),transparent_20%)] bg-[color-mix(in_oklch,var(--color-accent),transparent_55%)]"
          : "border-[var(--color-card-border)] bg-[color-mix(in_oklch,var(--color-card),transparent_20%)]",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div
            className={cn(
              "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg",
              enabled
                ? "bg-[var(--color-accent)] text-[var(--color-foreground)]"
                : "bg-[var(--color-card-border)] text-[var(--color-muted)]",
            )}
          >
            {enabled ? <Shield className="size-5" /> : <ShieldOff className="size-5" />}
          </div>
          <div className="space-y-1">
            <Label htmlFor="focus-mode" className="text-base font-semibold">
              {t(lang, "focus_mode_title")}
            </Label>
            <p className="text-sm text-[var(--color-muted)]">
              {enabled
                ? strict
                  ? t(lang, "focus_mode_active_strict")
                  : t(lang, "focus_mode_active")
                : t(lang, "focus_mode_desc")}
            </p>
          </div>
        </div>
        <Switch
          id="focus-mode"
          checked={enabled}
          onCheckedChange={(checked) => setFocusModeEnabled(checked)}
          className="mt-1"
        />
      </div>
    </div>
  );
}
