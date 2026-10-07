import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DRUM,
  COLUMNS,
  ROW_WIDTH,
  HEADLINE_WORDS,
  HEADLINE_WIDTH,
  toCells,
  flapPath,
  boardRow,
  boardRows,
  rowCells,
} from "../src/lib/flapboard.ts";

test("toCells pads, truncates and drops off-drum glyphs", () => {
  assert.equal(toCells("Delhi", 7), "DELHI  ");
  assert.equal(toCells("AMRITSAR", 5), "AMRIT");
  assert.equal(toCells("A→B", 3), "A B");
});

test("flapPath rolls forward through the drum and ends on the target", () => {
  assert.deepEqual(flapPath("A", "D", 10), ["B", "C", "D"]);
  assert.deepEqual(flapPath("A", "A", 10), []);
  // wraps past the end of the drum
  const wrap = flapPath(".", "B", 10);
  assert.deepEqual(wrap, [" ", "A", "B"]);
  // long trips are cut to the final maxSteps glyphs
  const long = flapPath(" ", "Z", 4);
  assert.deepEqual(long, ["W", "X", "Y", "Z"]);
  assert.equal(flapPath(" ", "9", 1).length, 1);
});

test("rows are deterministic and fit their columns", () => {
  assert.deepEqual(boardRow(3), boardRow(3));
  assert.equal(ROW_WIDTH, COLUMNS.reduce((n, c) => n + c.width, 0));
  for (const r of boardRows(0, 40)) {
    const cells = rowCells(r);
    assert.equal(cells.length, ROW_WIDTH);
    for (const c of cells) assert.ok(DRUM.includes(c), `glyph ${c}`);
    assert.match(r.time, /^\d\d:\d\d$/);
  }
  // destinations come from the Ludhiana routes and rotate
  const dests = new Set(boardRows(0, 8).map((r) => r.dest));
  assert.ok(dests.has("MUNDRA") && dests.has("DELHI"));
  // consecutive rows differ
  assert.notDeepEqual(boardRow(0), boardRow(1));
});

test("headline words fit the big row", () => {
  for (const w of HEADLINE_WORDS) assert.ok(w.length <= HEADLINE_WIDTH, w);
});
