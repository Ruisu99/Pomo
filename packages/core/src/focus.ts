import type { Settings, TimerSnapshot } from "./types";

export const DEFAULT_BLOCKED_SITES = [
  "youtube.com",
  "youtu.be",
  "reddit.com",
  "twitter.com",
  "x.com",
  "instagram.com",
  "facebook.com",
  "tiktok.com",
  "netflix.com",
  "twitch.tv",
  "discord.com",
  "news.ycombinator.com",
] as const;

export function normalizeBlockedSite(raw: string): string | null {
  let s = raw.trim().toLowerCase();
  if (!s) return null;
  s = s.replace(/^https?:\/\//, "");
  s = s.replace(/^www\./, "");
  s = s.split("/")[0] ?? "";
  s = s.split("?")[0] ?? "";
  if (!s || !s.includes(".")) return null;
  return s;
}

export function normalizeBlockedSites(sites: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of sites) {
    const n = normalizeBlockedSite(raw);
    if (n && !seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  }
  return out;
}

/** True when distractions should be blocked (work phase, timer running). */
export function isFocusBlockingActive(
  timer: TimerSnapshot,
  settings: Settings,
): boolean {
  return (
    settings.focusModeEnabled &&
    settings.blockDistractions &&
    timer.phase === "work" &&
    timer.runState === "running"
  );
}

/** True when strict focus rules apply (no pause/skip during work). */
export function isStrictFocusActive(
  timer: TimerSnapshot,
  settings: Settings,
): boolean {
  return (
    settings.focusModeEnabled &&
    settings.strictFocus &&
    timer.phase === "work" &&
    (timer.runState === "running" || timer.runState === "paused")
  );
}

export type FocusBlockState = {
  blockingActive: boolean;
  blockedSites: string[];
  /** Wall-clock ms when current work block ends; null if not blocking */
  endsAt: number | null;
  updatedAt: number;
};

export function buildFocusBlockState(
  timer: TimerSnapshot,
  settings: Settings,
  nowMs: number,
): FocusBlockState {
  const blockingActive = isFocusBlockingActive(timer, settings);
  return {
    blockingActive,
    blockedSites: normalizeBlockedSites(settings.blockedSites),
    endsAt: blockingActive && timer.endsAt != null ? timer.endsAt : null,
    updatedAt: nowMs,
  };
}
