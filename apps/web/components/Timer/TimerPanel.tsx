"use client";

import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { remainingMs } from "@pomodoro/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SettingsDialog } from "@/components/Settings/SettingsDialog";
import { useTickMs } from "@/hooks/use-tick";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/store/app-store";
import { TimerRing } from "./TimerRing";

function formatClock(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function phaseTitle(
  lang: "en" | "de",
  phase: "work" | "shortBreak" | "longBreak",
): string {
  switch (phase) {
    case "work":
      return t(lang, "phase_focus");
    case "shortBreak":
      return t(lang, "phase_short_break");
    case "longBreak":
      return t(lang, "phase_long_break");
  }
}

export function TimerPanel() {
  const nowMs = useTickMs(500);
  const timer = useAppStore((s) => s.timer);
  const settings = useAppStore((s) => s.settings);
  const tasks = useAppStore((s) => s.tasks);
  const milestoneMessage = useAppStore((s) => s.milestoneMessage);
  const clearMilestone = useAppStore((s) => s.clearMilestone);
  const start = useAppStore((s) => s.start);
  const pause = useAppStore((s) => s.pause);
  const resetPhaseProgress = useAppStore((s) => s.resetPhaseProgress);
  const skipPhase = useAppStore((s) => s.skipPhase);
  const lang = settings.language;

  const rem = remainingMs(timer, settings, nowMs);
  const activeTask =
    timer.activeTaskId == null
      ? null
      : tasks.find((t) => t.id === timer.activeTaskId) ?? null;

  const totalInCycle = settings.longBreakAfter;
  const currentWorkIndex =
    timer.phase === "work" ? timer.workSessionsInCycle + 1 : timer.workSessionsInCycle;
  const willLongBreakNext =
    timer.phase === "work" && currentWorkIndex >= totalInCycle;

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
        <div className="min-w-0">
          <p className="text-sm font-medium tracking-wide text-[var(--color-muted)]">
            {phaseTitle(lang, timer.phase)}
          </p>
          {activeTask ? (
            <p className="mt-1 truncate text-sm text-[var(--color-foreground)]">
              {activeTask.label}
            </p>
          ) : null}
        </div>
        <SettingsDialog />
      </CardHeader>
      <CardContent className="space-y-5">
        <TimerRing nowMs={nowMs}>
          <p className="font-mono text-[2.75rem] font-semibold leading-none tracking-tight tabular-nums sm:text-5xl">
            {formatClock(rem)}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
            <span className="pill pill-active">
              {t(lang, "timer_session_of", {
                current: currentWorkIndex,
                total: totalInCycle,
              })}
            </span>
            {willLongBreakNext ? (
              <span className="pill">
                {t(lang, "timer_long_break_next")}
              </span>
            ) : null}
          </div>
        </TimerRing>

        {milestoneMessage ? (
          <button
            type="button"
            onClick={() => clearMilestone()}
            className="inset-panel w-full text-left text-sm text-[var(--color-foreground)] transition-colors hover:bg-[color-mix(in_oklch,var(--color-accent),transparent_30%)]"
          >
            {milestoneMessage}
            <span className="mt-1 block text-xs text-[var(--color-muted)]">
              {t(lang, "timer_tap_to_dismiss")}
            </span>
          </button>
        ) : null}

        <div className="flex flex-wrap items-center justify-center gap-2">
          {timer.runState === "running" ? (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => pause()}
            >
              <Pause />
              {t(lang, "action_pause")}
            </Button>
          ) : (
            <Button type="button" size="lg" onClick={() => start()}>
              <Play />
              {timer.runState === "paused"
                ? t(lang, "action_resume")
                : t(lang, "action_start")}
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t(lang, "action_reset")}
            title={t(lang, "action_reset")}
            onClick={() => resetPhaseProgress()}
          >
            <RotateCcw />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t(lang, "action_skip")}
            title={t(lang, "action_skip")}
            onClick={() => skipPhase()}
          >
            <SkipForward />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
