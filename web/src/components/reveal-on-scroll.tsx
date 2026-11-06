"use client";

import { useEffect } from "react";

// Plays the "rise" and "pop" entrances (globals.css) once, when an element with
// data-reveal scrolls into view. Render once per page; it renders nothing.
//
// Only things below the fold get hidden, and only here on the client, so the
// server HTML always shows everything (no JS, bots) and nothing on screen blinks out.

const STAGGER_MS = 60;
const MAX_STAGGER_STEPS = 6;

export function RevealOnScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Things that come into view together play one after another
        const entering = entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement);
        entering.forEach((el, i) => {
          el.style.setProperty("--reveal-delay", `${Math.min(i, MAX_STAGGER_STEPS) * STAGGER_MS}ms`);
          el.dataset.revealState = "in";
          observer.unobserve(el);
        });
      },
      // Wait until the element is a little way up the screen, not just touching the bottom
      { rootMargin: "0px 0px -10% 0px" },
    );

    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
      const state = el.dataset.revealState;
      if (state === "in") return;
      if (state !== "waiting") {
        // The hero has its own load animation; anything already on screen stays as is
        if (el.closest(".hero-rise")) return;
        if (el.getBoundingClientRect().top < window.innerHeight) return;
        el.dataset.revealState = "waiting";
      }
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
