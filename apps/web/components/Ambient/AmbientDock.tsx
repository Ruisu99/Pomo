"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Pause, Play, Volume2 } from "lucide-react";
import type { AmbientTrackId } from "@pomodoro/core";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  getLofiState,
  mountLofiPlayer,
  pauseLofi,
  playLofi,
  setLofiTrack,
  setLofiVolume,
  STREAM_ORDER,
  STREAMS,
  subscribeLofi,
} from "@/lib/lofi-player";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

export function AmbientDock() {
  const lang = useAppStore((s) => s.settings.language);
  const settings = useAppStore((s) => s.settings);
  const setAmbientEnabled = useAppStore((s) => s.setAmbientEnabled);
  const setAmbientTrackId = useAppStore((s) => s.setAmbientTrackId);
  const setAmbientVolumeSetting = useAppStore((s) => s.setAmbientVolumeSetting);
  const hostRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  const trackId = settings.ambientTrackId;
  const watchUrl = STREAMS[trackId].watchUrl;

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    void mountLofiPlayer(el, trackId);
    setPlaying(getLofiState().playing);
    setReady(getLofiState().ready);
    return subscribeLofi((s) => {
      setPlaying(s.playing);
      setReady(s.ready);
    });
    // mount once; track switches via setLofiTrack
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void setLofiVolume(settings.ambientVolume);
  }, [settings.ambientVolume]);

  useEffect(() => {
    void setLofiTrack(trackId);
  }, [trackId]);

  async function onToggle() {
    if (!settings.ambientEnabled) {
      setAmbientEnabled(true);
      await playLofi();
      return;
    }
    if (playing) {
      pauseLofi();
    } else {
      await playLofi();
    }
  }

  async function onSelectTrack(id: AmbientTrackId) {
    setAmbientTrackId(id);
    await setLofiTrack(id);
    if (!settings.ambientEnabled) {
      setAmbientEnabled(true);
    }
    await playLofi();
  }

  return (
    <div
      className={cn(
        "glass liquid-glass mx-auto w-full max-w-lg overflow-hidden rounded-2xl",
      )}
    >
      <div className="flex items-start justify-between gap-3 px-4 pt-3">
        <div>
          <p className="text-sm font-medium">{t(lang, "ambient_title")}</p>
        </div>
        <div className="flex items-center gap-1">
          <a
            href={watchUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex size-9 items-center justify-center rounded-md text-[var(--color-muted)] hover:bg-[var(--color-accent)] hover:text-[var(--color-foreground)]"
            aria-label={t(lang, "ambient_open_youtube")}
            title={t(lang, "ambient_open_youtube")}
          >
            <ExternalLink className="size-4" />
          </a>
          <Button
            type="button"
            size="icon"
            variant={playing ? "default" : "secondary"}
            aria-label={
              playing ? t(lang, "ambient_pause") : t(lang, "ambient_play")
            }
            onClick={() => void onToggle()}
          >
            {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 px-4">
        {STREAM_ORDER.map((id) => {
          const active = trackId === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => void onSelectTrack(id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                active
                  ? "border-[var(--color-primary)] bg-[var(--color-accent)] text-[var(--color-foreground)]"
                  : "border-[var(--color-card-border)] text-[var(--color-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-foreground)]",
              )}
            >
              {t(lang, STREAMS[id].labelKey)}
            </button>
          );
        })}
      </div>

      <div className="relative mx-4 mt-3 aspect-video overflow-hidden rounded-xl bg-black/40">
        <div ref={hostRef} className="absolute inset-0 [&_iframe]:h-full [&_iframe]:w-full" />
        {!ready ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-white/70">
            {t(lang, "ambient_loading")}
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-3 px-4 py-3">
        <Volume2 className="size-4 shrink-0 text-[var(--color-muted)]" />
        <Slider
          value={[Math.round(settings.ambientVolume * 100)]}
          min={0}
          max={100}
          step={5}
          onValueChange={(v) => {
            const next = ((v[0] ?? 35) as number) / 100;
            setAmbientVolumeSetting(next);
            void setLofiVolume(next);
          }}
          aria-label={t(lang, "ambient_volume")}
        />
        <span className="w-8 text-right text-xs tabular-nums text-[var(--color-muted)]">
          {Math.round(settings.ambientVolume * 100)}%
        </span>
      </div>
    </div>
  );
}
