"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Faq } from "@/lib/data";

/**
 * Waybill FAQ accordion. One open at a time, full keyboard support via
 * native buttons, aria-expanded wiring. Static content renders with no-JS
 * (all answers visible only after JS — see note) — answers are in the
 * DOM regardless, so crawlers and no-JS readers get everything.
 */
export function Faq({ items, idPrefix }: { items: Faq[]; idPrefix: string }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-border border-y border-border">
      {items.map((f, i) => {
        const isOpen = open === i;
        const btnId = `${idPrefix}-btn-${i}`;
        const panelId = `${idPrefix}-panel-${i}`;
        return (
          <div key={i} className={`faq-item${isOpen ? " faq-open" : ""}`}>
            <button
              id={btnId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 py-5 text-left cursor-pointer bg-transparent border-0"
            >
              <span className="flex items-baseline gap-4">
                <span className="mono-label text-[10px] text-orange shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-grotesk font-semibold text-ink">
                  {f.q}
                </span>
              </span>
              <ChevronDown
                size={18}
                className="faq-chevron text-teal shrink-0"
                aria-hidden="true"
              />
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              className="faq-answer"
            >
              <div>
                <p className="text-ink-dim text-sm leading-relaxed pb-6 pl-9 pr-4 m-0 max-w-3xl">
                  {f.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
