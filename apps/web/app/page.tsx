import type { Metadata } from "next";
import { HomeApp } from "@/components/HomeApp";

export const metadata: Metadata = {
  title: "Free Online Pomodoro Timer",
  description:
    "Start focusing now with Pomo — a free online Pomodoro timer with tasks and Lofi Girl. No signup.",
  openGraph: {
    title: "Pomo — Free Online Pomodoro Timer",
    description:
      "Start focusing now with Pomo — a free online Pomodoro timer with tasks and Lofi Girl. No signup.",
  },
};

export default function Home() {
  return (
    <>
      {/* Crawlable intro for search engines (visually compact) */}
      <header className="sr-only">
        <h1>Pomo — Free Online Pomodoro Timer</h1>
        <p>
          Pomo is a free Pomodoro Technique timer for deep work and study. Track
          tasks, run focus sessions with short and long breaks, play Lofi Girl
          music, and keep streaks — all local in your browser, no account
          required. Available in English and German.
        </p>
      </header>
      <HomeApp />
    </>
  );
}
