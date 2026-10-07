"use client";

import { testimonials } from "@/lib/data";
import { Conveyor } from "@/components/motion/Conveyor";
import { TextReveal } from "@/components/motion/TextReveal";
import Link from "next/link";

const CARD_COLORS = ["#0F766E", "#134E4A", "#0D9488"];

export function TestimonialsSection() {
  return (
    <section
      className="py-24 lg:py-32 bg-white border-t border-border overflow-hidden"
      aria-labelledby="testimonials-heading"
    >
      <div className="mx-auto max-w-[1280px] px-6 mb-12">
        <p className="mono-label text-[10px] text-orange mb-3">
          Manifest · 06 — References
        </p>
        <TextReveal
          id="testimonials-heading"
          className="font-serif text-4xl lg:text-6xl font-medium text-ink leading-[1.05]"
        >
          Trusted by businesses
        </TextReveal>
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
        {/* branded filler cards — keep the conveyor wide enough that no
            testimonial ever repeats within a single viewport */}
        <div className="cargo-card bg-cream-deep border border-border !text-ink">
          <div className="cargo-label !border-ink/25 text-ink-dim" aria-hidden="true">
            <span>Shivaay · Record</span>
            <span>Est. 2009</span>
          </div>
          <div className="font-serif text-5xl text-teal leading-none">800+</div>
          <p className="text-sm text-ink-dim m-0">
            happy clients across Ludhiana, Delhi, Mumbai, and Mundra.
          </p>
        </div>
        <Link
          href="/contact"
          className="cargo-card corrugated-strong bg-orange no-underline"
        >
          <div className="cargo-label" aria-hidden="true">
            <span>Next shipment</span>
            <span>Yours →</span>
          </div>
          <p className="font-serif text-2xl leading-snug text-white m-0">
            Your cargo could be the next one moving.
          </p>
          <span className="mono-label text-[10px] text-white/85 mt-auto">
            Get a quote →
          </span>
        </Link>
      </Conveyor>

      <p className="mono-label text-[9px] text-ink-dim text-center mt-8">
        Drag the conveyor · auto-rolls ·{" "}
        <Link
          href="https://wa.me/918847467790?text=Hi%20Shivaay%20Logistics%2C%20I%20want%20to%20share%20my%20experience%20working%20with%20you."
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal hover:text-orange transition-colors underline underline-offset-2"
        >
          cleared with us? leave a review
        </Link>
      </p>
    </section>
  );
}
