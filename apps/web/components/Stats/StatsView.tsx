"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  completedWorkThisWeek,
  completedWorkToday,
  computeStreak,
  last7DayBuckets,
} from "@pomodoro/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/store/app-store";

function shortDayLabel(dateKey: string): string {
  const d = new Date(`${dateKey}T12:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

export function StatsView() {
  const sessions = useAppStore((s) => s.sessions);
  const now = new Date();

  const streak = computeStreak(sessions, now);
  const today = completedWorkToday(sessions, now);
  const week = completedWorkThisWeek(sessions, now);
  const buckets = last7DayBuckets(sessions, now).map((b) => ({
    ...b,
    label: shortDayLabel(b.dateKey),
  }));

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-[var(--color-card-border)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[var(--color-muted)]">
              Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">{streak}</div>
            <p className="mt-1 text-xs text-[var(--color-muted)]">days in a row</p>
          </CardContent>
        </Card>
        <Card className="border-[var(--color-card-border)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[var(--color-muted)]">
              Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">{today}</div>
            <p className="mt-1 text-xs text-[var(--color-muted)]">focus sessions</p>
          </CardContent>
        </Card>
        <Card className="border-[var(--color-card-border)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[var(--color-muted)]">
              This week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">{week}</div>
            <p className="mt-1 text-xs text-[var(--color-muted)]">focus sessions</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[var(--color-card-border)]">
        <CardHeader>
          <CardTitle className="text-lg">Last 7 days</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={buckets} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-[var(--color-card-border)]" />
              <XAxis dataKey="label" tick={{ fill: "var(--color-muted)", fontSize: 12 }} />
              <YAxis allowDecimals={false} width={28} tick={{ fill: "var(--color-muted)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-card-border)",
                  borderRadius: 12,
                }}
                labelFormatter={(_, payload) => {
                  const p = payload?.[0]?.payload as { dateKey?: string } | undefined;
                  return p?.dateKey ?? "";
                }}
              />
              <Bar
                dataKey="count"
                name="Sessions"
                fill="var(--color-primary)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
