"use client";

import { useEffect, useState } from "react";

/**
 * Fake-live "shipments cleared today" ticker. Deterministic base from the
 * day of year (so it feels consistent), increments at random intervals.
 */
export function LiveTicker() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor(
      (now.getTime() - start.getTime()) / 86_400_000
    );
    const minutesToday = now.getHours() * 60 + now.getMinutes();
    const base = 180 + ((dayOfYear * 37) % 90) + Math.floor(minutesToday * 0.35);

    let timeout: ReturnType<typeof setTimeout>;
    const tick = () => {
      setCount((c) => (c === null ? c : c + (Math.random() > 0.5 ? 2 : 1)));
      timeout = setTimeout(tick, 3500 + Math.random() * 4500);
    };
    timeout = setTimeout(() => {
      setCount(base);
      timeout = setTimeout(tick, 2500);
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <span className="mono-label inline-flex items-center gap-2 text-xs text-teal">
      <span className="ticker-dot" aria-hidden="true" />
      <span className="tabular-nums font-bold text-ink">
        {count === null ? "\u00A0\u00A0\u00A0" : count}
      </span>
      shipments cleared today
    </span>
  );
}
