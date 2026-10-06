import { containerColor } from "./palette.ts";

export interface YardBox {
  id: string;
  x: number;
  z: number;
  /** 0-based stacking tier. */
  tier: number;
  color: string;
}

export interface YardLabel {
  id: string;
  x: number;
  y: number;
  z: number;
  text: string;
}

export interface YardPlan {
  boxes: YardBox[];
  labels: YardLabel[];
}

/** ISO container footprint + stacking gap, in scene units (≈ metres). */
export const CONTAINER = { w: 6.06, h: 2.44, d: 2.44 } as const;
export const YARD = { w: 220, d: 150 } as const;

/** Deterministic PRNG (mulberry32), same pattern used across the codebase. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Yard lanes (z rows). Every 4th row left empty as a service lane. */
const Z_ROWS = [-48, -36, -24, -12, 0, 12, 24, 36];

export function createYard(
  seed = 116,
  density: "full" | "lite" = "full"
): YardPlan {
  const rand = mulberry32(seed);
  const cols = density === "full" ? 16 : 9;
  const boxes: YardBox[] = [];
  let n = 0;

  Z_ROWS.forEach((z, row) => {
    if (row % 4 === 3) return; // service lane — trucks drive here
    for (let c = 0; c < cols; c++) {
      if (rand() < 0.16) continue; // breathing gaps
      const x = -76 + c * (CONTAINER.w + 2.2) + rand() * 0.6 - 0.3;
      if (Math.abs(x - 24) < 5) continue; // gantry crane lane — keep legs and pick/place slots clear
      const tierCount = 1 + Math.floor(rand() * (c % 7 === 0 ? 2 : 4));
      for (let tier = 0; tier < tierCount; tier++) {
        n += 1;
        boxes.push({
          id: `SHV-${String(n).padStart(3, "0")}`,
          x,
          z,
          tier,
          color: containerColor(n),
        });
      }
    }
  });

  const labels: YardLabel[] = [];
  for (let i = 0; i < boxes.length && labels.length < 8; i += Math.ceil(boxes.length / 8)) {
    const b = boxes[i];
    if (labels.some((l) => l.x === b.x && l.z === b.z)) continue;
    labels.push({
      id: b.id,
      x: b.x,
      y: (b.tier + 1) * (CONTAINER.h + 0.12) + 2.6,
      z: b.z,
      text: `${b.id} · ${b.tier + 1} HIGH`,
    });
  }
  // Guarantee the lower bound the test asserts, even for sparse seeds.
  for (const b of boxes) {
    if (labels.length >= 6) break;
    if (labels.some((l) => l.x === b.x && l.z === b.z)) continue;
    labels.push({
      id: b.id,
      x: b.x,
      y: (b.tier + 1) * (CONTAINER.h + 0.12) + 2.6,
      z: b.z,
      text: `${b.id} · ${b.tier + 1} HIGH`,
    });
  }

  return { boxes, labels };
}

/**
 * Truck circuits on the apron: [[x, y, z], …] with `closed` feeding
 * `CatmullRomCurve3`'s closed flag. Both loops stay on the apron (x ±92,
 * z −64…44) and use the stack-free service lanes and the lane in front of the
 * gate (z = −64) — never the bare map paper beside the hero copy.
 */
export const TRUCK_PATHS: {
  points: [number, number, number][];
  speed: number;
  offset: number;
  closed: boolean;
}[] = [
  {
    // Inner circuit; its front stretch crosses the gate on the z = −64 lane.
    points: [[-88, 0, -64], [88, 0, -64], [88, 0, -12], [-88, 0, -12]],
    speed: 0.018,
    offset: 0,
    closed: true,
  },
  {
    // Outer circuit hugging the apron edges, with service-lane doglegs.
    points: [
      [92, 0, 44], [-80, 0, 44], [-92, 0, 20], [-92, 0, -40], [-60, 0, -64], [40, 0, -64], [92, 0, -40],
    ],
    speed: 0.014,
    offset: 0.5,
    closed: true,
  },
];

/** Gantry crane cycle constants. */
export const CRANE = {
  cycle: 16,
  railZ: 46,
  pickX: 24,
  pickZ: -20,
  placeX: 24,
  placeZ: 20,
  beamY: 18,
  hoistHigh: 13,
  hoistLow: 1.6,
} as const;

export const GATE = { x: 0, z: -70, width: 26 } as const;

/**
 * Gate barrier raise amount (0 = closed, 1 = fully up) for truck #1's path
 * progress `u`. Truck #1 passes the gate at u ≈ 0.19; the arm is fully raised
 * across u ∈ [0.14, 0.26], with a 0.02-wide ease on each edge (starting at
 * u = 0.12, lowering from u = 0.26) so it never snaps.
 */
export function gateRaiseAmount(u: number): number {
  const ease = (t: number) => t * t * (3 - 2 * t);
  const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
  return ease(clamp01((u - 0.12) / 0.02)) * (1 - ease(clamp01((u - 0.26) / 0.02)));
}
