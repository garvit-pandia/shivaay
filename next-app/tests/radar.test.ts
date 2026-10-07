import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseEmbedCoords,
  distanceKm,
  bearingDeg,
  polarToXY,
  niceRange,
  waybillId,
  barcodeBars,
} from "../src/lib/radar.ts";
import { portFacilities } from "../src/lib/resources.ts";

test("parses lat/lng from a Google Maps embed URL", () => {
  assert.deepEqual(parseEmbedCoords("https://x/embed?pb=!1m18!2d75.9098667!3d30.8767099!2m3"), {
    lat: 30.8767099,
    lng: 75.9098667,
  });
  assert.equal(parseEmbedCoords("https://www.google.com/maps?q=foo&output=embed"), null);
  assert.equal(parseEmbedCoords(undefined), null);
});

test("every facility with a pb embed resolves near Ludhiana", () => {
  const ldh = { lat: 30.901, lng: 75.8573 };
  const located = portFacilities.map((f) => parseEmbedCoords(f.maps)).filter((c) => c !== null);
  assert.ok(located.length >= 7);
  for (const c of located) assert.ok(distanceKm(ldh, c!) < 60);
});

test("distance and bearing", () => {
  const a = { lat: 0, lng: 0 };
  assert.ok(Math.abs(distanceKm(a, { lat: 1, lng: 0 }) - 111.19) < 0.1);
  assert.ok(Math.abs(bearingDeg(a, { lat: 1, lng: 0 }) - 0) < 1e-9);
  assert.ok(Math.abs(bearingDeg(a, { lat: 0, lng: 1 }) - 90) < 1e-9);
  assert.ok(Math.abs(bearingDeg(a, { lat: -1, lng: 0 }) - 180) < 1e-9);
  assert.ok(Math.abs(bearingDeg(a, { lat: 0, lng: -1 }) - 270) < 1e-9);
});

test("polarToXY puts north up and clamps to the outer ring", () => {
  const n = polarToXY(5, 0, 10, 100);
  assert.ok(Math.abs(n.x) < 1e-9 && Math.abs(n.y + 50) < 1e-9);
  const e = polarToXY(20, 90, 10, 100);
  assert.ok(Math.abs(e.x - 100) < 1e-9 && Math.abs(e.y) < 1e-9);
});

test("niceRange encloses the farthest point", () => {
  assert.deepEqual(niceRange(17), { max: 20, step: 5 });
  assert.deepEqual(niceRange(3), { max: 4, step: 1 });
  assert.deepEqual(niceRange(41), { max: 80, step: 20 });
});

test("waybill id and barcode are deterministic", () => {
  assert.match(waybillId("Priya"), /^SHV-[0-9A-Z]{6}$/);
  assert.equal(waybillId("Priya"), waybillId("Priya"));
  assert.notEqual(waybillId("Priya"), waybillId("Priyа")); // cyrillic a
  const bars = barcodeBars("Priya", 40);
  assert.equal(bars.length, 40);
  assert.ok(bars.every((b) => b >= 1 && b <= 3));
  assert.deepEqual(bars, barcodeBars("Priya", 40));
  assert.notDeepEqual(bars, barcodeBars("Priy", 40));
});
