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
import { t } from "@/lib/i18n";
import { useAppStore } from "@/store/app-store";

function shortDayLabel(lang: "en" | "de", dateKey: string): string {
  const d = new Date(`${dateKey}T12:00:00`);
  const locale = lang === "de" ? "de-DE" : undefined;
  return d.toLocaleDateString(locale, { weekday: "short" });
}

export function StatsView() {
  const sessions = useAppStore((s) => s.sessions);
  const lang = useAppStore((s) => s.settings.language);
  const now = new Date();

  const streak = computeStreak(sessions, now);
  const today = completedWorkToday(sessions, now);
  const week = completedWorkThisWeek(sessions, now);
  const buckets = last7DayBuckets(sessions, now).map((b) => ({
    ...b,
    label: shortDayLabel(lang, b.dateKey),
  }));

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-4">
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
              {t(lang, "stats_focus_sessions")}
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
              {t(lang, "stats_focus_sessions")}
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
                name={t(lang, "stats_tooltip_sessions")}
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
