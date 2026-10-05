import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createYard, CONTAINER, YARD, TRUCK_PATHS, CRANE,
} from "../src/lib/yard.ts";
import { TEAL_CYCLE, ACCENT_ORANGE } from "../src/lib/palette.ts";

const PALETTE = new Set<string>([...TEAL_CYCLE, ACCENT_ORANGE]);

test("is deterministic for a given seed", () => {
  assert.deepEqual(createYard(116), createYard(116));
  assert.notDeepEqual(createYard(116), createYard(117));
});

test("respects bounds, tiers, palette and unique ids", () => {
  const { boxes } = createYard(116);
  const ids = new Set<string>();
  for (const b of boxes) {
    assert.ok(Math.abs(b.x) <= YARD.w / 2, `x out of bounds: ${b.x}`);
    assert.ok(Math.abs(b.z) <= YARD.d / 2, `z out of bounds: ${b.z}`);
    assert.ok(b.tier >= 0 && b.tier <= 3, `tier out of range: ${b.tier}`);
    assert.ok(PALETTE.has(b.color), `bad color: ${b.color}`);
    assert.ok(!ids.has(b.id), `duplicate id: ${b.id}`);
    ids.add(b.id);
  }
});

test("lite density is lighter than full", () => {
  assert.ok(createYard(116, "lite").boxes.length < createYard(116, "full").boxes.length);
});

test("labels reference real stack positions", () => {
  const { boxes, labels } = createYard(116);
  assert.ok(labels.length >= 6 && labels.length <= 8);
  for (const l of labels) {
    assert.ok(boxes.some((b) => b.x === l.x && b.z === l.z));
  }
});

test("static scene constants are sane", () => {
  assert.ok(CONTAINER.w > CONTAINER.d);
  assert.ok(TRUCK_PATHS.length >= 2 && TRUCK_PATHS[0].points.length >= 4);
  assert.ok(CRANE.cycle > 8);
  assert.ok(CRANE.pickZ !== CRANE.placeZ);
});
