"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { testimonials } from "@/lib/data";

export function TestimonialsSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);

  const scrollTo = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;
      track.scrollTo({ left: index * cardWidth, behavior: "smooth" });
    },
    [cardWidth]
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const resize = () => {
      const first = track.querySelector(".testimonial-card") as HTMLElement | null;
      if (first) setCardWidth(first.offsetWidth + 16);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const idx = Math.round(track.scrollLeft / cardWidth);
      setActive(Math.min(idx, testimonials.length - 1));
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [cardWidth]);

  return (
    <section className="py-24 bg-white border-t border-border" aria-labelledby="testimonials-heading">
      <div className="mx-auto max-w-[1280px] px-6">
        <h2 id="testimonials-heading" className="font-serif text-3xl lg:text-4xl font-medium text-ink text-center mb-12">
          Trusted by businesses
        </h2>
        <div
          ref={trackRef}
          className="flex gap-4 overflow-x-auto pb-4 testimonial-scroll"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          role="region"
          aria-label="Client testimonials"
          tabIndex={0}
        >
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial-card">
              <p className="testimonial-quote">{t.quote}</p>
              <div className="flex items-center gap-3">
                <div className="testimonial-avatar">{t.initials}</div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`h-2 rounded-full border-0 cursor-pointer transition-all duration-300 ${
                active === i ? "w-7 bg-teal" : "w-2 bg-border"
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
