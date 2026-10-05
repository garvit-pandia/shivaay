import * as THREE from "three";

export interface Pose {
  pos: [number, number, number];
  target: [number, number, number];
}

/** Author-time-independent keyframes: progress 0 → 1 dives map → yard. */
export const POSES: Pose[] = [
  { pos: [0, 420, 260], target: [0, 0, 0] },     // high over the network map
  { pos: [4, 210, 150], target: [+6, 0, 14] },   // descending, beacons visible
  { pos: [18, 80, 120], target: [0, 2, 4] },     // yard approach
  { pos: [20, 10, 48], target: [0, 2.5, -2] },   // settled — matches the Canvas camera in HeroStage.tsx
];

export const CAMERA_SPAN = { near: 0.5, far: 4000 } as const;

export function makeCurves() {
  return {
    pos: new THREE.CatmullRomCurve3(POSES.map((p) => new THREE.Vector3(...p.pos))),
    target: new THREE.CatmullRomCurve3(POSES.map((p) => new THREE.Vector3(...p.target))),
  };
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
