import type { Settings, Task } from "./types";

/**
 * Remaining open pomodoros across incomplete tasks
 * (estimated − completed, floored at 0).
 */
export function remainingOpenPomos(tasks: Task[]): number {
  return tasks
    .filter((t) => !t.done)
    .reduce((sum, t) => {
      const left = Math.max(0, t.estimatedPomos - t.completedPomos);
      return sum + left;
    }, 0);
}

/**
 * Wall-clock ms needed to finish remaining open pomodoros,
 * including short breaks and long breaks per settings.
 */
export function estimateFinishDurationMs(
  openPomos: number,
  settings: Settings,
): number {
  if (openPomos <= 0) return 0;

  const { workDuration, shortBreak, longBreak, longBreakAfter } = settings;
  let totalSec = 0;

  for (let i = 1; i <= openPomos; i += 1) {
    totalSec += workDuration;
    if (i < openPomos) {
      totalSec += i % longBreakAfter === 0 ? longBreak : shortBreak;
    }
  }

  return totalSec * 1000;
}

/** Absolute finish timestamp (epoch ms), or null if nothing left. */
export function estimateFinishAt(
  tasks: Task[],
  settings: Settings,
  nowMs: number = Date.now(),
): number | null {
  const open = remainingOpenPomos(tasks);
  if (open <= 0) return null;
  return nowMs + estimateFinishDurationMs(open, settings);
}
