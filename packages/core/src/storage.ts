import type { AppPersistedState } from "./types";

const STORAGE_KEY = "pomodoro:v1";

export type StorageAdapter = {
  load(): AppPersistedState | null;
  save(state: AppPersistedState): void;
};

export function createMemoryStorage(): StorageAdapter & {
  snapshot: AppPersistedState | null;
} {
  let snapshot: AppPersistedState | null = null;
  return {
    snapshot,
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
        if (!raw) return null;
        const parsed = JSON.parse(raw) as AppPersistedState;
        if (parsed?.version !== 1) return null;
        return parsed;
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

export { STORAGE_KEY };
