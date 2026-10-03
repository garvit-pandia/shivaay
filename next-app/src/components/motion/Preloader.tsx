"use client";

import { useEffect, useState } from "react";

type Stage = "loading" | "exit" | "gone";

/**
 * Waybill preloader — teal container doors cover the first paint,
 * a barcode scans, a CLEARED stamp slams, then the doors swing open.
 * Shown once per session; hidden entirely for reduced motion / no-JS (CSS).
 */
export function Preloader() {
  const [stage, setStage] = useState<Stage>("loading");

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("sl-seen") === "1";
    } catch {
      seen = false;
    }
    if (seen) {
      const t = setTimeout(() => setStage("gone"), 0);
      return () => clearTimeout(t);
    }
    const t1 = setTimeout(() => setStage("exit"), 1600);
    const t2 = setTimeout(() => {
      try {
        sessionStorage.setItem("sl-seen", "1");
      } catch {
        /* private mode */
      }
      setStage("gone");
    }, 2750);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (stage === "gone") return null;

  return (
    <div
      className={`preloader ${stage === "exit" ? "preloader-exit" : ""}`}
      style={{ background: "transparent" }}
      aria-hidden="true"
    >
      {/* Core sits above the doors, fades as doors open */}
      <div className="preloader-core absolute z-[9002] flex flex-col items-center gap-5">
        <div className="stamp-badge preloader-stamp h-24 w-24 text-orange bg-cream/90 text-[11px]">
          Cleared
          <br />
          LDH · 2026
        </div>
      </div>

      {/* Container doors */}
      <div className="preloader-door left corrugated-strong">
        <div className="flex flex-col items-end gap-3 pr-6 text-cream">
          <span className="mono-label text-xs opacity-80">Shivaay</span>
          <span className="barcode block h-8 w-24 text-cream/80" />
          <span className="mono-label text-[9px] opacity-60">Waybill № 116 · LDH</span>
        </div>
      </div>
      <div className="preloader-door right corrugated-strong">
        <div className="flex flex-col items-start gap-3 pl-6 text-cream">
          <span className="mono-label text-xs opacity-80">Logistics</span>
          <span className="mono-label text-[9px] opacity-60">Customs Broker · Est. 2009</span>
          <div className="preloader-scan h-8 w-24 border border-cream/30" />
        </div>
      </div>
    </div>
  );
}
