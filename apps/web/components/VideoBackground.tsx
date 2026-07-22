"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/app-store";

export const PIXEL_CITY_VIDEO_SRC = "/backgrounds/city-sunset.webm";

/** Full-viewport looping pixel-art city sunset video background. */
export function VideoBackground() {
  const preset = useAppStore((s) => s.settings.backgroundPreset);
  const videoRef = useRef<HTMLVideoElement>(null);
  const active = preset === "pixelCity";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!active) {
      video.pause();
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      video.pause();
      video.currentTime = 0;
      return;
    }

    video.muted = true;
    void video.play().catch(() => undefined);
  }, [active]);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden"
      aria-hidden
    >
      <video
        ref={videoRef}
        className="absolute inset-0 size-full object-cover"
        src={PIXEL_CITY_VIDEO_SRC}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
      {/* Soft scrim so cards stay readable over bright sky */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,18,0.18)_0%,rgba(8,10,18,0.38)_100%)]" />
    </div>
  );
}
