export interface Waybill {
  id: string;
  label: string;
  route?: string;
  eta?: string;
}

export interface ScanRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CursorState {
  dom: Waybill | null;
  threeD: Waybill | null;
  scanRect: ScanRect | null;
}

const EMPTY: CursorState = { dom: null, threeD: null, scanRect: null };
let state: CursorState = EMPTY;
const listeners = new Set<() => void>();

export function getCursorState(): CursorState {
  return state;
}

/** Effective waybill: the 3D hover wins while the pointer is over the canvas. */
export function activeWaybill(): Waybill | null {
  return state.threeD ?? state.dom;
}

export function subscribeCursor(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function emit(next: CursorState) {
  state = next;
  listeners.forEach((fn) => fn());
}

export function setDomWaybill(waybill: Waybill | null, scanRect: ScanRect | null = null) {
  emit({ ...state, dom: waybill, scanRect });
}

export function setThreeWaybill(waybill: Waybill | null) {
  emit({ ...state, threeD: waybill });
}

/** Test-only helper. */
export function resetCursorStore() {
  state = EMPTY;
  listeners.clear();
}
