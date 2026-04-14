"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { remainingMs } from "@pomodoro/core";
import { useAppStore } from "@/store/app-store";

const R = 120;
const STROKE = 10;
const C = 2 * Math.PI * R;

export function TimerRing({ nowMs }: { nowMs: number }) {
  const timer = useAppStore((s) => s.timer);
  const settings = useAppStore((s) => s.settings);

  const { rem, total } = useMemo(() => {
    const totalMs =
      (timer.phase === "work"
        ? settings.workDuration
        : timer.phase === "shortBreak"
          ? settings.shortBreak
          : settings.longBreak) * 1000;
    const rem = remainingMs(timer, settings, nowMs);
    return { rem, total: totalMs };
  }, [timer, settings, nowMs]);

  const progress = total > 0 ? 1 - rem / total : 0;
  const offset = C * (1 - Math.max(0, Math.min(1, progress)));

  const phaseColor =
    timer.phase === "work"
      ? "var(--color-primary)"
      : "oklch(0.62 0.12 200)";

  return (
    <div className="relative mx-auto aspect-square w-[min(100%,280px)] max-w-[280px]">
      <svg
        className="size-full -rotate-90"
        viewBox={`0 0 ${(R + STROKE) * 2} ${(R + STROKE) * 2}`}
        aria-hidden
      >
        <circle
          cx={R + STROKE}
          cy={R + STROKE}
          r={R}
          stroke="var(--color-card-border)"
          strokeWidth={STROKE}
          fill="none"
        />
        <motion.circle
          cx={R + STROKE}
          cy={R + STROKE}
          r={R}
          stroke={phaseColor}
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: "tween", duration: 0.35, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
}
