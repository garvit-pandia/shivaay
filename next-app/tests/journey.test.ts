import { test } from "node:test";
import assert from "node:assert/strict";
import {
  project,
  arcPath,
  fitViewBox,
  viewBoxString,
  journeyRoutes,
  journeyChapters,
  chapterViewBox,
  formatCoord,
  CHAPTER_ORDER,
} from "../src/lib/journey.ts";
import { INDIA_BOUNDS } from "../src/lib/india-outline.ts";
import { cities, routes } from "../src/lib/data.ts";

test("projection origin and scale", () => {
  assert.deepEqual(project(68, 37.5), { x: 0, y: 0 });
  const p = project(69, 36.5);
  assert.ok(Math.abs(p.y - 10) < 1e-9);
  assert.ok(Math.abs(p.x - 10 * Math.cos((23 * Math.PI) / 180)) < 1e-9);
});

test("every city projects inside the baked India outline bounds", () => {
  for (const c of Object.values(cities)) {
    const p = project(c.lng, c.lat);
    assert.ok(p.x > 0 && p.x < INDIA_BOUNDS.width, `${c.name} x=${p.x}`);
    assert.ok(p.y > 0 && p.y < INDIA_BOUNDS.height, `${c.name} y=${p.y}`);
  }
});

test("arcPath bends perpendicular to the chord", () => {
  assert.equal(arcPath({ x: 0, y: 0 }, { x: 10, y: 0 }, 0.5), "M 0 0 Q 5 5 10 0");
  assert.equal(arcPath({ x: 0, y: 0 }, { x: 10, y: 0 }, 0), "M 0 0 Q 5 0 10 0");
});

test("fitViewBox frames points at the requested aspect", () => {
  const v = fitViewBox([{ x: 0, y: 0 }, { x: 100, y: 20 }], 10, 1);
  assert.equal(v.w, v.h);
  assert.equal(v.w, 120);
  assert.equal(v.x, -10);
  assert.equal(v.y + v.h / 2, 10); // centred vertically
  const tall = fitViewBox([{ x: 0, y: 0 }, { x: 10, y: 100 }], 0, 0.5);
  assert.equal(tall.h, 100);
  assert.equal(tall.w, 50);
  assert.throws(() => fitViewBox([], 0, 1));
  assert.equal(viewBoxString({ x: 1.234, y: 2, w: 3.35, h: 4 }), "1.2 2 3.4 4");
});

test("one journey route per data route, all starting with a move", () => {
  assert.equal(journeyRoutes.length, routes.length);
  for (const r of journeyRoutes) assert.match(r.d, /^M [\d.-]+ [\d.-]+ Q /);
});

test("chapters grow the network cumulatively and end with every route drawn", () => {
  assert.deepEqual(journeyChapters.map((c) => c.city), [...CHAPTER_ORDER]);
  assert.deepEqual(journeyChapters[0].routes, []);
  for (let i = 1; i < journeyChapters.length; i++) {
    const prev = new Set(journeyChapters[i - 1].routes);
    for (const id of prev) assert.ok(journeyChapters[i].routes.includes(id));
    assert.ok(journeyChapters[i].routes.length > prev.size, `chapter ${i} adds a route`);
  }
  assert.equal(journeyChapters.at(-1)!.routes.length, routes.length);
});

test("chapter camera frames every visited city", () => {
  for (const ch of journeyChapters) {
    const v = chapterViewBox(ch, 0.9);
    assert.ok(Math.abs(v.w / v.h - 0.9) < 1e-9);
    for (const c of ch.frame) {
      const p = project(cities[c].lng, cities[c].lat);
      assert.ok(p.x > v.x && p.x < v.x + v.w && p.y > v.y && p.y < v.y + v.h, `${c} in ${ch.city} frame`);
    }
  }
});

test("formatCoord", () => {
  assert.equal(formatCoord(30.901, 75.8573), "30.90°N 75.86°E");
});
