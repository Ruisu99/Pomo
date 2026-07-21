"use client";

import { useState } from "react";
import { normalizeBlockedSite } from "@pomodoro/core";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/store/app-store";

export function BlocklistSettings() {
  const settings = useAppStore((s) => s.settings);
  const patchSettings = useAppStore((s) => s.patchSettings);
  const lang = settings.language;
  const [newSite, setNewSite] = useState("");

  const addSite = () => {
    const normalized = normalizeBlockedSite(newSite);
    if (!normalized) return;
    if (settings.blockedSites.includes(normalized)) {
      setNewSite("");
      return;
    }
    patchSettings({ blockedSites: [...settings.blockedSites, normalized] });
    setNewSite("");
  };

  const removeSite = (site: string) => {
    patchSettings({ blockedSites: settings.blockedSites.filter((s) => s !== site) });
  };

  return (
    <div className="space-y-4 rounded-lg border border-[var(--color-card-border)] p-3">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Label>{t(lang, "settings_block_distractions")}</Label>
          <p className="text-xs text-[var(--color-muted)]">
            {t(lang, "settings_block_distractions_desc")}
          </p>
        </div>
        <Switch
          checked={settings.blockDistractions}
          onCheckedChange={(checked) => patchSettings({ blockDistractions: checked })}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Label>{t(lang, "settings_strict_focus")}</Label>
          <p className="text-xs text-[var(--color-muted)]">
            {t(lang, "settings_strict_focus_desc")}
          </p>
        </div>
        <Switch
          checked={settings.strictFocus}
          onCheckedChange={(checked) => patchSettings({ strictFocus: checked })}
        />
      </div>

      {settings.blockDistractions ? (
        <div className="space-y-2">
          <Label>{t(lang, "settings_blocked_sites")}</Label>
          <p className="text-xs text-[var(--color-muted)]">
            {t(lang, "settings_blocked_sites_hint")}
          </p>
          <div className="flex flex-wrap gap-2">
            {settings.blockedSites.map((site) => (
              <span
                key={site}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--color-card-border)] bg-[color-mix(in_oklch,var(--color-card),transparent_30%)] px-2.5 py-1 text-xs"
              >
                {site}
                <button
                  type="button"
                  onClick={() => removeSite(site)}
                  className="rounded-full p-0.5 hover:bg-[var(--color-card-border)]"
                  aria-label={t(lang, "settings_remove_site", { site })}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newSite}
              onChange={(e) => setNewSite(e.target.value)}
              placeholder={t(lang, "settings_blocked_sites_placeholder")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSite();
                }
              }}
              className="flex-1 rounded-lg border border-[var(--color-card-border)] bg-[var(--color-card)] px-3 py-2 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
            <Button type="button" variant="secondary" size="icon" onClick={addSite}>
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
