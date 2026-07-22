"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ExternalLink, Pause, Play, Volume2 } from "lucide-react";
import type { AmbientTrackId } from "@pomodoro/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  const [showVideo, setShowVideo] = useState(true);

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
    <Card className="w-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-3">
        <p className="text-sm font-medium">{t(lang, "ambient_title")}</p>
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon">
            <a
              href={watchUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={t(lang, "ambient_open_youtube")}
              title={t(lang, "ambient_open_youtube")}
            >
              <ExternalLink className="size-4" />
            </a>
          </Button>
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
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {STREAM_ORDER.map((id) => {
            const active = trackId === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => void onSelectTrack(id)}
                className={cn("pill", active && "pill-active")}
              >
                {t(lang, STREAMS[id].labelKey)}
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

        <button
          type="button"
          onClick={() => setShowVideo((v) => !v)}
          className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]"
          aria-expanded={showVideo}
        >
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform",
              showVideo && "rotate-180",
            )}
          />
          {showVideo
            ? t(lang, "ambient_hide_video")
            : t(lang, "ambient_show_video")}
        </button>

        {/* Keep player mounted so audio continues when collapsed */}
        <div
          className={cn(
            "relative overflow-hidden rounded-xl bg-black/45 transition-[height,opacity] duration-200",
            showVideo ? "aspect-video opacity-100" : "h-0 opacity-0",
          )}
          aria-hidden={!showVideo}
        >
          <div
            ref={hostRef}
            className="absolute inset-0 min-h-[180px] [&_iframe]:h-full [&_iframe]:w-full"
          />
          {showVideo && !ready ? (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-white/70">
              {t(lang, "ambient_loading")}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
