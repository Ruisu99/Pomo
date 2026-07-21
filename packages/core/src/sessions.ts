import type { Project, Session, Task } from "./types";

function startOfLocalDay(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

function startOfLocalWeekMonday(d: Date): number {
  const x = new Date(d);
  const day = x.getDay();
  const diffToMonday = (day + 6) % 7;
  x.setDate(x.getDate() - diffToMonday);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

function startOfLocalMonth(d: Date): number {
  const x = new Date(d.getFullYear(), d.getMonth(), 1);
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

export function focusSecondsInRange(
  sessions: Session[],
  fromMs: number,
  toMs: number,
): number {
  return sessions
    .filter(
      (s) =>
        s.completed &&
        s.type === "work" &&
        s.startedAt >= fromMs &&
        s.startedAt < toMs,
    )
    .reduce((sum, s) => sum + s.duration, 0);
}

export function focusMinutesInRange(
  sessions: Session[],
  fromMs: number,
  toMs: number,
): number {
  return Math.round(focusSecondsInRange(sessions, fromMs, toMs) / 60);
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
  const start = startOfLocalWeekMonday(now);
  const end = start + 7 * 24 * 60 * 60 * 1000;
  return countCompletedWorkSessions(sessions, start, end);
}

export function focusMinutesToday(
  sessions: Session[],
  now: Date = new Date(),
): number {
  const start = startOfLocalDay(now);
  const end = start + 24 * 60 * 60 * 1000;
  return focusMinutesInRange(sessions, start, end);
}

export function focusMinutesThisWeek(
  sessions: Session[],
  now: Date = new Date(),
): number {
  const start = startOfLocalWeekMonday(now);
  const end = start + 7 * 24 * 60 * 60 * 1000;
  return focusMinutesInRange(sessions, start, end);
}

export function focusMinutesThisMonth(
  sessions: Session[],
  now: Date = new Date(),
): number {
  const start = startOfLocalMonth(now);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
  return focusMinutesInRange(sessions, start, end);
}

export type DayBucket = { dateKey: string; count: number; minutes: number };

/** Last 7 local calendar days including today */
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
    const minutes = focusMinutesInRange(sessions, start, end);
    buckets.push({ dateKey, count, minutes });
  }
  return buckets;
}

export type ProjectFocusBucket = {
  projectId: string | null;
  name: string;
  color: string;
  minutes: number;
  sessions: number;
};

export function focusByProject(
  sessions: Session[],
  projects: Project[],
  fromMs: number,
  toMs: number,
): ProjectFocusBucket[] {
  const map = new Map<string | null, { minutes: number; sessions: number }>();

  for (const s of sessions) {
    if (!s.completed || s.type !== "work") continue;
    if (s.startedAt < fromMs || s.startedAt >= toMs) continue;
    const key = s.projectId;
    const prev = map.get(key) ?? { minutes: 0, sessions: 0 };
    prev.minutes += Math.round(s.duration / 60);
    prev.sessions += 1;
    map.set(key, prev);
  }

  const projectById = new Map(projects.map((p) => [p.id, p]));
  const rows: ProjectFocusBucket[] = [];

  for (const [projectId, stats] of map) {
    if (projectId == null) {
      rows.push({
        projectId: null,
        name: "No project",
        color: "#94a3b8",
        ...stats,
      });
      continue;
    }
    const p = projectById.get(projectId);
    rows.push({
      projectId,
      name: p?.name ?? "Unknown",
      color: p?.color ?? "#94a3b8",
      ...stats,
    });
  }

  return rows.sort((a, b) => b.minutes - a.minutes);
}

export type CsvSessionRow = {
  id: string;
  startedAt: string;
  durationSec: number;
  type: string;
  task: string;
  project: string;
};

export function sessionsToCsvRows(
  sessions: Session[],
  tasks: Task[],
  projects: Project[],
): CsvSessionRow[] {
  const taskById = new Map(tasks.map((t) => [t.id, t]));
  const projectById = new Map(projects.map((p) => [p.id, p]));

  return [...sessions]
    .sort((a, b) => a.startedAt - b.startedAt)
    .map((s) => {
      const task = s.taskId ? taskById.get(s.taskId) : null;
      const project = s.projectId
        ? projectById.get(s.projectId)
        : task?.projectId
          ? projectById.get(task.projectId)
          : null;
      return {
        id: s.id,
        startedAt: new Date(s.startedAt).toISOString(),
        durationSec: s.duration,
        type: s.type,
        task: task?.label ?? "",
        project: project?.name ?? "",
      };
    });
}

export function csvRowsToString(rows: CsvSessionRow[]): string {
  const header = "id,startedAt,durationSec,type,task,project";
  const escape = (v: string | number) => {
    const s = String(v);
    if (/[",\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
    return s;
  };
  const lines = rows.map(
    (r) =>
      [r.id, r.startedAt, r.durationSec, r.type, r.task, r.project]
        .map(escape)
        .join(","),
  );
  return [header, ...lines].join("\n");
}
