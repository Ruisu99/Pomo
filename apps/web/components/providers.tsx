"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/app-store";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const hydrate = useAppStore((s) => s.hydrate);
  const theme = useAppStore((s) => s.settings.theme);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "dark") root.classList.add("dark");
    else if (theme === "light") root.classList.add("light");
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const root = document.documentElement;
      root.classList.remove("light", "dark");
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  return <>{children}</>;
}

export function TimerSync() {
  const sync = useAppStore((s) => s.sync);
  useEffect(() => {
    const id = window.setInterval(() => {
      sync(Date.now());
    }, 250);
    return () => window.clearInterval(id);
  }, [sync]);
  return null;
}
