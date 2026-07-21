"use client";

import { useEffect } from "react";
import { remainingMs } from "@pomodoro/core";
import { pauseLofi, playLofi } from "@/lib/lofi-player";
import { t } from "@/lib/i18n";
import { useTickMs } from "@/hooks/use-tick";
import { useAppStore } from "@/store/app-store";

function formatClock(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    el.isContentEditable
  );
}

/** Space start/pause, N skip, M mute Lofi Girl — ignored while typing */
export function KeyboardShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;

      const store = useAppStore.getState();
      const { timer, settings } = store;

      if (e.code === "Space") {
        e.preventDefault();
        if (timer.runState === "running") store.pause();
        else store.start();
        return;
      }

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        store.skipPhase();
        return;
      }

      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        if (!settings.ambientEnabled) {
          store.setAmbientEnabled(true);
          return;
        }
        void (async () => {
          const { getLofiState } = await import("@/lib/lofi-player");
          const state = getLofiState();
          if (state.playing) pauseLofi();
          else await playLofi();
        })();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return null;
}

/** Keep the tab title in sync with remaining time */
export function DocumentTitleSync() {
  const nowMs = useTickMs(1000);
  const timer = useAppStore((s) => s.timer);
  const settings = useAppStore((s) => s.settings);

  useEffect(() => {
    const rem = remainingMs(timer, settings, nowMs);
    const clock = formatClock(rem);
    const phase = t(settings.language, 
      timer.phase === "work"
        ? "phase_focus"
        : timer.phase === "shortBreak"
          ? "phase_short_break"
          : "phase_long_break",
    );
    const running = timer.runState === "running";
    document.title = running ? `${clock} · ${phase} · Pomo` : `Pomo · ${phase}`;
  }, [timer, settings, nowMs]);

  return null;
}
