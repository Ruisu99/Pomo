"use client";

import { create } from "zustand";
import {
  type AmbientTrackId,
  type AppPersistedState,
  type Project,
  type Session,
  type Settings,
  type Task,
  type TaskTemplate,
  type TimerSnapshot,
  clampSettings,
  completedWorkToday,
  createIdleTimer,
  createLocalStorageAdapter,
  DEFAULT_SETTINGS,
  isExpired,
  isStrictFocusActive,
  nextPhaseAfterComplete,
  pauseTimer,
  remainingMs,
  resumeTimer,
  startTimer,
} from "@pomodoro/core";
import {
  pauseLofi,
  playLofi,
  setLofiVolume,
} from "@/lib/lofi-player";
import { notifyPhaseComplete } from "@/lib/notify";
import { playPhaseCompleteChime } from "@/lib/sound";

const storage = createLocalStorageAdapter();

const PROJECT_COLORS = [
  "#df3c3c",
  "#e67e22",
  "#27ae60",
  "#2980b9",
  "#8e44ad",
  "#16a085",
  "#c0392b",
  "#2c3e50",
];

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
  projects: Project[];
  templates: TaskTemplate[];
  timer: TimerSnapshot;
};

function loadInitial(): PersistedSlice {
  const raw = storage.load();
  if (!raw) {
    return {
      settings: DEFAULT_SETTINGS,
      tasks: [],
      sessions: [],
      projects: [],
      templates: [],
      timer: createIdleTimer(DEFAULT_SETTINGS, null),
    };
  }
  return {
    settings: clampSettings(raw.settings),
    tasks: Array.isArray(raw.tasks) ? raw.tasks : [],
    sessions: Array.isArray(raw.sessions) ? raw.sessions : [],
    projects: Array.isArray(raw.projects) ? raw.projects : [],
    templates: Array.isArray(raw.templates) ? raw.templates : [],
    timer: normalizeTimer(raw.timer),
  };
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSave(get: () => AppState) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const s = get();
    const payload: AppPersistedState = {
      version: 2,
      settings: s.settings,
      tasks: s.tasks,
      sessions: s.sessions,
      projects: s.projects,
      templates: s.templates,
      timer: s.timer,
    };
    storage.save(payload);
  }, 250);
}

function milestoneForCount(n: number, language: "en" | "de"): string | null {
  if (language === "de") {
    if (n === 4) return "Nice — 4 Fokus-Sessions heute.";
    if (n === 8) return "8 Sessions heute. Stark.";
    if (n > 0 && n % 10 === 0) return `${n} Sessions heute. Bleib dran.`;
    return null;
  }
  if (n === 4) return "Nice — 4 focus sessions today.";
  if (n === 8) return "8 sessions today. You’re on fire.";
  if (n > 0 && n % 10 === 0) return `${n} sessions today. Keep the rhythm.`;
  return null;
}

async function syncAmbientFromSettings(
  settings: Settings,
  opts?: { forcePlay?: boolean; forcePause?: boolean },
) {
  await setLofiVolume(settings.ambientVolume);
  if (opts?.forcePause || !settings.ambientEnabled) {
    pauseLofi();
    return;
  }
  if (opts?.forcePlay) {
    await playLofi();
  }
}

type AppState = {
  settings: Settings;
  tasks: Task[];
  sessions: Session[];
  projects: Project[];
  templates: TaskTemplate[];
  timer: TimerSnapshot;
  milestoneMessage: string | null;
  projectFilterId: string | null | "all";

  hydrate: () => void;
  patchSettings: (partial: Partial<Settings>) => void;
  setFocusModeEnabled: (enabled: boolean) => void;

  addTask: (label: string, estimatedPomos: number, projectId?: string | null) => void;
  updateTaskEstimate: (id: string, estimatedPomos: number) => void;
  updateTaskProject: (id: string, projectId: string | null) => void;
  toggleTaskDone: (id: string) => void;
  removeTask: (id: string) => void;
  setActiveTask: (id: string | null) => void;

  addProject: (name: string, color?: string) => void;
  updateProject: (id: string, partial: Partial<Pick<Project, "name" | "color" | "archived">>) => void;
  removeProject: (id: string) => void;
  setProjectFilter: (id: string | null | "all") => void;

  saveTemplateFromTask: (taskId: string) => void;
  addTaskFromTemplate: (templateId: string) => void;
  removeTemplate: (id: string) => void;

  setAmbientEnabled: (enabled: boolean) => void;
  setAmbientTrackId: (trackId: AmbientTrackId) => void;
  setAmbientVolumeSetting: (volume: number) => void;
  toggleAmbientPlayback: () => void;

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
  projects: [] as Project[],
  templates: [] as TaskTemplate[],
  timer: createIdleTimer(DEFAULT_SETTINGS, null),
};

