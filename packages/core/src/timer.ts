import type { PhaseKind, Settings, TimerSnapshot } from "./types";

export function phaseDurationSeconds(
  phase: PhaseKind,
  settings: Settings,
): number {
  switch (phase) {
    case "work":
      return settings.workDuration;
    case "shortBreak":
      return settings.shortBreak;
    case "longBreak":
      return settings.longBreak;
  }
}

export function createIdleTimer(
  settings: Settings,
  activeTaskId: string | null = null,
): TimerSnapshot {
  return {
    runState: "idle",
    phase: "work",
    endsAt: null,
    pausedRemainingMs: null,
    phaseStartedAt: null,
    workSessionsInCycle: 0,
    activeTaskId,
  };
}

export function startTimer(
  snapshot: TimerSnapshot,
  settings: Settings,
  nowMs: number,
): TimerSnapshot {
  const durMs = phaseDurationSeconds(snapshot.phase, settings) * 1000;
  return {
    ...snapshot,
    runState: "running",
    endsAt: nowMs + durMs,
    pausedRemainingMs: null,
    phaseStartedAt: nowMs,
  };
}

export function pauseTimer(
  snapshot: TimerSnapshot,
  settings: Settings,
  nowMs: number,
): TimerSnapshot {
  if (snapshot.runState !== "running" || snapshot.endsAt == null) {
    return snapshot;
  }
  const remaining = Math.max(0, snapshot.endsAt - nowMs);
  return {
    ...snapshot,
    runState: "paused",
    endsAt: null,
    pausedRemainingMs: remaining,
    phaseStartedAt: snapshot.phaseStartedAt,
  };
}

export function resumeTimer(snapshot: TimerSnapshot, nowMs: number): TimerSnapshot {
  if (snapshot.runState !== "paused" || snapshot.pausedRemainingMs == null) {
    return snapshot;
  }
  return {
    ...snapshot,
    runState: "running",
    endsAt: nowMs + snapshot.pausedRemainingMs,
    pausedRemainingMs: null,
    phaseStartedAt: snapshot.phaseStartedAt,
  };
}

/** Skip current phase and move to next (used when idle between phases) */
export function nextPhaseAfterComplete(
  snapshot: TimerSnapshot,
  settings: Settings,
  completedWasWork: boolean,
): TimerSnapshot {
  let phase: PhaseKind = snapshot.phase;
  let workSessionsInCycle = snapshot.workSessionsInCycle;

  if (completedWasWork) {
    const nextCount = workSessionsInCycle + 1;
    if (nextCount >= settings.longBreakAfter) {
      phase = "longBreak";
      workSessionsInCycle = 0;
    } else {
      phase = "shortBreak";
      workSessionsInCycle = nextCount;
    }
  } else {
    phase = "work";
  }

  return {
    ...snapshot,
    runState: "idle",
    phase,
    endsAt: null,
    pausedRemainingMs: null,
    phaseStartedAt: null,
    workSessionsInCycle,
  };
}

export function remainingMs(
  snapshot: TimerSnapshot,
  settings: Settings,
  nowMs: number,
): number {
  if (snapshot.runState === "running" && snapshot.endsAt != null) {
    return Math.max(0, snapshot.endsAt - nowMs);
  }
  if (snapshot.runState === "paused" && snapshot.pausedRemainingMs != null) {
    return snapshot.pausedRemainingMs;
  }
  return phaseDurationSeconds(snapshot.phase, settings) * 1000;
}

export function isExpired(
  snapshot: TimerSnapshot,
  nowMs: number,
): boolean {
  return (
    snapshot.runState === "running" &&
    snapshot.endsAt != null &&
    snapshot.endsAt <= nowMs
  );
}
