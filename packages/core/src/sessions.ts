import type { Session } from "./types";

function startOfLocalDay(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

export function countCompletedWorkSessions(
  sessions: Session[],
  fromMs: number,
  toMs: number,
): number {
  return sessions.filter(
    (s) =>
      s.completed &&
      s.type === "work" &&
      s.startedAt >= fromMs &&
      s.startedAt < toMs,
  ).length;
}

export function completedWorkToday(
  sessions: Session[],
  now: Date = new Date(),
): number {
  const start = startOfLocalDay(now);
  const end = start + 24 * 60 * 60 * 1000;
  return countCompletedWorkSessions(sessions, start, end);
}

export function completedWorkThisWeek(
  sessions: Session[],
  now: Date = new Date(),
): number {
  const d = new Date(now);
  const day = d.getDay();
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const start = monday.getTime();
  const end = start + 7 * 24 * 60 * 60 * 1000;
  return countCompletedWorkSessions(sessions, start, end);
}

export type DayBucket = { dateKey: string; count: number };

/** Last 7 local calendar days including today, counts completed work sessions per day */
export function last7DayBuckets(
  sessions: Session[],
  now: Date = new Date(),
): DayBucket[] {
  const buckets: DayBucket[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const start = d.getTime();
    const end = start + 24 * 60 * 60 * 1000;
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const count = countCompletedWorkSessions(sessions, start, end);
    buckets.push({ dateKey, count });
  }
  return buckets;
}
