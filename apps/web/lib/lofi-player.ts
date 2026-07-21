import type { AmbientTrackId } from "@pomodoro/core";

/** Live focus streams */
export const STREAMS: Record<
  AmbientTrackId,
  { videoId: string; watchUrl: string; labelKey: "ambient_lofi" | "ambient_jazz" }
> = {
  lofi: {
    videoId: "X4VbdwhkE10",
    watchUrl: "https://www.youtube.com/watch?v=X4VbdwhkE10",
    labelKey: "ambient_lofi",
  },
  jazz: {
    videoId: "E2vONfzoyRI",
    watchUrl: "https://www.youtube.com/watch?v=E2vONfzoyRI",
    labelKey: "ambient_jazz",
  },
};

export const STREAM_ORDER: AmbientTrackId[] = ["lofi", "jazz"];

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  setVolume: (n: number) => void;
  getVolume: () => number;
  getPlayerState: () => number;
  loadVideoById: (videoId: string) => void;
  cueVideoById: (videoId: string) => void;
  destroy: () => void;
};

type YTNamespace = {
  Player: new (
    el: HTMLElement | string,
    opts: {
      videoId: string;
      width?: string | number;
      height?: string | number;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (e: { target: YTPlayer }) => void;
        onStateChange?: (e: { data: number; target: YTPlayer }) => void;
        onError?: (e: { data: number }) => void;
      };
    },
  ) => YTPlayer;
  PlayerState: {
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

type LofiState = {
  ready: boolean;
  playing: boolean;
  volume: number;
  trackId: AmbientTrackId;
  error: string | null;
};

let player: YTPlayer | null = null;
let containerEl: HTMLElement | null = null;
let currentTrackId: AmbientTrackId = "lofi";
let baseVolume = 0.35;
let duckFactor = 1;
let duckTimer: ReturnType<typeof setTimeout> | null = null;
let apiLoading: Promise<void> | null = null;
let wantPlay = false;
const listeners = new Set<(s: LofiState) => void>();

function emit() {
  const state = getLofiState();
  listeners.forEach((fn) => fn(state));
}

export function getLofiState(): LofiState {
  const playing =
    Boolean(player) &&
    typeof window !== "undefined" &&
    window.YT != null &&
    player!.getPlayerState() === window.YT.PlayerState.PLAYING;
  return {
    ready: player != null,
    playing: playing || (wantPlay && player != null),
    volume: baseVolume,
    trackId: currentTrackId,
    error: null,
  };
}

export function subscribeLofi(fn: (s: LofiState) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function loadYoutubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (apiLoading) return apiLoading;

  apiLoading = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
    if (window.YT?.Player) resolve();
  });

  return apiLoading;
}

function applyVolume() {
  if (!player) return;
  const v = Math.round(Math.max(0, Math.min(1, baseVolume * duckFactor)) * 100);
  try {
    player.setVolume(v);
    if (v <= 0) player.mute();
    else player.unMute();
  } catch {
    /* player not ready */
  }
}

export async function mountLofiPlayer(
  container: HTMLElement,
  trackId: AmbientTrackId = currentTrackId,
): Promise<void> {
  containerEl = container;
  currentTrackId = trackId;
  await loadYoutubeApi();
  if (!window.YT?.Player) return;

  if (player) {
    try {
      player.destroy();
    } catch {
      /* ignore */
    }
    player = null;
  }

  const stream = STREAMS[trackId];
  container.innerHTML = "";
  const host = document.createElement("div");
  host.id = "focus-stream-player";
  container.appendChild(host);

  player = new window.YT.Player(host, {
    videoId: stream.videoId,
    width: "100%",
    height: "100%",
    playerVars: {
      autoplay: 0,
      controls: 1,
      modestbranding: 1,
      rel: 0,
      playsinline: 1,
      origin: window.location.origin,
    },
    events: {
      onReady: (e) => {
        player = e.target;
        applyVolume();
        if (wantPlay) {
          try {
            e.target.playVideo();
          } catch {
            /* autoplay may be blocked until gesture */
          }
        }
        emit();
      },
      onStateChange: () => emit(),
      onError: () => emit(),
    },
  });
  emit();
}

export function unmountLofiPlayer(): void {
  wantPlay = false;
  if (player) {
    try {
      player.destroy();
    } catch {
      /* ignore */
    }
  }
  player = null;
  if (containerEl) containerEl.innerHTML = "";
  emit();
}

export async function setLofiTrack(trackId: AmbientTrackId): Promise<void> {
  if (trackId === currentTrackId && player) {
    emit();
    return;
  }
  currentTrackId = trackId;
  const stream = STREAMS[trackId];

  if (player) {
    try {
      if (wantPlay) {
        player.loadVideoById(stream.videoId);
      } else {
        player.cueVideoById(stream.videoId);
      }
      applyVolume();
      emit();
      return;
    } catch {
      /* fall through to remount */
    }
  }

  if (containerEl) {
    await mountLofiPlayer(containerEl, trackId);
  }
  emit();
}

export async function playLofi(): Promise<void> {
  wantPlay = true;
  if (!player && containerEl) {
    await mountLofiPlayer(containerEl, currentTrackId);
  }
  applyVolume();
  try {
    player?.unMute();
    player?.playVideo();
  } catch {
    /* ignore */
  }
  emit();
}

export function pauseLofi(): void {
  wantPlay = false;
  try {
    player?.pauseVideo();
  } catch {
    /* ignore */
  }
  emit();
}

export function toggleLofi(): Promise<void> {
  const state = getLofiState();
  if (state.playing || wantPlay) {
    pauseLofi();
    return Promise.resolve();
  }
  return playLofi();
}

export async function setLofiVolume(volume: number): Promise<void> {
  baseVolume = Math.max(0, Math.min(1, volume));
  applyVolume();
  emit();
}

/** Lower stream briefly while the phase-end chime plays */
export function duckLofi(durationMs = 500): void {
  duckFactor = 0.12;
  applyVolume();
  if (duckTimer) clearTimeout(duckTimer);
  duckTimer = setTimeout(() => {
    duckFactor = 1;
    applyVolume();
  }, durationMs);
}

/** @deprecated use STREAMS.lofi.watchUrl */
export const LOFI_GIRL_WATCH_URL = STREAMS.lofi.watchUrl;
export const LOFI_GIRL_VIDEO_ID = STREAMS.lofi.videoId;
