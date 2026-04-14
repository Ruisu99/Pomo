import type { Settings } from "./types";

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
  backgroundPreset: "solid",
  backgroundSolid: "#0b0f19",
  backgroundImageDataUrl: null,
};

export function clampSettings(partial: Partial<Settings>): Settings {
  const s = { ...DEFAULT_SETTINGS, ...partial };
  const preset =
    s.backgroundPreset === "pomoRed" ||
    s.backgroundPreset === "customImage" ||
    s.backgroundPreset === "solid"
      ? s.backgroundPreset
      : "solid";
  return {
    ...s,
    workDuration: Math.max(60, Math.min(120 * 60, s.workDuration)),
    shortBreak: Math.max(60, Math.min(60 * 60, s.shortBreak)),
    longBreak: Math.max(60, Math.min(60 * 60, s.longBreak)),
    longBreakAfter: Math.max(1, Math.min(12, Math.floor(s.longBreakAfter))),
    soundVolume: Math.max(0, Math.min(1, s.soundVolume)),
    language: s.language === "de" ? "de" : "en",
    backgroundPreset: preset,
    backgroundSolid:
      typeof s.backgroundSolid === "string" && s.backgroundSolid.trim().length > 0
        ? s.backgroundSolid
        : DEFAULT_SETTINGS.backgroundSolid,
    backgroundImageDataUrl:
      typeof s.backgroundImageDataUrl === "string" ? s.backgroundImageDataUrl : null,
  };
}
