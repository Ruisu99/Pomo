import type { AmbientTrackId } from "@pomodoro/core";

/** Legacy local loops (unused by UI; streams use YouTube). Kept for offline fallback assets. */
export type AmbientTrackMeta = {
  id: AmbientTrackId;
  src: string;
  labelKey: "ambient_lofi" | "ambient_jazz";
};

export const AMBIENT_TRACKS: AmbientTrackMeta[] = [
  { id: "lofi", src: "/audio/lofi.wav", labelKey: "ambient_lofi" },
  { id: "jazz", src: "/audio/lofi.wav", labelKey: "ambient_jazz" },
];

export function trackSrc(id: AmbientTrackId): string {
  return AMBIENT_TRACKS.find((t) => t.id === id)?.src ?? AMBIENT_TRACKS[0]!.src;
}
