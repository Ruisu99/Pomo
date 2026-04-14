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

  const gradId = timer.phase === "work" ? "gradWork" : "gradBreak";
  const glowId = "ringGlow";

  return (
    <div className="relative mx-auto aspect-square w-[min(100%,280px)] max-w-[280px]">
      <svg
        className="size-full -rotate-90"
        viewBox={`0 0 ${(R + STROKE) * 2} ${(R + STROKE) * 2}`}
        aria-hidden
      >
        <defs>
          <linearGradient id="gradWork" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="oklch(0.7 0.22 25)" />
            <stop offset="1" stopColor="oklch(0.58 0.22 18)" />
          </linearGradient>
          <linearGradient id="gradBreak" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="oklch(0.74 0.16 150)" />
            <stop offset="1" stopColor="oklch(0.62 0.14 200)" />
          </linearGradient>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 0.7 0"
              result="glow"
            />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={R + STROKE}
          cy={R + STROKE}
          r={R}
          stroke="color-mix(in_oklch,var(--color-foreground),transparent 82%)"
          strokeWidth={STROKE}
          fill="none"
        />
        <motion.circle
          cx={R + STROKE}
          cy={R + STROKE}
          r={R}
          stroke={`url(#${gradId})`}
          strokeWidth={STROKE + 1}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={C}
          filter={`url(#${glowId})`}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: "tween", duration: 0.35, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
}
