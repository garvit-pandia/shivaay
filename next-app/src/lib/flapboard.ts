import { routes } from "./data.ts";

/**
 * Pure model for the split-flap departure board hero. No React/DOM — the
 * component drives the DOM; this decides what each cell shows.
 */

/** Drum order of a physical flap: a cell can only advance forward. */
export const DRUM = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:-.";

export interface BoardColumn {
  key: "time" | "dest" | "waybill" | "status";
  label: string;
  width: number;
  /** Hidden on narrow screens. */
  wide?: boolean;
}

export const COLUMNS: BoardColumn[] = [
  { key: "time", label: "Time", width: 5, wide: true },
  { key: "dest", label: "Destination", width: 9 },
  { key: "waybill", label: "Waybill", width: 7, wide: true },
  { key: "status", label: "Status", width: 10 },
];

export const STATUSES = ["CLEARED", "FILED", "ASSESSED", "IN TRANSIT", "AT GATE", "RELEASED"] as const;
export type Status = (typeof STATUSES)[number];

/** Words for the large headline row (7 tiles). */
export const HEADLINE_WORDS = ["CLEARED", "SHIVAAY", "ON TIME", "LDH ICD", "FILED", "RELEASE"];
export const HEADLINE_WIDTH = 7;

export interface BoardRow {
  time: string;
  dest: string;
  waybill: string;
  status: Status;
}

/** Every city reachable from the Ludhiana hub, per the routes data. */
const DESTINATIONS = routes.filter((r) => r.from === "Ludhiana").map((r) => r.to.toUpperCase());

/** Upper-case, map unknown glyphs to space, pad/truncate to `n` cells. */
export function toCells(s: string, n: number): string {
  const clean = [...s.toUpperCase()].map((c) => (DRUM.includes(c) ? c : " ")).join("");
  return clean.slice(0, n).padEnd(n, " ");
}

/**
 * Glyph sequence a cell flips through to get from `from` to `to`, excluding
 * `from`, ending at `to`. Real drums only roll forward; long trips are
 * shortened to their last `maxSteps` glyphs so every cell settles quickly.
 */
export function flapPath(from: string, to: string, maxSteps: number): string[] {
  if (from === to) return [];
  const a = Math.max(0, DRUM.indexOf(from));
  const b = Math.max(0, DRUM.indexOf(to));
  const dist = (b - a + DRUM.length) % DRUM.length;
  const steps: string[] = [];
  for (let i = 1; i <= dist; i++) steps.push(DRUM[(a + i) % DRUM.length]);
  return steps.slice(-Math.max(1, maxSteps));
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Row `k` of the endless timetable — deterministic, so SSR matches. */
export function boardRow(k: number): BoardRow {
  const minutes = (6 * 60 + k * 25) % (24 * 60);
  return {
    time: `${pad2(Math.floor(minutes / 60))}:${pad2(minutes % 60)}`,
    dest: DESTINATIONS[k % DESTINATIONS.length],
    waybill: `SHV${String(4100 + ((k * 37) % 900)).padStart(4, "0")}`,
    status: STATUSES[(k * 5 + 1) % STATUSES.length],
  };
}

/** The `count` rows visible at timetable offset `start`. */
export function boardRows(start: number, count: number): BoardRow[] {
  return Array.from({ length: count }, (_, i) => boardRow(start + i));
}

/** Full cell string for a row, columns concatenated (no separators). */
export function rowCells(row: BoardRow): string {
  return COLUMNS.map((c) => toCells(row[c.key], c.width)).join("");
}

export const ROW_WIDTH = COLUMNS.reduce((n, c) => n + c.width, 0);
