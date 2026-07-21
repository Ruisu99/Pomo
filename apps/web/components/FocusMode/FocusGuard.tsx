"use client";

import { useEffect, useRef, useState } from "react";
import { isFocusBlockingActive } from "@pomodoro/core";
import { t } from "@/lib/i18n";
import { syncFocusBlockState, clearFocusBlockState } from "@/lib/focus-bridge";
import { useAppStore } from "@/store/app-store";

export function FocusGuard() {
  const timer = useAppStore((s) => s.timer);
  const settings = useAppStore((s) => s.settings);
  const lang = settings.language;
  const blocking = isFocusBlockingActive(timer, settings);
  const [showReturnOverlay, setShowReturnOverlay] = useState(false);
  const leftDuringFocusRef = useRef(false);

  useEffect(() => {
    syncFocusBlockState(timer, settings, Date.now());
    if (!settings.focusModeEnabled) {
      clearFocusBlockState();
    }
  }, [timer, settings]);

  useEffect(() => {
    if (!blocking) {
      setShowReturnOverlay(false);
      leftDuringFocusRef.current = false;
      return;
    }

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        leftDuringFocusRef.current = true;
      } else if (document.visibilityState === "visible" && leftDuringFocusRef.current) {
        setShowReturnOverlay(true);
      }
    };

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [blocking]);

  if (!blocking || !showReturnOverlay) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[color-mix(in_oklch,var(--color-background),transparent_8%)] p-6 backdrop-blur-md"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="focus-guard-title"
    >
      <div className="max-w-md rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-8 text-center shadow-2xl">
        <p className="text-sm font-medium uppercase tracking-wide text-[var(--color-muted)]">
          {t(lang, "focus_guard_kicker")}
        </p>
        <h2 id="focus-guard-title" className="mt-2 text-2xl font-semibold">
          {t(lang, "focus_guard_title")}
        </h2>
        <p className="mt-3 text-sm text-[var(--color-muted)]">{t(lang, "focus_guard_desc")}</p>
        <button
          type="button"
          onClick={() => setShowReturnOverlay(false)}
          className="mt-6 w-full rounded-lg bg-[var(--color-accent)] px-4 py-3 text-sm font-medium text-[var(--color-foreground)] transition-colors hover:opacity-90"
        >
          {t(lang, "focus_guard_back")}
        </button>
      </div>
    </div>
  );
}
