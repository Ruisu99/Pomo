"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ImageIcon } from "lucide-react";
import type { BackgroundPreset } from "@pomodoro/core";
import { PIXEL_CITY_VIDEO_SRC } from "@/components/VideoBackground";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

const PRESETS: ReadonlyArray<{
  id: BackgroundPreset;
  labelKey:
    | "settings_background_pixel"
    | "settings_background_pomo"
    | "settings_background_slate"
    | "settings_background_gold"
    | "settings_background_solid"
    | "settings_background_custom";
}> = [
  { id: "pixelCity", labelKey: "settings_background_pixel" },
  { id: "pomoRed", labelKey: "settings_background_pomo" },
  { id: "pomoSlate", labelKey: "settings_background_slate" },
  { id: "pomoGold", labelKey: "settings_background_gold" },
  { id: "solid", labelKey: "settings_background_solid" },
  { id: "customImage", labelKey: "settings_background_custom" },
];

function SwatchPreview({
  id,
  solid,
  customUrl,
}: {
  id: BackgroundPreset;
  solid: string;
  customUrl: string | null;
}) {
  if (id === "pixelCity") {
    return (
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={PIXEL_CITY_VIDEO_SRC}
        muted
        playsInline
        loop
        autoPlay
        preload="metadata"
        aria-hidden
      />
    );
  }
  if (id === "pomoRed") {
    return <span className="absolute inset-0 bg-[#df3c3c]" aria-hidden />;
  }
  if (id === "pomoSlate") {
    return <span className="absolute inset-0 bg-[#454f67]" aria-hidden />;
  }
  if (id === "pomoGold") {
    return <span className="absolute inset-0 bg-[#d7b00f]" aria-hidden />;
  }
  if (id === "customImage" && customUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={customUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }
  if (id === "customImage") {
    return (
      <span
        className="absolute inset-0 flex items-center justify-center bg-[color-mix(in_oklch,white,transparent_82%)]"
        aria-hidden
      >
        <ImageIcon className="size-4 text-[var(--color-muted)]" />
      </span>
    );
  }
  return (
    <span className="absolute inset-0" style={{ background: solid }} aria-hidden />
  );
}

export function BackgroundQuickPicker() {
  const lang = useAppStore((s) => s.settings.language);
  const preset = useAppStore((s) => s.settings.backgroundPreset);
  const solid = useAppStore((s) => s.settings.backgroundSolid);
  const customUrl = useAppStore((s) => s.settings.backgroundImageDataUrl);
  const patchSettings = useAppStore((s) => s.patchSettings);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent | PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={t(lang, "bg_picker_aria")}
        aria-expanded={open}
        aria-controls={panelId}
        title={t(lang, "bg_picker_aria")}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "glass liquid-glass inline-flex size-10 items-center justify-center rounded-2xl text-[var(--color-foreground)] transition-colors",
          open
            ? "bg-[color-mix(in_oklch,var(--color-primary),white_12%)] text-[var(--color-primary-foreground)]"
            : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
        )}
      >
        <ImageIcon className="size-4" />
      </button>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label={t(lang, "settings_background")}
          className="glass liquid-glass absolute right-0 top-[calc(100%+0.5rem)] z-40 w-[min(18.5rem,calc(100vw-2rem))] rounded-2xl p-3 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.7)]"
        >
          <p className="mb-2 px-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            {t(lang, "settings_background")}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((opt) => {
              const active = preset === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    patchSettings({ backgroundPreset: opt.id });
                    if (opt.id !== "customImage" && opt.id !== "solid") {
                      setOpen(false);
                    }
                  }}
                  className={cn(
                    "group relative flex flex-col gap-1.5 rounded-xl p-1 text-left transition-colors",
                    active
                      ? "bg-[color-mix(in_oklch,var(--color-primary),transparent_78%)]"
                      : "hover:bg-[color-mix(in_oklch,white,transparent_86%)]",
                  )}
                >
                  <span
                    className={cn(
                      "relative aspect-[4/3] overflow-hidden rounded-lg border",
                      active
                        ? "border-[var(--color-primary)] ring-2 ring-[color-mix(in_oklch,var(--color-primary),transparent_55%)]"
                        : "border-[color-mix(in_oklch,white,transparent_72%)]",
                    )}
                  >
                    <SwatchPreview id={opt.id} solid={solid} customUrl={customUrl} />
                    {active ? (
                      <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                    ) : null}
                  </span>
                  <span className="truncate px-0.5 text-[10px] font-medium leading-tight text-[var(--color-foreground)]">
                    {t(lang, opt.labelKey)}
                  </span>
                </button>
              );
            })}
          </div>

          {preset === "solid" ? (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-[color-mix(in_oklch,white,transparent_72%)] px-3 py-2">
              <span className="text-xs text-[var(--color-muted)]">
                {t(lang, "settings_background_color")}
              </span>
              <input
                aria-label={t(lang, "settings_background_color")}
                type="color"
                value={solid}
                onChange={(e) => patchSettings({ backgroundSolid: e.target.value })}
                className="h-8 w-10 cursor-pointer rounded-md border border-[var(--color-card-border)] bg-transparent p-0.5"
              />
            </div>
          ) : null}

          {preset === "customImage" ? (
            <div className="mt-3 space-y-2 rounded-xl border border-[color-mix(in_oklch,white,transparent_72%)] p-2.5">
              <label className="block text-xs text-[var(--color-muted)]">
                {t(lang, "settings_background_upload")}
                <input
                  type="file"
                  accept="image/*"
                  className="mt-1.5 block w-full text-[11px] text-[var(--color-muted)] file:mr-2 file:rounded-lg file:border file:border-[var(--color-card-border)] file:bg-[color-mix(in_oklch,white,transparent_86%)] file:px-2 file:py-1 file:text-[11px] file:font-medium file:text-[var(--color-foreground)]"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const result =
                        typeof reader.result === "string" ? reader.result : null;
                      patchSettings({ backgroundImageDataUrl: result });
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
              {customUrl ? (
                <button
                  type="button"
                  className="w-full rounded-lg px-2 py-1.5 text-xs text-[var(--color-muted)] hover:bg-[color-mix(in_oklch,white,transparent_86%)] hover:text-[var(--color-foreground)]"
                  onClick={() => patchSettings({ backgroundImageDataUrl: null })}
                >
                  {t(lang, "settings_background_remove")}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
