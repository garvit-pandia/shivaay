import { test } from "node:test";
import assert from "node:assert/strict";
import { containerColor, TEAL_CYCLE, ACCENT_ORANGE } from "../src/lib/palette.ts";

test("cycles teals and stripes orange every 5th", () => {
  assert.equal(containerColor(0), TEAL_CYCLE[0]);
  assert.equal(containerColor(1), TEAL_CYCLE[1]);
  assert.equal(containerColor(2), TEAL_CYCLE[2]);
  assert.equal(containerColor(3), TEAL_CYCLE[0]);
  assert.equal(containerColor(4), ACCENT_ORANGE);
  assert.equal(containerColor(9), ACCENT_ORANGE);
  assert.equal(containerColor(10), TEAL_CYCLE[1]);
  assert.equal(containerColor(14), ACCENT_ORANGE);
});

test("never returns undefined for large indexes", () => {
  for (let i = 0; i < 500; i++) {
    assert.match(containerColor(i), /^#[0-9A-F]{6}$/i);
  }
});
