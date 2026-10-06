import { test } from "node:test";
import assert from "node:assert/strict";
import {
  setDomWaybill, setThreeWaybill, getCursorState, activeWaybill,
  subscribeCursor, resetCursorStore,
} from "../src/lib/cursor-store.ts";

test("notifies subscribers and prefers the 3D waybill", () => {
  resetCursorStore();
  let calls = 0;
  const unsub = subscribeCursor(() => { calls += 1; });

  setDomWaybill({ id: "SHV-001", label: "Customs Clearance" }, { x: 1, y: 2, w: 3, h: 4 });
  assert.equal(activeWaybill()?.id, "SHV-001");
  assert.equal(getCursorState().scanRect?.w, 3);

  setThreeWaybill({ id: "SHV-TRK", label: "Inbound — Mundra" });
  assert.equal(activeWaybill()?.id, "SHV-TRK");

  setDomWaybill(null);
  assert.equal(activeWaybill()?.id, "SHV-TRK");

  setThreeWaybill(null);
  assert.equal(activeWaybill(), null);

  assert.equal(calls, 4);
  unsub();
  setDomWaybill({ id: "X", label: "x" });
  assert.equal(calls, 4);
});
