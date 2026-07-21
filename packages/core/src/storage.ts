import { clampSettings, DEFAULT_SETTINGS } from "./settings";
import { createIdleTimer } from "./timer";
import type {
  AppPersistedState,
  AppPersistedStateV1,
  Project,
  Session,
  Task,
  TaskTemplate,
  TimerSnapshot,
} from "./types";

const STORAGE_KEY = "pomodoro:v2";
const LEGACY_STORAGE_KEY = "pomodoro:v1";

export type StorageAdapter = {
  load(): AppPersistedState | null;
  save(state: AppPersistedState): void;
};

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

function normalizeTask(raw: Partial<Task> & { id: string; label: string }): Task {
  return {
    id: raw.id,
    label: raw.label,
    estimatedPomos: Math.max(1, Math.min(24, Math.floor(raw.estimatedPomos ?? 1))),
    completedPomos: Math.max(0, Math.floor(raw.completedPomos ?? 0)),
    done: Boolean(raw.done),
    projectId: raw.projectId ?? null,
    notes: typeof raw.notes === "string" ? raw.notes : "",
    createdAt: typeof raw.createdAt === "number" ? raw.createdAt : Date.now(),
  };
}

function normalizeSession(
  raw: Partial<Session> & { id: string },
): Session | null {
  if (
    typeof raw.startedAt !== "number" ||
    typeof raw.duration !== "number" ||
    !raw.type
  ) {
    return null;
  }
  return {
    id: raw.id,
    taskId: raw.taskId ?? null,
    projectId: raw.projectId ?? null,
    startedAt: raw.startedAt,
    duration: raw.duration,
    type: raw.type,
    completed: raw.completed !== false,
  };
}

function normalizeProject(raw: Partial<Project> & { id: string; name: string }): Project {
  return {
    id: raw.id,
    name: raw.name,
    color: typeof raw.color === "string" && raw.color ? raw.color : "#df3c3c",
    archived: Boolean(raw.archived),
  };
}

function normalizeTemplate(
  raw: Partial<TaskTemplate> & { id: string; label: string },
): TaskTemplate {
  return {
    id: raw.id,
    label: raw.label,
    estimatedPomos: Math.max(1, Math.min(24, Math.floor(raw.estimatedPomos ?? 1))),
    projectId: raw.projectId ?? null,
  };
}

export function migrateToV2(raw: unknown): AppPersistedState | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as { version?: number };

  if (obj.version === 2) {
    const v2 = raw as AppPersistedState;
    return {
      version: 2,
      settings: clampSettings(v2.settings ?? {}),
      tasks: Array.isArray(v2.tasks)
        ? v2.tasks
            .filter((t): t is Task => Boolean(t?.id && t?.label))
            .map((t) => normalizeTask(t))
        : [],
      sessions: Array.isArray(v2.sessions)
        ? v2.sessions
            .map((s) => normalizeSession(s as Session))
            .filter((s): s is Session => s != null)
        : [],
      projects: Array.isArray(v2.projects)
        ? v2.projects
            .filter((p): p is Project => Boolean(p?.id && p?.name))
            .map((p) => normalizeProject(p))
        : [],
      templates: Array.isArray(v2.templates)
        ? v2.templates
            .filter((t): t is TaskTemplate => Boolean(t?.id && t?.label))
            .map((t) => normalizeTemplate(t))
        : [],
      timer: normalizeTimer(v2.timer),
    };
  }

  if (obj.version === 1) {
    const v1 = raw as AppPersistedStateV1;
    const settings = clampSettings(v1.settings ?? {});
    return {
      version: 2,
      settings,
      tasks: Array.isArray(v1.tasks)
        ? v1.tasks
            .filter((t) => Boolean(t?.id && t?.label))
            .map((t) => normalizeTask(t as Task))
        : [],
      sessions: Array.isArray(v1.sessions)
        ? v1.sessions
            .map((s) =>
              normalizeSession({
                ...s,
                projectId: s.projectId ?? null,
              } as Session),
            )
            .filter((s): s is Session => s != null)
        : [],
      projects: [],
      templates: [],
      timer: normalizeTimer(v1.timer),
    };
  }

  return null;
}

export function createEmptyPersistedState(): AppPersistedState {
  return {
    version: 2,
    settings: DEFAULT_SETTINGS,
    tasks: [],
    sessions: [],
    projects: [],
    templates: [],
    timer: createIdleTimer(DEFAULT_SETTINGS, null),
  };
}

export function createMemoryStorage(): StorageAdapter & {
  snapshot: AppPersistedState | null;
} {
  let snapshot: AppPersistedState | null = null;
  return {
    get snapshot() {
      return snapshot;
    },
    load() {
      return snapshot;
    },
    save(state: AppPersistedState) {
      snapshot = state;
    },
  };
}

export function createLocalStorageAdapter(
  key: string = STORAGE_KEY,
): StorageAdapter {
  return {
    load(): AppPersistedState | null {
      if (typeof window === "undefined") return null;
      try {
        const raw = window.localStorage.getItem(key);
        if (raw) {
          const migrated = migrateToV2(JSON.parse(raw));
          if (migrated) return migrated;
        }
        // Migrate from legacy v1 key
        if (key === STORAGE_KEY) {
          const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
          if (legacy) {
            const migrated = migrateToV2(JSON.parse(legacy));
            if (migrated) {
              window.localStorage.setItem(key, JSON.stringify(migrated));
              return migrated;
            }
          }
        }
        return null;
      } catch {
        return null;
      }
    },
    save(state: AppPersistedState) {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(key, JSON.stringify(state));
      } catch {
        /* quota / private mode */
      }
    },
  };
}

export { STORAGE_KEY, LEGACY_STORAGE_KEY };
