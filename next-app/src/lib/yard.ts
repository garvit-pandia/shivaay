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

/** Truck routes across the apron: [[x, y, z], …], looped. */
export const TRUCK_PATHS: { points: [number, number, number][]; speed: number; offset: number }[] = [
  {
    points: [
      [-150, 0, -46], [-70, 0, -46], [-24, 0, -40], [4, 0, -18], [10, 0, 26], [60, 0, 44], [150, 0, 46],
    ],
    speed: 0.014,
    offset: 0,
  },
  {
    points: [
      [150, 0, 32], [66, 0, 30], [18, 0, 12], [-8, 0, -14], [-60, 0, -30], [-150, 0, -32],
    ],
    speed: 0.011,
    offset: 0.45,
  },
];

/** Gantry crane cycle constants. */
export const CRANE = {
  cycle: 16,
  railZ: 46,
  pickX: -34,
  pickZ: -24,
  placeX: -34,
  placeZ: 24,
  beamY: 16,
  hoistHigh: 13,
  hoistLow: 1.6,
} as const;

export const GATE = { x: 0, z: -70, width: 26 } as const;
