/**
 * Three-free math helpers shared by the hero driver (initial bundle) and the
 * lazy scene. Keep this module free of `three` imports — anything reachable
 * from `useHeroProgress` must not drag the 3D engine into the first load.
 */

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/**
 * Dive pacing: linger over the map, descend swiftly through the clouds,
 * settle gently into the yard. Piecewise smoothstep — C1-continuous with
 * soft beats at the knots. warp(0) = 0, warp(1) = 1, strictly increasing.
 */
export function diveWarp(t: number): number {
  const c = clamp01(t);
  if (c < 0.35) return 0.22 * smoothstep(0, 0.35, c);
  if (c < 0.75) return 0.22 + 0.56 * smoothstep(0.35, 0.75, c);
  return 0.78 + 0.22 * smoothstep(0.75, 1, c);
}
