/** Canonical public origin for SEO (set NEXT_PUBLIC_SITE_URL in production). */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://pomo.online";

export const SITE_NAME = "Pomo";

export const SITE_DESCRIPTION_EN =
  "Free online Pomodoro timer with tasks, focus mode, Lofi Girl music, and local-first stats. No account required.";

export const SITE_DESCRIPTION_DE =
  "Kostenloser Online-Pomodoro-Timer mit Aufgaben, Fokusmodus, Lofi-Girl-Musik und lokaler Statistik. Ohne Account.";

export const SITE_KEYWORDS = [
  "pomodoro timer",
  "pomodoro technique",
  "focus timer",
  "productivity timer",
  "study timer",
  "lofi pomodoro",
  "online pomodoro",
  "free pomodoro timer",
  "pomodoro timer online",
  "fokus timer",
  "pomodoro technik",
];
