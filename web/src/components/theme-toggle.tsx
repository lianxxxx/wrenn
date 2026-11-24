"use client";

import { useSyncExternalStore } from "react";

// Light / dark switch for the navbar. Light is the default; the choice is saved in
// localStorage so it sticks on the next visit (the script in layout.tsx applies it early).

// The "dark" class on <html> is the single source of truth. The button reads it
// (and re-reads it whenever it changes), so the icon always matches the page.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
const isDark = () => document.documentElement.classList.contains("dark");
const isDarkOnServer = () => false;

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, isDarkOnServer);

  function toggle() {
    const next = !dark;
    const root = document.documentElement;
    const apply = () => {
      root.classList.toggle("dark", next);
      try {
        localStorage.setItem("theme", next ? "dark" : "light");
      } catch {
        // Private browsing can block storage; the switch still works for this visit
      }
    };

    // "Night falls": the new theme comes in like a curtain with a cloud edge (see globals.css).
    // Older browsers and reduced motion just switch.
    if (!document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply();
      return;
    }
    root.dataset.themeTo = next ? "dark" : "light";
    const transition = document.startViewTransition(apply);
    transition.finished.finally(() => delete root.dataset.themeTo);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex size-9 shrink-0 items-center justify-center rounded-full border border-navy/20 text-navy transition-transform duration-150 ease-out active:scale-[0.96]"
    >
      {dark ? (
        // Sun: click to go back to light
        <svg key="sun" viewBox="0 0 24 24" className="theme-icon size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        // Moon: click to go dark
        <svg key="moon" viewBox="0 0 24 24" className="theme-icon size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}
