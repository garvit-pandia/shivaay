import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createYard, CONTAINER, YARD, TRUCK_PATHS, CRANE, GATE, gateRaiseAmount,
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
  assert.ok(GATE.width > 10);
});

test("gate barrier raises only inside truck #1's u window", () => {
  const near = (actual: number, expected: number) =>
    assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} ≉ ${expected}`);
  assert.equal(gateRaiseAmount(0), 0);
  assert.equal(gateRaiseAmount(0.02), 0);
  near(gateRaiseAmount(0.04), 0.5); // easing in
  assert.equal(gateRaiseAmount(0.15), 1); // held up across [0.05, 0.25]
  near(gateRaiseAmount(0.26), 0.5); // easing out
  assert.equal(gateRaiseAmount(0.3), 0);
  assert.equal(gateRaiseAmount(1), 0);
  assert.equal(gateRaiseAmount(-0.1), 0);
});
