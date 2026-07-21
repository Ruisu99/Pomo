import type { AmbientTrackId, Settings } from "./types";

export const DEFAULT_SETTINGS: Settings = {
  workDuration: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
  longBreakAfter: 4,
  autoAdvance: false,
  soundEnabled: true,
  soundVolume: 0.6,
  theme: "system",
  language: "en",
  backgroundPreset: "pomoRed",
  backgroundSolid: "#df3c3c",
  backgroundImageDataUrl: null,
  ambientEnabled: false,
  ambientTrackId: "lofi",
  ambientVolume: 0.35,
  ambientAutoPlayOnStart: true,
};

function normalizeAmbientTrackId(id: unknown): AmbientTrackId {
  if (id === "jazz") return "jazz";
  return "lofi";
}

export function clampSettings(partial: Partial<Settings> & Record<string, unknown>): Settings {
  const s = { ...DEFAULT_SETTINGS, ...partial };
  const preset =
    s.backgroundPreset === "pomoRed" ||
    s.backgroundPreset === "pomoSlate" ||
    s.backgroundPreset === "pomoGold" ||
    s.backgroundPreset === "customImage" ||
    s.backgroundPreset === "solid"
      ? s.backgroundPreset
      : "solid";

  return {
    workDuration: Math.max(60, Math.min(120 * 60, s.workDuration)),
    shortBreak: Math.max(60, Math.min(60 * 60, s.shortBreak)),
    longBreak: Math.max(60, Math.min(60 * 60, s.longBreak)),
    longBreakAfter: Math.max(1, Math.min(12, Math.floor(s.longBreakAfter))),
    autoAdvance: Boolean(s.autoAdvance),
    soundEnabled: s.soundEnabled !== false,
    soundVolume: Math.max(0, Math.min(1, s.soundVolume)),
    theme:
      s.theme === "light" || s.theme === "dark" || s.theme === "system"
        ? s.theme
        : "system",
    language: s.language === "de" ? "de" : "en",
    backgroundPreset: preset,
    backgroundSolid:
      typeof s.backgroundSolid === "string" && s.backgroundSolid.trim().length > 0
        ? s.backgroundSolid
        : DEFAULT_SETTINGS.backgroundSolid,
    backgroundImageDataUrl:
      typeof s.backgroundImageDataUrl === "string" ? s.backgroundImageDataUrl : null,
    ambientEnabled: Boolean(s.ambientEnabled),
    ambientTrackId: normalizeAmbientTrackId(s.ambientTrackId),
    ambientVolume: Math.max(0, Math.min(1, s.ambientVolume)),
    ambientAutoPlayOnStart: s.ambientAutoPlayOnStart !== false,
  };
}
