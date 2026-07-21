"use client";

import { AmbientDock } from "@/components/Ambient/AmbientDock";
import { TaskList } from "@/components/TaskList/TaskList";
import { TimerPanel } from "@/components/Timer/TimerPanel";
import { SessionSettingsCard } from "@/components/SessionSettings/SessionSettingsCard";

export function HomeApp() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-stretch gap-5">
      <TimerPanel />
      <AmbientDock />
      <TaskList />
      <SessionSettingsCard />
    </div>
  );
}
