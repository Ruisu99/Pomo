"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ImageIcon } from "lucide-react";
import type { BackgroundPreset } from "@pomodoro/core";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

const PANEL_WIDTH = 296;
const PANEL_GAP = 8;

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
      <span
        className="absolute inset-0 bg-[linear-gradient(165deg,#ff8a5c_0%,#c44569_42%,#2d1b4e_100%)]"
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

type PanelPos = { top: number; left: number };

export function BackgroundQuickPicker({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const lang = useAppStore((s) => s.settings.language);
  const preset = useAppStore((s) => s.settings.backgroundPreset);
  const solid = useAppStore((s) => s.settings.backgroundSolid);
  const customUrl = useAppStore((s) => s.settings.backgroundImageDataUrl);
  const patchSettings = useAppStore((s) => s.patchSettings);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<PanelPos>({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;

    const place = () => {
      const rect = buttonRef.current!.getBoundingClientRect();
      const width = Math.min(PANEL_WIDTH, window.innerWidth - 16);
      let left = rect.right - width;
      left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
      let top = rect.bottom + PANEL_GAP;
      const panelH = panelRef.current?.offsetHeight ?? 280;
      if (top + panelH > window.innerHeight - 8) {
        top = Math.max(8, rect.top - PANEL_GAP - panelH);
      }
      setPos({ top, left });
    };

    place();
    const raf = requestAnimationFrame(place);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, preset]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={t(lang, "bg_picker_aria")}
        aria-expanded={open}
        aria-controls={panelId}
        title={t(lang, "bg_picker_aria")}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex size-10 items-center justify-center rounded-xl transition-colors",
          embedded
            ? open
              ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
              : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
            : cn(
                "glass",
                open
                  ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
              ),
        )}
      >
        <ImageIcon className="size-4" />
      </button>

      {mounted && open
        ? createPortal(
            <>
              <button
                type="button"
                aria-label={t(lang, "bg_picker_close")}
                className="fixed inset-0 z-[60] cursor-default bg-black/25"
                onClick={() => setOpen(false)}
              />
              <div
                ref={panelRef}
                id={panelId}
                role="dialog"
                aria-label={t(lang, "settings_background")}
                style={{
                  top: pos.top,
                  left: pos.left,
                  width: Math.min(
                    PANEL_WIDTH,
                    typeof window !== "undefined" ? window.innerWidth - 16 : PANEL_WIDTH,
                  ),
                }}
                className="glass fixed z-[70] rounded-2xl p-3 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.7)]"
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
                          <SwatchPreview
                            id={opt.id}
                            solid={solid}
                            customUrl={customUrl}
                          />
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
                      onChange={(e) =>
                        patchSettings({ backgroundSolid: e.target.value })
                      }
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
                              typeof reader.result === "string"
                                ? reader.result
                                : null;
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
                        onClick={() =>
                          patchSettings({ backgroundImageDataUrl: null })
                        }
                      >
                        {t(lang, "settings_background_remove")}
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </>,
            document.body,
          )
        : null}
    </>
  );
}
