import { buildFocusBlockState, type FocusBlockState } from "@pomodoro/core";
import type { Settings, TimerSnapshot } from "@pomodoro/core";

export const FOCUS_BLOCK_STORAGE_KEY = "pomodoro:focus-block";

export function syncFocusBlockState(
  timer: TimerSnapshot,
  settings: Settings,
  nowMs: number,
): FocusBlockState {
  const state = buildFocusBlockState(timer, settings, nowMs);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(FOCUS_BLOCK_STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* quota or private mode */
    }
    window.postMessage({ type: "POMO_FOCUS_SYNC", ...state }, "*");
  }
  return state;
}

export function clearFocusBlockState(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(FOCUS_BLOCK_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  window.postMessage(
    {
      type: "POMO_FOCUS_SYNC",
      blockingActive: false,
      blockedSites: [],
      endsAt: null,
      updatedAt: Date.now(),
    },
    "*",
  );
}