function startIfIdle(get: () => AppState, set: (partial: Partial<AppState>) => void) {
  const { timer, settings } = get();
  if (timer.runState === "running") return;
  const now = Date.now();
  const next =
    timer.runState === "paused"
      ? resumeTimer(timer, now)
      : startTimer({ ...timer, runState: "idle" }, settings, now);
  set({ timer: next });
  scheduleSave(get);
  if (settings.ambientEnabled && settings.ambientAutoPlayOnStart) {
    void playLofi();
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  ...serverSnapshot,
  milestoneMessage: null,
  projectFilterId: "all",

  hydrate: () => {
    if (typeof window === "undefined") return;
    const raw = storage.load();
    const data = loadInitial();
    set({ ...data, milestoneMessage: null, projectFilterId: "all" });
    if (!raw?.settings || (raw.settings as Partial<Settings>).language == null) {
      const browserLang = navigator.language?.toLowerCase().startsWith("de")
        ? "de"
        : "en";
      set((s) => ({ settings: clampSettings({ ...s.settings, language: browserLang }) }));
      scheduleSave(get);
    }
    const { settings, timer } = get();
    void syncAmbientFromSettings(settings);
    if (settings.focusModeEnabled && timer.runState !== "running") {
      startIfIdle(get, (partial) => set(partial));
    }
  },

  patchSettings: (partial) => {
    set((s) => ({ settings: clampSettings({ ...s.settings, ...partial }) }));
    const next = get().settings;
    void syncAmbientFromSettings(next);
    scheduleSave(get);
  },

  setFocusModeEnabled: (enabled) => {
    const prev = get();
    if (enabled) {
      set({
        settings: clampSettings({
          ...prev.settings,
          focusModeEnabled: true,
          autoAdvance: true,
        }),
      });
      scheduleSave(get);
      startIfIdle(get, (partial) => set(partial));
      return;
    }
    const { timer, settings } = get();
    if (
      timer.runState === "running" &&
      timer.phase === "work" &&
      settings.strictFocus
    ) {
      set({ timer: pauseTimer(timer, settings, Date.now()) });
    }
    set({
      settings: clampSettings({ ...get().settings, focusModeEnabled: false }),
    });
    scheduleSave(get);
  },

  addTask: (label, estimatedPomos, projectId = null) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const task: Task = {
      id: crypto.randomUUID(),
      label: trimmed,
      estimatedPomos: Math.max(1, Math.min(24, Math.floor(estimatedPomos))),
      completedPomos: 0,
      done: false,
      projectId,
      notes: "",
      createdAt: Date.now(),
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

  updateTaskProject: (id, projectId) => {
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, projectId } : t)),
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

  addProject: (name, color) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const used = get().projects.length;
    const project: Project = {
      id: crypto.randomUUID(),
      name: trimmed,
      color: color ?? PROJECT_COLORS[used % PROJECT_COLORS.length]!,
      archived: false,
    };
    set((s) => ({ projects: [...s.projects, project] }));
    scheduleSave(get);
  },

  updateProject: (id, partial) => {
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...partial } : p)),
    }));
    scheduleSave(get);
  },

  removeProject: (id) => {
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      tasks: s.tasks.map((t) =>
        t.projectId === id ? { ...t, projectId: null } : t,
      ),
      templates: s.templates.map((t) =>
        t.projectId === id ? { ...t, projectId: null } : t,
      ),
      projectFilterId: s.projectFilterId === id ? "all" : s.projectFilterId,
    }));
    scheduleSave(get);
  },

  setProjectFilter: (id) => set({ projectFilterId: id }),

  saveTemplateFromTask: (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;
    const template: TaskTemplate = {
      id: crypto.randomUUID(),
      label: task.label,
      estimatedPomos: task.estimatedPomos,
      projectId: task.projectId,
    };
    set((s) => ({ templates: [...s.templates, template] }));
    scheduleSave(get);
  },

  addTaskFromTemplate: (templateId) => {
    const template = get().templates.find((t) => t.id === templateId);
    if (!template) return;
    get().addTask(template.label, template.estimatedPomos, template.projectId);
  },

  removeTemplate: (id) => {
    set((s) => ({ templates: s.templates.filter((t) => t.id !== id) }));
    scheduleSave(get);
  },

  setAmbientEnabled: (enabled) => {
    set((s) => ({
      settings: clampSettings({ ...s.settings, ambientEnabled: enabled }),
    }));
    const { settings } = get();
    void syncAmbientFromSettings(settings, {
      forcePlay: enabled,
      forcePause: !enabled,
    });
    scheduleSave(get);
  },

  setAmbientTrackId: (trackId) => {
    set((s) => ({
      settings: clampSettings({ ...s.settings, ambientTrackId: trackId }),
    }));
    scheduleSave(get);
  },

  setAmbientVolumeSetting: (volume) => {
    set((s) => ({
      settings: clampSettings({ ...s.settings, ambientVolume: volume }),
    }));
    void setLofiVolume(volume);
    scheduleSave(get);
  },

  toggleAmbientPlayback: () => {
    const { settings } = get();
    if (!settings.ambientEnabled) {
      get().setAmbientEnabled(true);
      return;
    }
    void (async () => {
      const { getLofiState } = await import("@/lib/lofi-player");
      const state = getLofiState();
      if (state.playing) pauseLofi();
      else await playLofi();
    })();
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
    if (settings.ambientEnabled && settings.ambientAutoPlayOnStart) {
      void playLofi();
    }
  },

  pause: () => {
    const { timer, settings } = get();
    if (timer.runState !== "running") return;
    if (isStrictFocusActive(timer, settings)) return;
    set({ timer: pauseTimer(timer, settings, Date.now()) });
    scheduleSave(get);
  },

  resume: () => {
    get().start();
  },

  resetPhaseProgress: () => {
    const { timer, settings } = get();
    if (isStrictFocusActive(timer, settings)) return;
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
    if (isStrictFocusActive(timer, settings)) return;
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

    const activeTask =
      phase === "work" && timer.activeTaskId
        ? tasks.find((t) => t.id === timer.activeTaskId)
        : null;

    const session: Session = {
      id: crypto.randomUUID(),
      taskId: phase === "work" ? timer.activeTaskId : null,
      projectId: activeTask?.projectId ?? null,
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
    notifyPhaseComplete(settings.language, prevPhase, nextPhaseKind);

    let milestoneMessage: string | null = null;
    if (phase === "work") {
      const today = completedWorkToday(nextSessions, new Date(nowMs));
      milestoneMessage = milestoneForCount(today, settings.language);
    }

    const shouldAutoAdvance = settings.autoAdvance || settings.focusModeEnabled;

    if (shouldAutoAdvance) {
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
