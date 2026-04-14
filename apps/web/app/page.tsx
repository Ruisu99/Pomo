import { TaskList } from "@/components/TaskList/TaskList";
import { TimerPanel } from "@/components/Timer/TimerPanel";
import { SessionSettingsCard } from "@/components/SessionSettings/SessionSettingsCard";

export default function Home() {
  return (
    <div className="space-y-6">
      <TimerPanel />
      <TaskList />
      <SessionSettingsCard />
    </div>
  );
}
