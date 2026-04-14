export async function ensureNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

export function notifyPhaseComplete(
  language: "en" | "de",
  phase: "work" | "shortBreak" | "longBreak",
  nextPhase: "work" | "shortBreak" | "longBreak",
): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const title = "Pomo";
  let body = "";
  if (language === "de") {
    if (phase === "work") {
      body =
        nextPhase === "longBreak"
          ? "Starker Fokus-Block. Zeit für eine lange Pause."
          : "Fokus fertig. Zeit für eine kurze Pause.";
    } else {
      body = "Pause vorbei. Bereit für die nächste Fokus-Session?";
    }
  } else {
    if (phase === "work") {
      body =
        nextPhase === "longBreak"
          ? "Great focus block. Time for a long break."
          : "Work session done. Take a short break.";
    } else {
      body = "Break over. Ready for the next focus session.";
    }
  }

  try {
    new Notification(title, { body, silent: false });
  } catch {
    /* ignore */
  }
}
