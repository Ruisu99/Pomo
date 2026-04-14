import { TaskList } from "@/components/TaskList/TaskList";
import { TimerPanel } from "@/components/Timer/TimerPanel";

export default function Home() {
  return (
    <div className="space-y-6">
      <TimerPanel />
      <TaskList />
    </div>
  );
}
