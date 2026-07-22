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
          className={cn("pill", projectFilterId === "all" && "pill-active")}
        >
          {t(lang, "projects_all")}
        </button>
        <button
          type="button"
          onClick={() => setProjectFilter(null)}
          className={cn("pill", projectFilterId === null && "pill-active")}
        >
          {t(lang, "projects_none")}
        </button>
        {active.map((p) => (
          <span
            key={p.id}
            className={cn(
              "pill group pr-1.5",
              projectFilterId === p.id && "pill-active",
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
              className="rounded-full p-0.5 text-[var(--color-muted)] opacity-60 transition-opacity hover:text-[var(--color-foreground)] group-hover:opacity-100"
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
            className="field h-9 flex-1"
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
