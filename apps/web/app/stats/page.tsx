import type { Metadata } from "next";
import { StatsView } from "@/components/Stats/StatsView";

export const metadata: Metadata = {
  title: "Focus Stats",
  description:
    "Track your Pomodoro focus minutes, streaks, and project breakdown with Pomo.",
};

export default function StatsPage() {
  return <StatsView />;
}
