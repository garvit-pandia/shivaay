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
