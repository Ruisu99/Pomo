"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  completedWorkThisWeek,
  completedWorkToday,
  computeStreak,
  csvRowsToString,
  focusByProject,
  focusMinutesThisMonth,
  focusMinutesThisWeek,
  focusMinutesToday,
  last7DayBuckets,
  sessionsToCsvRows,
} from "@pomodoro/core";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/store/app-store";

function shortDayLabel(lang: "en" | "de", dateKey: string): string {
  const d = new Date(`${dateKey}T12:00:00`);
  const locale = lang === "de" ? "de-DE" : undefined;
  return d.toLocaleDateString(locale, { weekday: "short" });
}

export function StatsView() {
  const sessions = useAppStore((s) => s.sessions);
  const tasks = useAppStore((s) => s.tasks);
  const projects = useAppStore((s) => s.projects);
  const lang = useAppStore((s) => s.settings.language);
  const now = new Date();

  const streak = computeStreak(sessions, now);
  const today = completedWorkToday(sessions, now);
  const week = completedWorkThisWeek(sessions, now);
  const minsToday = focusMinutesToday(sessions, now);
  const minsWeek = focusMinutesThisWeek(sessions, now);
  const minsMonth = focusMinutesThisMonth(sessions, now);

  const buckets = last7DayBuckets(sessions, now).map((b) => ({
    ...b,
    label: shortDayLabel(lang, b.dateKey),
  }));

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
  const byProject = focusByProject(sessions, projects, monthStart, monthEnd).map(
    (row) => ({
      ...row,
      name:
        row.projectId == null ? t(lang, "stats_no_project") : row.name,
    }),
  );

  function exportCsv() {
    const rows = sessionsToCsvRows(sessions, tasks, projects);
    const csv = csvRowsToString(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pomo-sessions-${now.toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-4">
      <div className="flex justify-end">
        <Button type="button" variant="secondary" size="sm" onClick={exportCsv}>
          <Download className="size-4" />
          {t(lang, "stats_export_csv")}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-[var(--color-card-border)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[var(--color-muted)]">
              {t(lang, "stats_streak")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">{streak}</div>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              {t(lang, "stats_days_in_a_row")}
            </p>
          </CardContent>
        </Card>
        <Card className="border-[var(--color-card-border)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[var(--color-muted)]">
              {t(lang, "stats_today")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">{today}</div>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              {t(lang, "stats_focus_sessions")} · {minsToday}{" "}
              {t(lang, "stats_minutes")}
            </p>
          </CardContent>
        </Card>
        <Card className="border-[var(--color-card-border)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[var(--color-muted)]">
              {t(lang, "stats_this_week")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">{week}</div>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              {t(lang, "stats_focus_sessions")} · {minsWeek}{" "}
              {t(lang, "stats_minutes")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-[var(--color-card-border)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[var(--color-muted)]">
              {t(lang, "stats_month_minutes")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">{minsMonth}</div>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              {t(lang, "stats_minutes")}
            </p>
          </CardContent>
        </Card>
        <Card className="border-[var(--color-card-border)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[var(--color-muted)]">
              {t(lang, "stats_week_minutes")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">{minsWeek}</div>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              {t(lang, "stats_minutes")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[var(--color-card-border)]">
        <CardHeader>
          <CardTitle className="text-lg">{t(lang, "stats_last_7_days")}</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={buckets} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-[var(--color-card-border)]" />
              <XAxis dataKey="label" tick={{ fill: "var(--color-muted)", fontSize: 12 }} />
              <YAxis allowDecimals={false} width={36} tick={{ fill: "var(--color-muted)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-card-border)",
                  borderRadius: 12,
                }}
                formatter={(value, name) => {
                  const n = typeof value === "number" ? value : Number(value);
                  if (name === "minutes") {
                    return [`${n} ${t(lang, "stats_minutes")}`, t(lang, "stats_minutes")];
                  }
                  return [n, t(lang, "stats_tooltip_sessions")];
                }}
                labelFormatter={(_, payload) => {
                  const p = payload?.[0]?.payload as { dateKey?: string } | undefined;
                  return p?.dateKey ?? "";
                }}
              />
              <Bar
                dataKey="minutes"
                name="minutes"
                fill="var(--color-primary)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {byProject.length === 0 ? null : (
      <Card className="border-[var(--color-card-border)]">
        <CardHeader>
          <CardTitle className="text-lg">{t(lang, "stats_by_project")}</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byProject}
                  dataKey="minutes"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) =>
                    `${name} ${Math.round((percent ?? 0) * 100)}%`
                  }
                >
                  {byProject.map((entry) => (
                    <Cell key={entry.projectId ?? "none"} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-card-border)",
                    borderRadius: 12,
                  }}
                  formatter={(value) => [
                    `${value} ${t(lang, "stats_minutes")}`,
                    t(lang, "stats_minutes"),
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
        </CardContent>
      </Card>
      )}
    </div>
  );
}
