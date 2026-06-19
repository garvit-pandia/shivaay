"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { storySteps } from "@/lib/data";
import { IndiaMapSVG } from "./IndiaMapSVG";

export function MapStory() {
  const [activeStep, setActiveStep] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const blockRefs = useRef<Array<HTMLElement | null>>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setupObserver = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect();
    const observer = new IntersectionObserver(
      (entries) => {
        let bestIdx = activeStep;
        let bestRatio = 0;
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestIdx = Number(entry.target.getAttribute("data-step"));
          }
        });
        if (bestRatio > 0 && bestIdx !== activeStep) {
          setActiveStep(bestIdx);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.1, 0.5, 1] }
    );
    blockRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    observerRef.current = observer;
    return observer;
  }, [activeStep]);

  useEffect(() => {
    const observer = setupObserver();
    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [setupObserver]);

  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-[42%_58%] gap-0 lg:gap-8">
      {/* Map column — sticky (desktop) */}
      <div className="hidden lg:block sticky top-[88px] h-[calc(100dvh-88px)] order-1">
        <IndiaMapSVG activeStep={activeStep} reduceMotion={reduceMotion} />
      </div>

      {/* Mobile map — sticky on top */}
      <div className="lg:hidden sticky top-0 h-[52vh] z-10 order-1 bg-[#FAF8F4]">
        <IndiaMapSVG activeStep={activeStep} reduceMotion={reduceMotion} />
      </div>

      {/* Story column */}
      <div className="order-2 lg:py-0 py-12">
        {/* Desktop elevation progress (left rail) */}
        <div className="hidden lg:flex sticky top-[88px] left-0 h-[calc(100dvh-88px)] pointer-events-none absolute -ml-12 w-8 flex-col items-center justify-center gap-3">
          <svg viewBox="0 0 20 200" className="h-[60%] w-3" aria-hidden="true">
            <line x1="10" y1="10" x2="10" y2="190" stroke="#0F766E" strokeWidth="1.5" />
            {storySteps.map((_, i) => {
              const y = 10 + (180 / (storySteps.length - 1)) * i;
              const done = i < activeStep;
              const active = i === activeStep;
              return (
                <g key={i}>
                  {active ? (
                    <circle cx="10" cy={y} r="5" fill="#0F766E" />
                  ) : done ? (
                    <path d={`M 7 ${y - 3} L 9 ${y} L 13 ${y - 3}`} fill="none" stroke="#0F766E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  ) : (
                    <circle cx="10" cy={y} r="3.5" fill="none" stroke="#6B5E4A" strokeWidth="1.5" />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Story blocks */}
        <div className="lg:pl-12">
          {storySteps.map((step, i) => (
            <section
              key={i}
              ref={(el) => { blockRefs.current[i] = el; }}
              data-step={i}
              className="min-h-[60vh] lg:min-h-[80vh] flex flex-col justify-center py-12 lg:py-20 max-w-[520px]"
            >
              <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-teal mb-3">
                {step.eyebrow}
              </div>
              <h3 className="font-serif text-2xl lg:text-3xl font-medium text-ink leading-[1.2] mb-4">
                {step.headline}
              </h3>
              <p className="text-base text-ink-dim leading-[1.7] mb-6">
                {step.body}
              </p>
              <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#E8E4DB] bg-white px-3 py-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-teal" />
                <span className="text-xs font-medium text-ink">{step.valueProp}</span>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
