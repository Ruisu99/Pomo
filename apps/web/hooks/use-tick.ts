"use client";

import { useEffect, useState } from "react";

/** Returns `Date.now()` updated on an interval (useful for countdown UIs). */
export function useTickMs(intervalMs: number): number {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return nowMs;
}
