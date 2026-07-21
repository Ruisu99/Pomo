"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

export function ProjectBar() {
  const lang = useAppStore((s) => s.settings.language);
  const projects = useAppStore((s) => s.projects);
  const projectFilterId = useAppStore((s) => s.projectFilterId);
  const setProjectFilter = useAppStore((s) => s.setProjectFilter);
  const addProject = useAppStore((s) => s.addProject);
  const removeProject = useAppStore((s) => s.removeProject);
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);

  const active = projects.filter((p) => !p.archived);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setProjectFilter("all")}
          className={cn(
            "rounded-full border px-2.5 py-1 text-xs transition-colors",
            projectFilterId === "all"
              ? "border-[var(--color-primary)] bg-[var(--color-accent)]"
              : "border-[var(--color-card-border)] text-[var(--color-muted)]",
          )}
        >
          {t(lang, "projects_all")}
        </button>
        <button
          type="button"
          onClick={() => setProjectFilter(null)}
          className={cn(
            "rounded-full border px-2.5 py-1 text-xs transition-colors",
            projectFilterId === null
              ? "border-[var(--color-primary)] bg-[var(--color-accent)]"
              : "border-[var(--color-card-border)] text-[var(--color-muted)]",
          )}
        >
          {t(lang, "projects_none")}
        </button>
        {active.map((p) => (
          <span
            key={p.id}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs",
              projectFilterId === p.id
                ? "border-[var(--color-primary)] bg-[var(--color-accent)]"
                : "border-[var(--color-card-border)]",
            )}
          >
            <button
              type="button"
              onClick={() => setProjectFilter(p.id)}
              className="inline-flex items-center gap-1.5"
            >
              <span
                className="size-2 rounded-full"
                style={{ background: p.color }}
              />
              {p.name}
            </button>
            <button
              type="button"
              aria-label={t(lang, "projects_remove")}
              className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              onClick={() => removeProject(p.id)}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs"
          onClick={() => setAdding((v) => !v)}
        >
          <Plus className="size-3.5" />
          {t(lang, "projects_add")}
        </Button>
      </div>

      {adding ? (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            addProject(name);
            setName("");
            setAdding(false);
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t(lang, "projects_placeholder")}
            className="h-9 flex-1 rounded-md border border-[var(--color-card-border)] bg-[var(--color-card)] px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
            autoFocus
          />
          <Button type="submit" size="sm" disabled={!name.trim()}>
            {t(lang, "projects_create")}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
