"use client";

import { useMemo, useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

export function TaskList() {
  const [label, setLabel] = useState("");
  const [estimate, setEstimate] = useState(3);

  const tasks = useAppStore((s) => s.tasks);
  const activeId = useAppStore((s) => s.timer.activeTaskId);
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
        <CardTitle className="text-lg">Today</CardTitle>
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
            <Label htmlFor="task">Task</Label>
            <input
              id="task"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="What are you working on?"
              className="h-10 w-full rounded-md border border-[var(--color-card-border)] bg-[var(--color-card)] px-3 text-sm outline-none ring-offset-[var(--color-background)] focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Estimated pomodoros</Label>
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
            Add task
          </Button>
        </form>

        <div className="space-y-2">
          {sorted.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">
              No tasks yet. Add one to estimate your day.
            </p>
          ) : (
            sorted.map((t) => {
              const active = activeId === t.id;
              return (
                <div
                  key={t.id}
                  className={cn(
                    "flex flex-col gap-2 rounded-lg border border-[var(--color-card-border)] p-3 sm:flex-row sm:items-center sm:justify-between",
                    active && "border-[var(--color-primary)] bg-[var(--color-accent)]",
                    t.done && "opacity-60",
                  )}
                >
                  <button
                    type="button"
                    className="text-left text-sm font-medium"
                    onClick={() => setActiveTask(t.id)}
                  >
                    <span className={cn(t.done && "line-through")}>{t.label}</span>
                    <span className="mt-1 block text-xs font-normal text-[var(--color-muted)]">
                      {t.completedPomos}/{t.estimatedPomos} sessions
                    </span>
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--color-muted)]">Est.</span>
                      <Slider
                        className="w-28"
                        value={[t.estimatedPomos]}
                        min={1}
                        max={12}
                        step={1}
                        onValueChange={(v) =>
                          updateTaskEstimate(t.id, v[0] ?? t.estimatedPomos)
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      aria-label={t.done ? "Mark not done" : "Mark done"}
                      onClick={() => toggleTaskDone(t.id)}
                    >
                      <Check className={cn("size-4", t.done && "text-[var(--color-primary)]")} />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label="Remove task"
                      onClick={() => removeTask(t.id)}
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
