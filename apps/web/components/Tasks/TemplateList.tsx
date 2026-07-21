"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/store/app-store";

export function TemplateList() {
  const lang = useAppStore((s) => s.settings.language);
  const templates = useAppStore((s) => s.templates);
  const projects = useAppStore((s) => s.projects);
  const addTaskFromTemplate = useAppStore((s) => s.addTaskFromTemplate);
  const removeTemplate = useAppStore((s) => s.removeTemplate);

  if (templates.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
        {t(lang, "templates_title")}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {templates.map((tpl) => {
          const project = tpl.projectId
            ? projects.find((p) => p.id === tpl.projectId)
            : null;
          return (
            <span
              key={tpl.id}
              className="inline-flex items-center gap-1 rounded-full border border-[var(--color-card-border)] bg-[var(--color-card)] py-1 pl-2.5 pr-1 text-xs"
            >
              <button
                type="button"
                className="inline-flex items-center gap-1.5 hover:text-[var(--color-primary)]"
                onClick={() => addTaskFromTemplate(tpl.id)}
                title={t(lang, "templates_add")}
              >
                {project ? (
                  <span
                    className="size-2 rounded-full"
                    style={{ background: project.color }}
                  />
                ) : null}
                {tpl.label}
                <span className="text-[var(--color-muted)]">
                  · {tpl.estimatedPomos}
                </span>
              </button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-6"
                aria-label={t(lang, "templates_remove")}
                onClick={() => removeTemplate(tpl.id)}
              >
                <Trash2 className="size-3" />
              </Button>
            </span>
          );
        })}
      </div>
    </div>
  );
}
