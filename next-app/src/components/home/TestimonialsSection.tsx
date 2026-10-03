"use client";

import { testimonials } from "@/lib/data";
import { Conveyor } from "@/components/motion/Conveyor";

const CARD_COLORS = ["#0F766E", "#134E4A", "#0D9488"];

export function TestimonialsSection() {
  return (
    <section
      className="py-24 bg-white border-t border-border overflow-hidden"
      aria-labelledby="testimonials-heading"
      data-station
    >
      <div className="mx-auto max-w-[1280px] px-6 mb-12">
        <p className="mono-label text-[10px] text-orange mb-3">
          Manifest · 04 — References
        </p>
        <h2
          id="testimonials-heading"
          className="font-serif text-3xl lg:text-5xl font-medium text-ink"
        >
          Trusted by businesses
        </h2>
      </div>

      <Conveyor>
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="cargo-card corrugated"
            style={{ backgroundColor: CARD_COLORS[i % CARD_COLORS.length] }}
          >
            <div className="cargo-label" aria-hidden="true">
              <span>Client · {t.initials}</span>
              <span>Verified ✓</span>
            </div>
            <p className="text-sm leading-relaxed text-cream/95 m-0">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="flex items-center gap-3 mt-auto">
              <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center font-grotesk font-bold text-xs shrink-0">
                {t.initials}
              </div>
              <div>
                <div className="font-semibold text-sm text-cream">{t.name}</div>
                <div className="text-[11px] text-cream/70">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </Conveyor>

      <p className="mono-label text-[9px] text-ink-dim text-center mt-8">
        Drag the conveyor · auto-rolls
      </p>
    </section>
  );
}
