export type AppLanguage = "en" | "de";

type Dict = Record<string, string>;

const en: Dict = {
  nav_timer: "Timer",
  nav_stats: "Stats",

  header_kicker: "Pomo",
  header_title: "Stay in flow",
  footer: "Local-first. No account. Your data stays in this browser.",

  phase_focus: "Focus",
  phase_short_break: "Short break",
  phase_long_break: "Long break",

  timer_on: "On",
  timer_pick_task: "Pick a task below (optional).",
  timer_tap_to_dismiss: "Tap to dismiss",

  action_pause: "Pause",
  action_resume: "Resume",
  action_start: "Start",
  action_reset: "Reset",
  action_skip: "Skip",

  tasks_title: "Today",
  tasks_task: "Task",
  tasks_placeholder: "What are you working on?",
  tasks_estimated: "Estimated pomodoros",
  tasks_add: "Add task",
  tasks_empty: "No tasks yet. Add one to estimate your day.",
  tasks_sessions: "sessions",
  tasks_est_short: "Est.",
  tasks_mark_done: "Mark done",
  tasks_mark_not_done: "Mark not done",
  tasks_remove: "Remove task",

  stats_streak: "Streak",
  stats_days_in_a_row: "days in a row",
  stats_today: "Today",
  stats_focus_sessions: "focus sessions",
  stats_this_week: "This week",
  stats_last_7_days: "Last 7 days",
  stats_tooltip_sessions: "Sessions",

  settings_aria: "Settings",
  settings_title: "Settings",
  settings_desc: "Tune durations, sounds, and pacing. Everything stays on this device.",
  settings_focus_length: "Focus length",
  settings_minutes: "minutes",
  settings_short_break: "Short break",
  settings_long_break: "Long break",
  settings_long_break_after: "Long break after",
  settings_focus_sessions: "focus sessions",
  settings_auto_advance: "Auto-advance",
  settings_auto_advance_desc: "Automatically start the next phase when one ends.",
  settings_sound: "Sound",
  settings_sound_desc: "Gentle chime when a phase ends.",
  settings_volume: "Volume",
  settings_theme: "Theme",
  settings_theme_system: "System",
  settings_theme_light: "Light",
  settings_theme_dark: "Dark",
  settings_language: "Language",
  settings_language_en: "English",
  settings_language_de: "Deutsch",
  settings_notifications: "Notifications",
  settings_notifications_desc:
    "Browser notifications when a phase ends (useful in the background).",
  settings_enable_notifications: "Enable notifications",

  offline_title: "You’re offline",
  offline_desc:
    "This page isn’t cached yet, but your installed app can still run the timer when it’s available offline.",

  notif_title: "Pomo",
  notif_work_long: "Great focus block. Time for a long break.",
  notif_work_short: "Work session done. Take a short break.",
  notif_break_over: "Break over. Ready for the next focus session.",

  milestone_4: "Nice — 4 focus sessions today.",
  milestone_8: "8 sessions today. You’re on fire.",
  milestone_x: "{n} sessions today. Keep the rhythm.",
};

const de: Dict = {
  nav_timer: "Timer",
  nav_stats: "Statistik",

  header_kicker: "Pomo",
  header_title: "Im Flow bleiben",
  footer: "Lokal-first. Kein Account. Deine Daten bleiben in diesem Browser.",

  phase_focus: "Fokus",
  phase_short_break: "Kurze Pause",
  phase_long_break: "Lange Pause",

  timer_on: "Aufgabe",
  timer_pick_task: "Unten eine Aufgabe wählen (optional).",
  timer_tap_to_dismiss: "Tippen zum Ausblenden",

  action_pause: "Pause",
  action_resume: "Weiter",
  action_start: "Start",
  action_reset: "Zurücksetzen",
  action_skip: "Überspringen",

  tasks_title: "Heute",
  tasks_task: "Aufgabe",
  tasks_placeholder: "Woran arbeitest du gerade?",
  tasks_estimated: "Geschätzte Pomodoros",
  tasks_add: "Aufgabe hinzufügen",
  tasks_empty: "Noch keine Aufgaben. Füge eine hinzu, um deinen Tag zu planen.",
  tasks_sessions: "Sessions",
  tasks_est_short: "Schätz.",
  tasks_mark_done: "Als erledigt markieren",
  tasks_mark_not_done: "Als nicht erledigt markieren",
  tasks_remove: "Aufgabe entfernen",

  stats_streak: "Serie",
  stats_days_in_a_row: "Tage am Stück",
  stats_today: "Heute",
  stats_focus_sessions: "Fokus-Sessions",
  stats_this_week: "Diese Woche",
  stats_last_7_days: "Letzte 7 Tage",
  stats_tooltip_sessions: "Sessions",

  settings_aria: "Einstellungen",
  settings_title: "Einstellungen",
  settings_desc:
    "Dauern, Sounds und Ablauf anpassen. Alles bleibt auf diesem Gerät.",
  settings_focus_length: "Fokusdauer",
  settings_minutes: "Minuten",
  settings_short_break: "Kurze Pause",
  settings_long_break: "Lange Pause",
  settings_long_break_after: "Lange Pause nach",
  settings_focus_sessions: "Fokus-Sessions",
  settings_auto_advance: "Auto-Weiter",
  settings_auto_advance_desc: "Startet die nächste Phase automatisch nach Ende.",
  settings_sound: "Sound",
  settings_sound_desc: "Sanfter Ton, wenn eine Phase endet.",
  settings_volume: "Lautstärke",
  settings_theme: "Theme",
  settings_theme_system: "System",
  settings_theme_light: "Hell",
  settings_theme_dark: "Dunkel",
  settings_language: "Sprache",
  settings_language_en: "English",
  settings_language_de: "Deutsch",
  settings_notifications: "Benachrichtigungen",
  settings_notifications_desc:
    "Browser-Benachrichtigungen am Phasenende (hilfreich im Hintergrund).",
  settings_enable_notifications: "Benachrichtigungen aktivieren",

  offline_title: "Du bist offline",
  offline_desc:
    "Diese Seite ist noch nicht im Cache, aber die installierte App kann den Timer trotzdem offline nutzen (sobald alles gecacht ist).",

  notif_title: "Pomo",
  notif_work_long: "Starker Fokus-Block. Zeit für eine lange Pause.",
  notif_work_short: "Fokus fertig. Zeit für eine kurze Pause.",
  notif_break_over: "Pause vorbei. Bereit für die nächste Fokus-Session?",

  milestone_4: "Nice — 4 Fokus-Sessions heute.",
  milestone_8: "8 Sessions heute. Stark.",
  milestone_x: "{n} Sessions heute. Bleib dran.",
};

export function t(lang: AppLanguage, key: keyof typeof en, params?: Record<string, string | number>) {
  const dict = lang === "de" ? de : en;
  const template = dict[key] ?? en[key] ?? String(key);
  if (!params) return template;
  return Object.entries(params).reduce(
    (acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)),
    template,
  );
}

