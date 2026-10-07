/**
 * Tiny shared flag between the page transition and entrance animations: while
 * the transition curtain covers the screen, newly mounted pages delay their
 * entrances so they play as the curtain lifts instead of behind it.
 */
let coveredUntil = 0;

/** Called by PageTransition: the curtain will lift at roughly `ms` from now. */
export function markCovered(ms: number) {
  coveredUntil = performance.now() + ms;
}

export function markUncovered() {
  coveredUntil = 0;
}

/** Seconds an entrance animation should wait (0 when nothing is covering). */
export function entranceDelay(): number {
  if (typeof performance === "undefined") return 0;
  return Math.max(0, (coveredUntil - performance.now()) / 1000);
}
