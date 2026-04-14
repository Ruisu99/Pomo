"use client";

import { create } from "zustand";
import {
  type AppPersistedState,
  type Session,
  type Settings,
  type Task,
  type TimerSnapshot,
  clampSettings,
  completedWorkToday,
  createIdleTimer,
  createLocalStorageAdapter,
  DEFAULT_SETTINGS,
  isExpired,
  nextPhaseAfterComplete,
  pauseTimer,
  remainingMs,
  resumeTimer,
  startTimer,
} from "@pomodoro/core";
import { notifyPhaseComplete } from "@/lib/notify";
import { playPhaseCompleteChime } from "@/lib/sound";

const storage = createLocalStorageAdapter();

function normalizeTimer(raw: unknown): TimerSnapshot {
  const t = (raw ?? {}) as Partial<TimerSnapshot>;
  return {
    runState: t.runState ?? "idle",
    phase: t.phase ?? "work",
    endsAt: t.endsAt ?? null,
    pausedRemainingMs: t.pausedRemainingMs ?? null,
    phaseStartedAt: t.phaseStartedAt ?? null,
    workSessionsInCycle: t.workSessionsInCycle ?? 0,
    activeTaskId: t.activeTaskId ?? null,
  };
}

type PersistedSlice = {
  settings: Settings;
  tasks: Task[];
  sessions: Session[];
  timer: TimerSnapshot;
};

function loadInitial(): PersistedSlice {
  const raw = storage.load();
  if (!raw) {
    return {
      settings: DEFAULT_SETTINGS,
      tasks: [],
      sessions: [],
      timer: createIdleTimer(DEFAULT_SETTINGS, null),
    };
  }
  return {
    settings: clampSettings(raw.settings),
    tasks: Array.isArray(raw.tasks) ? raw.tasks : [],
    sessions: Array.isArray(raw.sessions) ? raw.sessions : [],
    timer: normalizeTimer(raw.timer),
  };
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSave(get: () => AppState) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const s = get();
    const payload: AppPersistedState = {
      version: 1,
      settings: s.settings,
      tasks: s.tasks,
      sessions: s.sessions,
      timer: s.timer,
    };
    storage.save(payload);
  }, 250);
}

function milestoneForCount(n: number): string | null {
  if (n === 4) return "Nice — 4 focus sessions today.";
  if (n === 8) return "8 sessions today. You’re on fire.";
  if (n > 0 && n % 10 === 0) return `${n} sessions today. Keep the rhythm.`;
  return null;
}

type AppState = {
  settings: Settings;
  tasks: Task[];
  sessions: Session[];
  timer: TimerSnapshot;
  milestoneMessage: string | null;

  hydrate: () => void;
  patchSettings: (partial: Partial<Settings>) => void;
  addTask: (label: string, estimatedPomos: number) => void;
  updateTaskEstimate: (id: string, estimatedPomos: number) => void;
  toggleTaskDone: (id: string) => void;
  removeTask: (id: string) => void;
  setActiveTask: (id: string | null) => void;

  start: () => void;
  pause: () => void;
  resume: () => void;
  resetPhaseProgress: () => void;
  skipPhase: () => void;

  /** Call frequently while running; completes phase when due */
  sync: (nowMs: number) => void;
  clearMilestone: () => void;
};

const serverSnapshot = {
  settings: DEFAULT_SETTINGS,
  tasks: [] as Task[],
  sessions: [] as Session[],
  timer: createIdleTimer(DEFAULT_SETTINGS, null),
};

