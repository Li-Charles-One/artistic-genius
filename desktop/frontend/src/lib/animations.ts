// Shared animation configuration.
// Mirrors the CSS token system (--dur-fast/--dur-base/--dur-slow/--ease-out)
// so JS-driven animations stay in sync with the CSS transition layer.

/** 120ms — color/border hovers, tooltips. */
export const DUR_FAST = 120;

/** 180ms — popovers, menus, small enters. Matches CSS --dur-base. */
export const DUR_BASE = 180;

/** 340ms — drawers, modals, panel slides. Matches CSS --dur-slow. */
export const DUR_SLOW = 340;

/** App-wide ease-out curve. */
export const EASE_OUT = "cubic-bezier(0.2, 0.72, 0.2, 1)";

/** Quick exit curve for dismissal animations. */
export const EASE_IN = "cubic-bezier(0.4, 0, 1, 1)";

/** Returns true when the user has requested reduced motion at the OS level. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
