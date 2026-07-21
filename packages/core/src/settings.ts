import { DEFAULT_BLOCKED_SITES, normalizeBlockedSites } from "./focus";
import type { AmbientTrackId, Settings } from "./types";

const AMBIENT_TRACKS: AmbientTrackId[] = [
  "lofi",
  "rain",
  "cafe",
  "whitenoise",
  "forest",
];

export const DEFAULT_SETTINGS: Settings = {
  workDuration: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
  longBreakAfter: 4,
  autoAdvance: false,
  focusModeEnabled: false,
  blockDistractions: true,
  blockedSites: [...DEFAULT_BLOCKED_SITES],
  strictFocus: true,
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
  return AMBIENT_TRACKS.includes(id as AmbientTrackId)
    ? (id as AmbientTrackId)
    : "lofi";
}

export function clampSettings(partial: Partial<Settings>): Settings {
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
    ...s,
    workDuration: Math.max(60, Math.min(120 * 60, s.workDuration)),
    shortBreak: Math.max(60, Math.min(60 * 60, s.shortBreak)),
    longBreak: Math.max(60, Math.min(60 * 60, s.longBreak)),
    longBreakAfter: Math.max(1, Math.min(12, Math.floor(s.longBreakAfter))),
    soundVolume: Math.max(0, Math.min(1, s.soundVolume)),
    ambientVolume: Math.max(0, Math.min(1, s.ambientVolume)),
    ambientTrackId: normalizeAmbientTrackId(s.ambientTrackId),
    ambientEnabled: Boolean(s.ambientEnabled),
    ambientAutoPlayOnStart: s.ambientAutoPlayOnStart !== false,
    language: s.language === "de" ? "de" : "en",
    backgroundPreset: preset,
    backgroundSolid:
      typeof s.backgroundSolid === "string" && s.backgroundSolid.trim().length > 0
        ? s.backgroundSolid
        : DEFAULT_SETTINGS.backgroundSolid,
    backgroundImageDataUrl:
      typeof s.backgroundImageDataUrl === "string" ? s.backgroundImageDataUrl : null,
    blockedSites: normalizeBlockedSites(
      Array.isArray(s.blockedSites) ? s.blockedSites : DEFAULT_SETTINGS.blockedSites,
    ),
    focusModeEnabled: Boolean(s.focusModeEnabled),
    blockDistractions: s.blockDistractions !== false,
    strictFocus: s.strictFocus !== false,
  };
}
