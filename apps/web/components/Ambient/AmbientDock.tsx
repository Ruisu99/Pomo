"use client";

import { useEffect, useState } from "react";
import {
  CloudRain,
  Coffee,
  Trees,
  Music2,
  Pause,
  Play,
  Volume2,
  Waves,
} from "lucide-react";
import type { AmbientTrackId } from "@pomodoro/core";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { AMBIENT_TRACKS } from "@/lib/ambient-tracks";
import {
  getAmbientState,
  subscribeAmbient,
} from "@/lib/ambient-player";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

const TRACK_ICONS: Record<AmbientTrackId, typeof Music2> = {
  lofi: Music2,
  rain: CloudRain,
  cafe: Coffee,
  whitenoise: Waves,
  forest: Trees,
};

export function AmbientDock() {
  const lang = useAppStore((s) => s.settings.language);
  const settings = useAppStore((s) => s.settings);
  const setAmbientEnabled = useAppStore((s) => s.setAmbientEnabled);
  const setAmbientTrackId = useAppStore((s) => s.setAmbientTrackId);
  const setAmbientVolumeSetting = useAppStore((s) => s.setAmbientVolumeSetting);
  const toggleAmbientPlayback = useAppStore((s) => s.toggleAmbientPlayback);

  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setPlaying(getAmbientState().playing);
    return subscribeAmbient((s) => setPlaying(s.playing));
  }, []);

  return (
    <div
      className={cn(
        "glass mx-auto w-full max-w-lg rounded-2xl border border-[var(--color-card-border)]",
        "bg-[color-mix(in_oklch,var(--color-card),transparent_25%)] px-4 py-3 shadow-sm",
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{t(lang, "ambient_title")}</p>
          <p className="text-xs text-[var(--color-muted)]">
            {t(lang, "ambient_desc")}
          </p>
        </div>
        <Button
          type="button"
          size="icon"
          variant={settings.ambientEnabled && playing ? "default" : "secondary"}
          aria-label={
            playing ? t(lang, "ambient_pause") : t(lang, "ambient_play")
          }
          onClick={() => {
            if (!settings.ambientEnabled) setAmbientEnabled(true);
            else toggleAmbientPlayback();
          }}
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        </Button>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {AMBIENT_TRACKS.map((track) => {
          const Icon = TRACK_ICONS[track.id];
          const active = settings.ambientTrackId === track.id;
          return (
            <button
              key={track.id}
              type="button"
              onClick={() => {
                setAmbientTrackId(track.id);
                if (!settings.ambientEnabled) setAmbientEnabled(true);
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs transition-colors",
                active
                  ? "border-[var(--color-primary)] bg-[var(--color-accent)] text-[var(--color-foreground)]"
                  : "border-[var(--color-card-border)] text-[var(--color-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-foreground)]",
              )}
            >
              <Icon className="size-3.5" />
              {t(lang, track.labelKey)}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <Volume2 className="size-4 shrink-0 text-[var(--color-muted)]" />
        <Slider
          value={[Math.round(settings.ambientVolume * 100)]}
          min={0}
          max={100}
          step={5}
          onValueChange={(v) =>
            setAmbientVolumeSetting(((v[0] ?? 35) as number) / 100)
          }
          aria-label={t(lang, "ambient_volume")}
        />
        <span className="w-8 text-right text-xs tabular-nums text-[var(--color-muted)]">
          {Math.round(settings.ambientVolume * 100)}%
        </span>
      </div>
    </div>
  );
}
