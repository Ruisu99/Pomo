"use client";

import { useMemo, useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

export function TaskList() {
  const [label, setLabel] = useState("");
  const [estimate, setEstimate] = useState(3);

  const tasks = useAppStore((s) => s.tasks);
  const activeId = useAppStore((s) => s.timer.activeTaskId);
  const lang = useAppStore((s) => s.settings.language);
  const addTask = useAppStore((s) => s.addTask);
  const setActiveTask = useAppStore((s) => s.setActiveTask);
  const toggleTaskDone = useAppStore((s) => s.toggleTaskDone);
  const removeTask = useAppStore((s) => s.removeTask);
  const updateTaskEstimate = useAppStore((s) => s.updateTaskEstimate);

  const sorted = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return a.label.localeCompare(b.label);
    });
  }, [tasks]);

  return (
    <Card className="mx-auto w-full max-w-lg border-[var(--color-card-border)]">
      <CardHeader>
        <CardTitle className="text-lg">{t(lang, "tasks_title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            addTask(label, estimate);
            setLabel("");
            setEstimate(3);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="task">{t(lang, "tasks_task")}</Label>
            <input
              id="task"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={t(lang, "tasks_placeholder")}
              className="h-10 w-full rounded-md border border-[var(--color-card-border)] bg-[var(--color-card)] px-3 text-sm outline-none ring-offset-[var(--color-background)] focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t(lang, "tasks_estimated")}</Label>
              <span className="text-sm text-[var(--color-muted)]">{estimate}</span>
            </div>
            <Slider
              value={[estimate]}
              min={1}
              max={12}
              step={1}
              onValueChange={(v) => setEstimate(v[0] ?? 3)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={!label.trim()}>
            {t(lang, "tasks_add")}
          </Button>
        </form>

        <div className="space-y-2">
          {sorted.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">
              {t(lang, "tasks_empty")}
            </p>
          ) : (
            sorted.map((task) => {
              const active = activeId === task.id;
              return (
                <div
                  key={task.id}
                  className={cn(
                    "flex flex-col gap-2 rounded-lg border border-[var(--color-card-border)] p-3 sm:flex-row sm:items-center sm:justify-between",
                    active && "border-[var(--color-primary)] bg-[var(--color-accent)]",
                    task.done && "opacity-60",
                  )}
                >
                  <button
                    type="button"
                    className="text-left text-sm font-medium"
                    onClick={() => setActiveTask(task.id)}
                  >
                    <span className={cn(task.done && "line-through")}>
                      {task.label}
                    </span>
                    <span className="mt-1 block text-xs font-normal text-[var(--color-muted)]">
                      {task.completedPomos}/{task.estimatedPomos}{" "}
                      {t(lang, "tasks_sessions")}
                    </span>
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--color-muted)]">
                        {t(lang, "tasks_est_short")}
                      </span>
                      <Slider
                        className="w-28"
                        value={[task.estimatedPomos]}
                        min={1}
                        max={12}
                        step={1}
                        onValueChange={(v) =>
                          updateTaskEstimate(
                            task.id,
                            v[0] ?? task.estimatedPomos,
                          )
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      aria-label={
                        task.done
                          ? t(lang, "tasks_mark_not_done")
                          : t(lang, "tasks_mark_done")
                      }
                      onClick={() => toggleTaskDone(task.id)}
                    >
                      <Check
                        className={cn(
                          "size-4",
                          task.done && "text-[var(--color-primary)]",
                        )}
                      />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={t(lang, "tasks_remove")}
                      onClick={() => removeTask(task.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
