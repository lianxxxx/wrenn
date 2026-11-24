"use client";

import { useEffect, useRef, useState } from "react";

// A device with a video playing inside it. The frame is part of the video itself
// (iPhone 18 Pro and MacBook Air M5 mockups by Mobile FIRST, webmobilefirst.com, free for
// commercial use; their license doesn't allow sharing the empty frame file, so only the
// finished videos are in the repo).
//
// Chrome, Edge and Firefox play the WebM, which has a see-through background.
// Safari can't show see-through video, so it gets an MP4 with the page color behind the
// device: name.mp4 on the light page, name-dark.mp4 on the dark page (swapped when the
// theme changes, keeping the spot in the video).
// It plays muted on a loop. With reduced motion it stays paused on its poster.

function isSafari(): boolean {
  const ua = navigator.userAgent;
  return /safari/i.test(ua) && !/chrome|chromium|crios|edg|fxios|android/i.test(ua);
}
const pageIsDark = () => document.documentElement.classList.contains("dark");

export function DeviceVideo({
  name,
  label,
  width,
  height,
  className = "",
}: {
  /** File name in public/demo, without the extension (name.webm, name.mp4, name-dark.mp4, name-poster.png) */
  name: string;
  label: string;
  width: number;
  height: number;
  className?: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  // Only set on Safari: the MP4 that matches the theme
  const [safariSrc, setSafariSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!isSafari()) return;
    const pick = () => setSafariSrc(`/demo/${name}${pageIsDark() ? "-dark" : ""}.mp4`);
    pick();
    const observer = new MutationObserver(pick);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [name]);

  // Start playing, and keep the same spot when Safari swaps the light/dark file
  useEffect(() => {
    const v = video.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const at = v.currentTime;
    if (safariSrc) {
      v.load();
      v.addEventListener("loadedmetadata", () => (v.currentTime = at), { once: true });
    }
    v.play().catch(() => {
      // Autoplay blocked: the poster stays
    });
  }, [safariSrc]);

  return (
    <video
      ref={video}
      poster={`/demo/${name}-poster.png`}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={label}
      width={width}
      height={height}
      className={`block h-auto w-full ${className}`}
    >
      {safariSrc ? (
        <source key={safariSrc} src={safariSrc} type="video/mp4" />
      ) : (
        <>
          <source src={`/demo/${name}.webm`} type="video/webm" />
          <source src={`/demo/${name}.mp4`} type="video/mp4" />
        </>
      )}
    </video>
  );
}
