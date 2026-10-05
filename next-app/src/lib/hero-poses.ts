import * as THREE from "three";

export interface Pose {
  pos: [number, number, number];
  target: [number, number, number];
}

/** Author-time-independent keyframes: progress 0 → 1 dives map → yard. */
export const POSES: Pose[] = [
  { pos: [0, 420, 260], target: [0, 0, 0] },     // high over the network map
  { pos: [4, 210, 150], target: [+6, 0, 14] },   // descending, beacons visible
  { pos: [61, 168, 164], target: [-30, 4, 6] },  // yard approach — high three-quarter, descending
  { pos: [82, 128, 182], target: [-48, 4, 2] },  // settled — wide diorama; yard right, copy left
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