export const useAppStore = create<AppState>((set, get) => ({
  ...serverSnapshot,
  milestoneMessage: null,

  hydrate: () => {
    if (typeof window === "undefined") return;
    const data = loadInitial();
    set({ ...data, milestoneMessage: null });
  },

  patchSettings: (partial) => {
    set((s) => ({ settings: clampSettings({ ...s.settings, ...partial }) }));
    scheduleSave(get);
  },

  addTask: (label, estimatedPomos) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const task: Task = {
      id: crypto.randomUUID(),
      label: trimmed,
      estimatedPomos: Math.max(1, Math.min(24, Math.floor(estimatedPomos))),
      completedPomos: 0,
      done: false,
    };
    set((s) => {
      const next = { tasks: [...s.tasks, task], timer: s.timer };
      if (s.timer.activeTaskId == null && !task.done) {
        next.timer = { ...s.timer, activeTaskId: task.id };
      }
      return next;
    });
    scheduleSave(get);
  },

  updateTaskEstimate: (id, estimatedPomos) => {
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              estimatedPomos: Math.max(1, Math.min(24, Math.floor(estimatedPomos))),
            }
          : t,
      ),
    }));
    scheduleSave(get);
  },

  toggleTaskDone: (id) => {
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t,
      ),
    }));
    scheduleSave(get);
  },

  removeTask: (id) => {
    set((s) => {
      const tasks = s.tasks.filter((t) => t.id !== id);
      const activeTaskId =
        s.timer.activeTaskId === id ? tasks.find((t) => !t.done)?.id ?? null : s.timer.activeTaskId;
      return { tasks, timer: { ...s.timer, activeTaskId } };
    });
    scheduleSave(get);
  },

  setActiveTask: (id) => {
    set((s) => ({
      timer: { ...s.timer, activeTaskId: id },
    }));
    scheduleSave(get);
  },

  start: () => {
    const { timer, settings } = get();
    if (timer.runState === "running") return;
    const now = Date.now();
    const next =
      timer.runState === "paused"
        ? resumeTimer(timer, now)
        : startTimer({ ...timer, runState: "idle" }, settings, now);
    set({ timer: next });
    scheduleSave(get);
  },

  pause: () => {
    const { timer, settings } = get();
    if (timer.runState !== "running") return;
    set({ timer: pauseTimer(timer, settings, Date.now()) });
    scheduleSave(get);
  },

  resume: () => {
    get().start();
  },

  resetPhaseProgress: () => {
    set((s) => ({
      timer: {
        ...s.timer,
        runState: "idle",
        endsAt: null,
        pausedRemainingMs: null,
        phaseStartedAt: null,
      },
      milestoneMessage: null,
    }));
    scheduleSave(get);
  },

  skipPhase: () => {
    const { settings, timer } = get();
    let t = timer;
    if (t.runState === "running") {
      t = pauseTimer(t, settings, Date.now());
    }
    const completedWasWork = t.phase === "work";
    const next = nextPhaseAfterComplete(t, settings, completedWasWork);
    set({
      timer: {
        ...next,
        runState: "idle",
        endsAt: null,
        pausedRemainingMs: null,
        phaseStartedAt: null,
      },
      milestoneMessage: null,
    });
    scheduleSave(get);
  },

  sync: (nowMs) => {
    const state = get();
    if (!isExpired(state.timer, nowMs)) return;

    const { timer, settings, sessions, tasks } = state;
    const phase = timer.phase;
    const completedWasWork = phase === "work";

    const phaseDur =
      phase === "work"
        ? settings.workDuration
        : phase === "shortBreak"
          ? settings.shortBreak
          : settings.longBreak;

    const startedAt =
      timer.phaseStartedAt ?? nowMs - phaseDur * 1000;

    const session: Session = {
      id: crypto.randomUUID(),
      taskId: phase === "work" ? timer.activeTaskId : null,
      startedAt: startedAt,
      duration: phaseDur,
      type: phase,
      completed: true,
    };

    let nextSessions = [...sessions, session];
    let nextTasks = tasks;

    if (phase === "work" && timer.activeTaskId) {
      nextTasks = tasks.map((t) =>
        t.id === timer.activeTaskId
          ? { ...t, completedPomos: t.completedPomos + 1 }
          : t,
      );
    }

    const afterPhase = nextPhaseAfterComplete(
      { ...timer, runState: "running" },
      settings,
      completedWasWork,
    );

    const nextPhaseKind = afterPhase.phase;
    const prevPhase = phase;

    if (settings.soundEnabled) {
      void playPhaseCompleteChime(settings.soundVolume);
    }
    notifyPhaseComplete(prevPhase, nextPhaseKind);

    let milestoneMessage: string | null = null;
    if (phase === "work") {
      const today = completedWorkToday(nextSessions, new Date(nowMs));
      milestoneMessage = milestoneForCount(today);
    }

    if (settings.autoAdvance) {
      const running = startTimer(afterPhase, settings, nowMs);
      set({
        sessions: nextSessions,
        tasks: nextTasks,
        timer: running,
        milestoneMessage,
      });
    } else {
      set({
        sessions: nextSessions,
        tasks: nextTasks,
        timer: afterPhase,
        milestoneMessage,
      });
    }
    scheduleSave(get);
  },

  clearMilestone: () => set({ milestoneMessage: null }),
}));

export function selectRemainingMs(state: AppState, nowMs: number): number {
  return remainingMs(state.timer, state.settings, nowMs);
}
