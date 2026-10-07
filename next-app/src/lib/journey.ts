import { cities, routes } from "./data.ts";

/**
 * Pure geometry for the homepage route-map journey. Projection constants
 * MUST match scripts/gen_india_outline.py (which bakes INDIA_PATH).
 */
export const LNG0 = 68;
export const LAT_TOP = 37.5;
export const SCALE = 10;
export const COS = Math.cos((23 * Math.PI) / 180);

export interface Pt {
  x: number;
  y: number;
}

export interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Equirectangular projection into the map's SVG units (1° lat = 10 units). */
export function project(lng: number, lat: number): Pt {
  return { x: (lng - LNG0) * SCALE * COS, y: (LAT_TOP - lat) * SCALE };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Quadratic arc from a to b. The control point sits off the chord's midpoint,
 * perpendicular to it, by `bend` × chord length (positive bends left of a→b).
 */
export function arcPath(a: Pt, b: Pt, bend = 0.18): string {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const cx = (a.x + b.x) / 2 - dy * bend;
  const cy = (a.y + b.y) / 2 + dx * bend;
  return `M ${r1(a.x)} ${r1(a.y)} Q ${r1(cx)} ${r1(cy)} ${r1(b.x)} ${r1(b.y)}`;
}

/** Smallest viewBox with `aspect` (w/h) that frames every point plus `pad`. */
export function fitViewBox(points: Pt[], pad: number, aspect: number): ViewBox {
  if (points.length === 0) throw new Error("fitViewBox: no points");
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad;
  let w = Math.max(...xs) + pad - minX;
  let h = Math.max(...ys) + pad - minY;
  const cx = minX + w / 2;
  const cy = minY + h / 2;
  if (w / h < aspect) w = h * aspect;
  else h = w / aspect;
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}

export function viewBoxString(v: ViewBox): string {
  return `${r1(v.x)} ${r1(v.y)} ${r1(v.w)} ${r1(v.h)}`;
}

export interface JourneyRoute {
  id: string;
  from: string;
  to: string;
  d: string;
}

export interface JourneyChapter {
  city: string;
  /** Routes that are drawn once this chapter is active (cumulative). */
  routes: string[];
  /** Cities framed by the camera for this chapter. */
  frame: string[];
}

const HUB = "Ludhiana";
const routeId = (from: string, to: string) => `${from}-${to}`;

export const journeyRoutes: JourneyRoute[] = routes.map(({ from, to }) => {
  const a = cities[from];
  const b = cities[to];
  // Bend every route the same way relative to the hub so arcs fan out.
  return {
    id: routeId(from, to),
    from,
    to,
    d: arcPath(project(a.lng, a.lat), project(b.lng, b.lat), from === HUB ? 0.16 : -0.14),
  };
});

/**
 * Chapter order follows the cargo story: HQ → border → distribution → ports.
 * A chapter reveals every route that touches its city and connects to a city
 * already visited, so the network grows rather than appearing all at once.
 */
export const CHAPTER_ORDER = ["Ludhiana", "Amritsar", "Delhi", "Mumbai", "Mundra"] as const;

export const journeyChapters: JourneyChapter[] = CHAPTER_ORDER.map((city, i) => {
  const visited = new Set(CHAPTER_ORDER.slice(0, i + 1));
  const drawn = routes
    .filter((r) => visited.has(r.from as (typeof CHAPTER_ORDER)[number]) && visited.has(r.to as (typeof CHAPTER_ORDER)[number]))
    .map((r) => routeId(r.from, r.to));
  const frame = i === 0 ? [HUB] : [...visited];
  return { city, routes: drawn, frame };
});

/** Camera framing per chapter; the HQ chapter gets a tighter fixed zoom. */
export function chapterViewBox(chapter: JourneyChapter, aspect: number): ViewBox {
  const pts = chapter.frame.map((c) => project(cities[c].lng, cities[c].lat));
  const pad = chapter.frame.length === 1 ? 34 : 26;
  return fitViewBox(pts, pad, aspect);
}

/** Degrees as a waybill-style coordinate, e.g. "30.90°N 75.86°E". */
export function formatCoord(lat: number, lng: number): string {
  return `${lat.toFixed(2)}°N ${lng.toFixed(2)}°E`;
}
