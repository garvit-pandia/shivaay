/**
 * Pure helpers for the ports radar and the contact-form waybill.
 * No React / three / path aliases — imported directly by node tests.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

/** Coordinates baked into a Google Maps `pb=` embed URL (`!2d<lng>!3d<lat>`). */
export function parseEmbedCoords(url: string | undefined): LatLng | null {
  if (!url) return null;
  const m = url.match(/!2d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)/);
  if (!m) return null;
  const lng = Number(m[1]);
  const lat = Number(m[2]);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

const R = 6371; // km
const rad = (d: number) => (d * Math.PI) / 180;

/** Great-circle distance in km. */
export function distanceKm(a: LatLng, b: LatLng): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Initial bearing a → b in degrees clockwise from north, in [0, 360). */
export function bearingDeg(a: LatLng, b: LatLng): number {
  const y = Math.sin(rad(b.lng - a.lng)) * Math.cos(rad(b.lat));
  const x =
    Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) -
    Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lng - a.lng));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Radar-screen position (SVG coords, y down) for a range/bearing. */
export function polarToXY(km: number, bearing: number, maxKm: number, radius: number) {
  const r = (Math.min(km, maxKm) / maxKm) * radius;
  return { x: r * Math.sin(rad(bearing)), y: -r * Math.cos(rad(bearing)) };
}

/** Round up to a "nice" ring step so the outer ring encloses `km`. */
export function niceRange(km: number, rings = 4): { max: number; step: number } {
  const steps = [1, 2, 2.5, 5, 10, 20, 25, 50];
  const step = steps.find((s) => s * rings >= km) ?? Math.ceil(km / rings);
  return { max: step * rings, step };
}

/** FNV-1a 32-bit hash — deterministic seed for waybill ids/barcodes. */
export function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Waybill number derived from what the visitor typed, e.g. "SHV-4K9Q2M". */
export function waybillId(seed: string): string {
  return `SHV-${hash32(seed).toString(36).toUpperCase().padStart(7, "0").slice(-6)}`;
}

/** `n` bar widths (1–3 units) derived from `seed`; same seed → same barcode. */
export function barcodeBars(seed: string, n: number): number[] {
  let h = hash32(seed) || 1;
  const bars: number[] = [];
  for (let i = 0; i < n; i++) {
    // xorshift32
    h ^= h << 13;
    h >>>= 0;
    h ^= h >>> 17;
    h ^= h << 5;
    h >>>= 0;
    bars.push(1 + (h % 3));
  }
  return bars;
}
