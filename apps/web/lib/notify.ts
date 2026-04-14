export async function ensureNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

export function notifyPhaseComplete(
  phase: "work" | "shortBreak" | "longBreak",
  nextPhase: "work" | "shortBreak" | "longBreak",
): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const title = "Pomodoro";
  let body = "";
  if (phase === "work") {
    body =
      nextPhase === "longBreak"
        ? "Great focus block. Time for a long break."
        : "Work session done. Take a short break.";
  } else {
    body = "Break over. Ready for the next focus session.";
  }

  try {
    new Notification(title, { body, silent: false });
  } catch {
    /* ignore */
  }
}
