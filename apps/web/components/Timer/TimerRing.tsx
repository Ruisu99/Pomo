"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo, type ReactNode } from "react";
import { remainingMs } from "@pomodoro/core";
import { useAppStore } from "@/store/app-store";

const R = 120;
const STROKE = 10;
const C = 2 * Math.PI * R;

export function TimerRing({
  nowMs,
  children,
}: {
  nowMs: number;
  children?: ReactNode;
}) {
  const timer = useAppStore((s) => s.timer);
  const settings = useAppStore((s) => s.settings);
  const reduceMotion = useReducedMotion();

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

  // Remaining fraction: 1 = full ring at start, 0 = empty when time is up
  const remaining = total > 0 ? Math.max(0, Math.min(1, rem / total)) : 0;
  const offset = C * (1 - remaining);

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
            <stop offset="0" stopColor="oklch(0.72 0.2 25)" />
            <stop offset="1" stopColor="oklch(0.56 0.22 18)" />
          </linearGradient>
          <linearGradient id="gradBreak" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="oklch(0.74 0.14 155)" />
            <stop offset="1" stopColor="oklch(0.62 0.12 205)" />
          </linearGradient>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 0.55 0"
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
          stroke="color-mix(in_oklch,var(--color-foreground),transparent 86%)"
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
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "tween", duration: 0.35, ease: "easeOut" }
          }
        />
      </svg>
      {children ? (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          {children}
        </div>
      ) : null}
    </div>
  );
}
