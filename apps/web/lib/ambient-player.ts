import type { AmbientTrackId } from "@pomodoro/core";
import { trackSrc } from "./ambient-tracks";

type AmbientState = {
  playing: boolean;
  trackId: AmbientTrackId;
  volume: number;
};

let audio: HTMLAudioElement | null = null;
let duckFactor = 1;
let baseVolume = 0.35;
let duckTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<(s: AmbientState) => void>();

function emit() {
  const state = getAmbientState();
  listeners.forEach((fn) => fn(state));
}

function ensureAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!audio) {
    audio = new Audio();
    audio.loop = true;
    audio.preload = "auto";
  }
  return audio;
}

function applyVolume() {
  if (!audio) return;
  audio.volume = Math.max(0, Math.min(1, baseVolume * duckFactor));
}

export function getAmbientState(): AmbientState {
  return {
    playing: Boolean(audio && !audio.paused),
    trackId: (audio?.dataset.trackId as AmbientTrackId) || "lofi",
    volume: baseVolume,
  };
}

export function subscribeAmbient(fn: (s: AmbientState) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export async function setAmbientTrack(trackId: AmbientTrackId): Promise<void> {
  const el = ensureAudio();
  if (!el) return;
  const wasPlaying = !el.paused;
  const src = trackSrc(trackId);
  if (el.dataset.trackId !== trackId || !el.src.endsWith(src)) {
    el.src = src;
    el.dataset.trackId = trackId;
  }
  applyVolume();
  if (wasPlaying) {
    await el.play().catch(() => undefined);
  }
  emit();
}

export async function setAmbientVolume(volume: number): Promise<void> {
  baseVolume = Math.max(0, Math.min(1, volume));
  applyVolume();
  emit();
}

export async function playAmbient(trackId?: AmbientTrackId): Promise<void> {
  const el = ensureAudio();
  if (!el) return;
  if (trackId) await setAmbientTrack(trackId);
  else if (!el.src) await setAmbientTrack("lofi");
  applyVolume();
  await el.play().catch(() => undefined);
  emit();
}

export function pauseAmbient(): void {
  audio?.pause();
  emit();
}

export function toggleAmbient(trackId: AmbientTrackId): Promise<void> {
  if (audio && !audio.paused && audio.dataset.trackId === trackId) {
    pauseAmbient();
    return Promise.resolve();
  }
  return playAmbient(trackId);
}

/** Temporarily lower ambient while a chime plays */
export function duckAmbient(durationMs = 500): void {
  duckFactor = 0.15;
  applyVolume();
  if (duckTimer) clearTimeout(duckTimer);
  duckTimer = setTimeout(() => {
    duckFactor = 1;
    applyVolume();
  }, durationMs);
}

export function stopAmbient(): void {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
  emit();
}
