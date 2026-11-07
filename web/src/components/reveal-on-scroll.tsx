"use client";

import { useEffect } from "react";

// Plays the "rise" and "pop" entrances (globals.css) once, when an element with
// data-reveal scrolls into view. Render once per page; it renders nothing.
//
// Only things below the fold get hidden, and only here on the client, so the
// server HTML always shows everything (no JS, bots) and nothing on screen blinks out.

//
// Groups: put data-reveal-group on a parent (a card row, a list). When any of its
// waiting children comes into view, all of them play together, one after another
// in page order, so offset or tilted cards never reveal out of order.

const STAGGER_MS = 70;
const MAX_STAGGER_STEPS = 6;

export function RevealOnScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Things without a group that come into view together also play one after another
        let loose = 0;
        const reveal = (el: HTMLElement, step: number) => {
          el.style.setProperty("--reveal-delay", `${Math.min(step, MAX_STAGGER_STEPS) * STAGGER_MS}ms`);
          el.dataset.revealState = "in";
          observer.unobserve(el);
        };

        entries
          .filter((e) => e.isIntersecting)
          .forEach((e) => {
            const el = e.target as HTMLElement;
            // Already played as part of its group earlier in this batch
            if (el.dataset.revealState !== "waiting") return;
            const group = el.closest<HTMLElement>("[data-reveal-group]");
            if (group) {
              group
                .querySelectorAll<HTMLElement>('[data-reveal-state="waiting"]')
                .forEach((m, i) => reveal(m, i));
            } else {
              reveal(el, loose++);
            }
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
