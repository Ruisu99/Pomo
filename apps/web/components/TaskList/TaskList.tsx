"use client";

import { useMemo, useState } from "react";
import { BookmarkPlus, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { FinishEstimate } from "@/components/Tasks/FinishEstimate";
import { ProjectBar } from "@/components/Tasks/ProjectBar";
import { TemplateList } from "@/components/Tasks/TemplateList";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

export function TaskList() {
  const [label, setLabel] = useState("");
  const [estimate, setEstimate] = useState(3);
  const [projectId, setProjectId] = useState<string | null>(null);

  const tasks = useAppStore((s) => s.tasks);
  const projects = useAppStore((s) => s.projects);
  const projectFilterId = useAppStore((s) => s.projectFilterId);
  const activeId = useAppStore((s) => s.timer.activeTaskId);
  const lang = useAppStore((s) => s.settings.language);
  const addTask = useAppStore((s) => s.addTask);
  const setActiveTask = useAppStore((s) => s.setActiveTask);
  const toggleTaskDone = useAppStore((s) => s.toggleTaskDone);
  const removeTask = useAppStore((s) => s.removeTask);
  const updateTaskEstimate = useAppStore((s) => s.updateTaskEstimate);
  const updateTaskProject = useAppStore((s) => s.updateTaskProject);
  const saveTemplateFromTask = useAppStore((s) => s.saveTemplateFromTask);

  const activeProjects = projects.filter((p) => !p.archived);

  const sorted = useMemo(() => {
    const filtered = tasks.filter((task) => {
      if (projectFilterId === "all") return true;
      if (projectFilterId === null) return task.projectId == null;
      return task.projectId === projectFilterId;
    });
    return [...filtered].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return a.createdAt - b.createdAt;
    });
  }, [tasks, projectFilterId]);

  return (
    <Card className="mx-auto w-full max-w-lg border-[var(--color-card-border)]">
      <CardHeader className="space-y-3">
        <CardTitle className="text-lg">{t(lang, "tasks_title")}</CardTitle>
        <ProjectBar />
        <FinishEstimate />
      </CardHeader>
      <CardContent className="space-y-4">
        <TemplateList />

        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            addTask(label, estimate, projectId);
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
          {activeProjects.length > 0 ? (
            <div className="space-y-2">
              <Label htmlFor="task-project">{t(lang, "tasks_project")}</Label>
              <select
                id="task-project"
                value={projectId ?? ""}
                onChange={(e) =>
                  setProjectId(e.target.value ? e.target.value : null)
                }
                className="h-10 w-full rounded-md border border-[var(--color-card-border)] bg-[var(--color-card)] px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
              >
                <option value="">{t(lang, "projects_none")}</option>
                {activeProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
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
          {sorted.map((task) => {
              const active = activeId === task.id;
              const project = task.projectId
                ? projects.find((p) => p.id === task.projectId)
                : null;
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
                    <span className="inline-flex items-center gap-2">
                      {project ? (
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ background: project.color }}
                          title={project.name}
                        />
                      ) : null}
                      <span className={cn(task.done && "line-through")}>
                        {task.label}
                      </span>
                    </span>
                    <span className="mt-1 block text-xs font-normal text-[var(--color-muted)]">
                      {task.completedPomos}/{task.estimatedPomos}{" "}
                      {t(lang, "tasks_sessions")}
                      {project ? ` · ${project.name}` : ""}
                    </span>
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    {activeProjects.length > 0 ? (
                      <select
                        value={task.projectId ?? ""}
                        onChange={(e) =>
                          updateTaskProject(
                            task.id,
                            e.target.value ? e.target.value : null,
                          )
                        }
                        className="h-8 rounded-md border border-[var(--color-card-border)] bg-[var(--color-card)] px-2 text-xs"
                        aria-label={t(lang, "tasks_project")}
                      >
                        <option value="">{t(lang, "projects_none")}</option>
                        {activeProjects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    ) : null}
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
                      variant="ghost"
                      aria-label={t(lang, "templates_save")}
                      onClick={() => saveTemplateFromTask(task.id)}
                    >
                      <BookmarkPlus className="size-4" />
                    </Button>
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
            })}
        </div>
      </CardContent>
    </Card>
  );
}
