"use client";

import { useEffect, useRef } from "react";
import {
  COLUMNS,
  HEADLINE_WIDTH,
  HEADLINE_WORDS,
  boardRows,
  flapPath,
  rowCells,
  toCells,
  type BoardRow,
} from "@/lib/flapboard";

const ROWS = 5;
const TICK_MS = 75;
const CYCLE_MS = 6000;
const NBSP = " ";
const glyph = (c: string) => (c === " " ? NBSP : c);
/** Start cell of each column within a row string. */
const COL_START = COLUMNS.map((_, i) => COLUMNS.slice(0, i).reduce((n, c) => n + c.width, 0));

function Flap({ c }: { c: string }) {
  const g = glyph(c);
  return (
    <span className="flap">
      <span className="fh t"><b>{g}</b></span>
      <span className="fh b"><b>{g}</b></span>
      <span className="fl t"><b>{g}</b></span>
      <span className="fl b"><b>{g}</b></span>
    </span>
  );
}

const waybillOf = (r: BoardRow) =>
  JSON.stringify({ id: r.waybill, label: `LDH → ${r.dest}`, route: r.status, eta: r.time });

/**
 * Split-flap departures board. Each tile is four half-glyphs: two static
 * halves plus two leaves that fold (Web Animations API) as the drum rolls
 * forward to the next glyph. One interval drives every tile; rows shift up
 * every few seconds like a real board. Server markup = the settled board.
 */
export function FlapBoard() {
  const ref = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLSpanElement>(null);
  const initial = boardRows(0, ROWS);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    // Live IST clock (text only; harmless under reduced motion).
    const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" });
    const setClock = () => {
      if (clockRef.current) clockRef.current.textContent = `${fmt.format(new Date())} IST`;
    };
    setClock();
    const clockId = window.setInterval(setClock, 15000);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => window.clearInterval(clockId);
    }

    const bigCells = Array.from(root.querySelectorAll<HTMLElement>(".fb-big .flap"));
    const rowEls = Array.from(root.querySelectorAll<HTMLElement>(".fb-row"));
    const rowCellsEls = rowEls.map((r) => Array.from(r.querySelectorAll<HTMLElement>(".flap")));
    const all = [...bigCells, ...rowCellsEls.flat()];
    const parts = all.map((el) => {
      const [ht, hb, lt, lb] = Array.from(el.querySelectorAll<HTMLElement>("b"));
      return { ht, hb, lt, lb, leafT: lt.parentElement!, leafB: lb.parentElement! };
    });
    const current = all.map(() => " ");
    const queues: string[][] = all.map(() => []);

    const write = (i: number, c: string) => {
      const p = parts[i];
      const g = glyph(c);
      p.ht.textContent = g;
      p.hb.textContent = g;
      p.lt.textContent = g;
      p.lb.textContent = g;
      current[i] = c;
    };
    const flip = (i: number, next: string) => {
      const p = parts[i];
      const prev = glyph(current[i]);
      const g = glyph(next);
      p.ht.textContent = g; // new top revealed behind the falling leaf
      p.lt.textContent = prev; // old top folds down
      p.lb.textContent = g; // new bottom unfolds over the old one
      p.hb.textContent = prev;
      current[i] = next;
      p.leafT.animate([{ transform: "rotateX(0deg)" }, { transform: "rotateX(-90deg)" }], {
        duration: TICK_MS * 0.5,
        easing: "ease-in",
        fill: "forwards",
      });
      const down = p.leafB.animate([{ transform: "rotateX(90deg)" }, { transform: "rotateX(0deg)" }], {
        duration: TICK_MS * 0.5,
        delay: TICK_MS * 0.45,
        easing: "ease-out",
        fill: "both",
      });
      down.onfinish = () => {
        if (current[i] === next) p.hb.textContent = g;
      };
    };
    const target = (i: number, c: string) => {
      queues[i] = flapPath(current[i], c, 3 + ((i * 7) % 7));
    };

    let offset = 0;
    let word = 0;
    const applyRows = (rows: BoardRow[]) => {
      rows.forEach((r, ri) => {
        const cells = rowCells(r);
        const base = bigCells.length + ri * cells.length;
        [...cells].forEach((c, ci) => target(base + ci, c));
        rowEls[ri].dataset.status = r.status;
        rowEls[ri].dataset.waybill = waybillOf(r);
      });
    };
    const applyWord = () =>
      [...toCells(HEADLINE_WORDS[word % HEADLINE_WORDS.length], HEADLINE_WIDTH)].forEach((c, i) => target(i, c));

    // Intro: blank the board, then roll every tile up to the first timetable.
    all.forEach((_, i) => write(i, " "));
    applyWord();
    applyRows(boardRows(0, ROWS));

    let visible = true;
    const tickId = window.setInterval(() => {
      if (!visible || document.hidden) return;
      for (let i = 0; i < queues.length; i++) {
        const next = queues[i].shift();
        if (next !== undefined) flip(i, next);
      }
    }, TICK_MS);
    const cycleId = window.setInterval(() => {
      if (!visible || document.hidden) return;
      offset += 1;
      word += 1;
      applyWord();
      applyRows(boardRows(offset, ROWS));
    }, CYCLE_MS);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(root);

    return () => {
      window.clearInterval(clockId);
      window.clearInterval(tickId);
      window.clearInterval(cycleId);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className="fb">
      <div className="fb-head">
        <span className="mono-label text-[10px] text-cream/80 flex items-center gap-2">
          <span className="ticker-dot" aria-hidden="true" />
          LDH ICD · Departures
        </span>
        <span ref={clockRef} className="mono-label text-[10px] text-cream/80 tabular-nums">
          --:-- IST
        </span>
      </div>

      <div className="fb-big" aria-hidden="true">
        {[...toCells(HEADLINE_WORDS[0], HEADLINE_WIDTH)].map((c, i) => (
          <Flap key={i} c={c} />
        ))}
      </div>

      <div className="fb-table" aria-hidden="true">
        <div className="fb-labels">
          {COLUMNS.map((col) => (
            <span
              key={col.key}
              className={`fb-col mono-label${col.wide ? " fb-wide" : ""}`}
              style={{ "--cells": col.width } as React.CSSProperties}
            >
              {col.label}
            </span>
          ))}
        </div>
        {initial.map((r, ri) => {
          const cells = rowCells(r);
          return (
            <div key={ri} className="fb-row" data-status={r.status} data-scan data-waybill={waybillOf(r)}>
              {COLUMNS.map((col, ci) => {
                const slice = cells.slice(COL_START[ci], COL_START[ci] + col.width);
                return (
                  <span key={col.key} className={`fb-col${col.wide ? " fb-wide" : ""}`}>
                    {[...slice].map((c, i) => (
                      <Flap key={i} c={c} />
                    ))}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
      <p className="sr-only">
        Illustrative departures board: shipments from Ludhiana to {Array.from(new Set(initial.map((r) => r.dest))).join(", ")}.
      </p>
    </div>
  );
}
