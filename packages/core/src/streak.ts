import type { Session } from "./types";

/** YYYY-MM-DD in local calendar */
function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Days (local midnight) with at least one completed work session */
export function completedWorkDaysLocal(
  sessions: Session[],
  now: Date = new Date(),
): Set<string> {
  const days = new Set<string>();
  for (const s of sessions) {
    if (!s.completed || s.type !== "work") continue;
    const d = new Date(s.startedAt);
    days.add(dayKey(d));
  }
  return days;
}

/**
 * Current streak: consecutive local calendar days ending today (or yesterday if today empty)
 * with at least one completed work session each day.
 */
export function computeStreak(
  sessions: Session[],
  now: Date = new Date(),
): number {
  const days = completedWorkDaysLocal(sessions, now);
  if (days.size === 0) return 0;

  const today = dayKey(now);
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  const yesterday = dayKey(y);

  let cursor = new Date(now);
  let streak = 0;

  if (days.has(today)) {
    cursor = new Date(now);
  } else if (days.has(yesterday)) {
    cursor = new Date(y);
    streak = 0;
  } else {
    return 0;
  }

  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
