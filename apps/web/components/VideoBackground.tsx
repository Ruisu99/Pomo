"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/app-store";

export const PIXEL_CITY_VIDEO_SRC = "/backgrounds/city-sunset.webm";

/** Full-viewport looping pixel-art city sunset video background. */
export function VideoBackground() {
  const preset = useAppStore((s) => s.settings.backgroundPreset);
  const videoRef = useRef<HTMLVideoElement>(null);
  const shouldPlayRef = useRef(false);
  const active = preset === "pixelCity";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    shouldPlayRef.current = active && !reduceMotion;

    if (!shouldPlayRef.current) {
      video.pause();
      if (reduceMotion) video.currentTime = 0;
      return;
    }

    const ensurePlaying = () => {
      if (!shouldPlayRef.current || !video) return;
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      if (video.paused || video.ended) {
        void video.play().catch(() => undefined);
      }
    };

    // Keep looping even when the native `loop` attribute stalls on WebM
    const onEnded = () => {
      if (!shouldPlayRef.current) return;
      try {
        video.currentTime = 0;
      } catch {
        /* ignore seek errors mid-decode */
      }
      ensurePlaying();
    };

    const onInterrupt = () => {
      // Browsers sometimes pause background videos under load / with other media.
      // Nudge playback back after a short delay so we don't fight intentional pauses.
      window.setTimeout(ensurePlaying, 120);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") ensurePlaying();
    };

    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.disableRemotePlayback = true;

    video.addEventListener("ended", onEnded);
    video.addEventListener("pause", onInterrupt);
    video.addEventListener("stalled", onInterrupt);
    video.addEventListener("suspend", onInterrupt);
    video.addEventListener("waiting", onInterrupt);
    document.addEventListener("visibilitychange", onVisibility);

    ensurePlaying();

    // Watchdog: recover if playback silently freezes near loop boundaries
    let lastTime = video.currentTime;
    let stuckTicks = 0;
    const watchdog = window.setInterval(() => {
      if (!shouldPlayRef.current) return;
      if (video.paused || video.ended || video.readyState < 2) {
        ensurePlaying();
        stuckTicks = 0;
        lastTime = video.currentTime;
        return;
      }
      // Playing but currentTime not advancing (common on WebM loop seams)
      if (Math.abs(video.currentTime - lastTime) < 0.05) {
        stuckTicks += 1;
        if (stuckTicks >= 2) {
          try {
            video.currentTime = 0;
          } catch {
            /* ignore */
          }
          ensurePlaying();
          stuckTicks = 0;
        }
      } else {
        stuckTicks = 0;
      }
      lastTime = video.currentTime;
    }, 1500);

    return () => {
      shouldPlayRef.current = false;
      window.clearInterval(watchdog);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("pause", onInterrupt);
      video.removeEventListener("stalled", onInterrupt);
      video.removeEventListener("suspend", onInterrupt);
      video.removeEventListener("waiting", onInterrupt);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden"
      aria-hidden
      style={{ transform: "translateZ(0)" }}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 size-full object-cover"
        style={{
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
        }}
        src={PIXEL_CITY_VIDEO_SRC}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
      />
      {/* Darker scrim keeps frosted cards + white text readable */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,18,0.42)_0%,rgba(8,10,18,0.58)_55%,rgba(8,10,18,0.68)_100%)]" />
    </div>
  );
}
