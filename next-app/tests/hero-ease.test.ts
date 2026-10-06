import { test } from "node:test";
import assert from "node:assert/strict";
import { clamp01, diveWarp, easeInOutCubic, smoothstep } from "../src/lib/hero-ease.ts";

test("endpoints and monotonicity", () => {
  assert.equal(diveWarp(0), 0);
  assert.equal(diveWarp(1), 1);
  let prev = -Infinity;
  for (let i = 0; i <= 100; i++) {
    const v = diveWarp(i / 100);
    assert.ok(v > prev, `not increasing at ${i / 100}`);
    prev = v;
  }
});

test("lingers on the map, then descends swiftly, then settles gently", () => {
  assert.ok(diveWarp(0.175) < 0.12, `early should lag linear, got ${diveWarp(0.175)}`);
  const mid = diveWarp(0.55);
  assert.ok(Math.abs(mid - 0.5) < 0.02, `mid-descent, got ${mid}`);
  const late = diveWarp(0.875);
  assert.ok(late > 0.85 && late < 1, `settling, got ${late}`);
});

test("helpers stay sane", () => {
  assert.equal(clamp01(-2), 0);
  assert.equal(clamp01(2), 1);
  assert.equal(smoothstep(0, 1, 0.5), 0.5);
  assert.equal(easeInOutCubic(0), 0);
  assert.equal(easeInOutCubic(1), 1);
});
