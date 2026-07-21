import type { AmbientTrackId } from "@pomodoro/core";

export type AmbientTrackMeta = {
  id: AmbientTrackId;
  src: string;
  labelKey:
    | "ambient_lofi"
    | "ambient_rain"
    | "ambient_cafe"
    | "ambient_whitenoise"
    | "ambient_forest";
};

export const AMBIENT_TRACKS: AmbientTrackMeta[] = [
  { id: "lofi", src: "/audio/lofi.wav", labelKey: "ambient_lofi" },
  { id: "rain", src: "/audio/rain.wav", labelKey: "ambient_rain" },
  { id: "cafe", src: "/audio/cafe.wav", labelKey: "ambient_cafe" },
  { id: "whitenoise", src: "/audio/whitenoise.wav", labelKey: "ambient_whitenoise" },
  { id: "forest", src: "/audio/forest.wav", labelKey: "ambient_forest" },
];

export function trackSrc(id: AmbientTrackId): string {
  return AMBIENT_TRACKS.find((t) => t.id === id)?.src ?? AMBIENT_TRACKS[0]!.src;
}
