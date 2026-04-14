export type SessionType = "work" | "shortBreak" | "longBreak";

export type Session = {
  id: string;
  taskId: string | null;
  startedAt: number;
  duration: number;
  type: SessionType;
  completed: boolean;
};

export type Task = {
  id: string;
  label: string;
  estimatedPomos: number;
  completedPomos: number;
  done: boolean;
};

export type ThemeMode = "light" | "dark" | "system";

export type Language = "en" | "de";

export type BackgroundPreset = "solid" | "pomoRed" | "customImage";

export type Settings = {
  workDuration: number;
  shortBreak: number;
  longBreak: number;
  longBreakAfter: number;
  autoAdvance: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  theme: ThemeMode;
  language: Language;
  backgroundPreset: BackgroundPreset;
  backgroundSolid: string;
  backgroundImageDataUrl: string | null;
};

export type PhaseKind = "work" | "shortBreak" | "longBreak";

export type TimerRunState = "idle" | "running" | "paused";

/** Serializable timer snapshot for persistence */
export type TimerSnapshot = {
  runState: TimerRunState;
  phase: PhaseKind;
  /** When running: wall-clock end time (ms). When paused: null */
  endsAt: number | null;
  /** Remaining ms when paused; ignored when running */
  pausedRemainingMs: number | null;
  /** Wall-clock ms when current phase entered running (for session log) */
  phaseStartedAt: number | null;
  /** Work sessions completed in current cycle (0 before first work of cycle) */
  workSessionsInCycle: number;
  /** Active task id for current/next work session */
  activeTaskId: string | null;
};

export type AppPersistedState = {
  version: 1;
  settings: Settings;
  tasks: Task[];
  sessions: Session[];
  timer: TimerSnapshot;
};
