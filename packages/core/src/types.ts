export type SessionType = "work" | "shortBreak" | "longBreak";

export type AmbientTrackId = "lofi" | "jazz";

export type Session = {
  id: string;
  taskId: string | null;
  projectId: string | null;
  startedAt: number;
  duration: number;
  type: SessionType;
  completed: boolean;
};

export type Project = {
  id: string;
  name: string;
  color: string;
  archived: boolean;
};

export type Task = {
  id: string;
  label: string;
  estimatedPomos: number;
  completedPomos: number;
  done: boolean;
  projectId: string | null;
  notes: string;
  createdAt: number;
};

export type TaskTemplate = {
  id: string;
  label: string;
  estimatedPomos: number;
  projectId: string | null;
};

export type ThemeMode = "light" | "dark" | "system";

export type Language = "en" | "de";

export type BackgroundPreset =
  | "solid"
  | "pomoRed"
  | "pomoSlate"
  | "pomoGold"
  | "pixelCity"
  | "customImage";

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
  ambientEnabled: boolean;
  ambientTrackId: AmbientTrackId;
  ambientVolume: number;
  ambientAutoPlayOnStart: boolean;
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
  version: 2;
  settings: Settings;
  tasks: Task[];
  sessions: Session[];
  projects: Project[];
  templates: TaskTemplate[];
  timer: TimerSnapshot;
};

/** Legacy v1 shape for migration */
export type AppPersistedStateV1 = {
  version: 1;
  settings: Partial<Settings> & Record<string, unknown>;
  tasks: Array<Partial<Task> & { id: string; label: string }>;
  sessions: Array<Partial<Session> & { id: string }>;
  timer: Partial<TimerSnapshot>;
};
