"use client";

import { useRef } from "react";
import { FileText, Stamp, ReceiptIndianRupee, Truck } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { gsap, useGSAP, MOTION_OK } from "@/components/motion/gsap";
import { TextReveal } from "@/components/motion/TextReveal";

const steps = [
  {
    icon: FileText,
    code: "ST.01",
    title: "Documents in",
    text: "You share the invoice and packing list. We verify HS codes, duty rates, and NOC requirements before anything moves.",
  },
  {
    icon: Stamp,
    code: "ST.02",
    title: "Filing",
    text: "Bill of entry or shipping bill filed electronically — ideally before the vessel berths, so clearance starts at arrival.",
  },
  {
    icon: ReceiptIndianRupee,
    code: "ST.03",
    title: "Duty & release",
    text: "You approve the challan, duty is paid to the government, and we chase the out-of-charge until the goods are released.",
  },
  {
    icon: Truck,
    code: "ST.04",
    title: "Last mile",
    text: "Transport is pre-booked, so cargo rolls from port to your door with live tracking — detention clock stopped.",
  },
];

/**
 * Clearance runbook. Desktop: the section pins and the steps travel
 * horizontally while the route line draws and a truck rides it. Mobile: a
 * vertical list whose rail draws with scroll.
 */
export function ProcessTimeline() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const track = el.querySelector<HTMLElement>(".proc-track")!;
      const mm = gsap.matchMedia();

      mm.add(`${MOTION_OK} and (min-width: 1024px)`, () => {
        const distance = () => Math.max(0, track.scrollWidth - el.clientWidth);
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
        tl.to(track, { x: () => -distance() }, 0)
          .fromTo(".proc-rail-fill", { scaleX: 0 }, { scaleX: 1 }, 0)
          .fromTo(".proc-truck", { left: "0%" }, { left: "100%" }, 0);
        gsap.utils.toArray<HTMLElement>(".proc-step", el).forEach((step) => {
          gsap.from(step.querySelectorAll(".proc-anim"), {
            y: 40,
            opacity: 0,
            stagger: 0.08,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: step,
              containerAnimation: tl,
              start: "left 82%",
              toggleActions: "play none none reverse",
            },
          });
        });
      });

      mm.add(`${MOTION_OK} and (max-width: 1023px)`, () => {
        gsap.fromTo(
          ".proc-rail-fill",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: track, start: "top 70%", end: "bottom 60%", scrub: true },
          }
        );
        gsap.utils.toArray<HTMLElement>(".proc-step", el).forEach((step) => {
          gsap.from(step.querySelectorAll(".proc-anim"), {
            y: 28,
            opacity: 0,
            stagger: 0.08,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: step, start: "top 82%", once: true },
          });
        });
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      className="proc relative bg-ink text-cream overflow-hidden"
      aria-labelledby="process-heading"
    >
      <div className="proc-track">
        <div className="proc-intro">
          <p className="mono-label text-[10px] text-orange mb-3">Manifest · 03 — Process</p>
          <TextReveal
            id="process-heading"
            className="font-serif text-4xl lg:text-6xl font-medium text-cream leading-[1.05] mb-6"
          >
            How clearance works
          </TextReveal>
          <p className="text-cream/70 max-w-sm leading-relaxed">
            Four steps, one accountable team. This is the exact runbook behind every shipment we
            touch.
          </p>
          <p className="mono-label text-[9px] text-cream/45 mt-10 hidden lg:block" aria-hidden="true">
            Keep scrolling →
          </p>
        </div>

        <div className="proc-steps">
          <div className="proc-rail" aria-hidden="true">
            <span className="proc-rail-fill" />
            <span className="proc-truck">
              <Truck size={18} strokeWidth={2} />
            </span>
          </div>
          <ol className="proc-list list-none m-0 p-0">
          {steps.map((s, i) => (
            <li key={s.code} className="proc-step">
              <span className="proc-num proc-anim" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex items-center gap-3 mb-5 proc-anim">
                <span className="w-11 h-11 rounded-xl flex items-center justify-center bg-teal text-white">
                  <Icon icon={s.icon} size={20} aria-hidden={true} />
                </span>
                <span className="mono-label text-[10px] text-cream/55">{s.code}</span>
              </div>
              <h3 className="font-grotesk text-2xl font-semibold text-cream mb-3 proc-anim">
                <span className="sr-only">Step {i + 1}: </span>
                {s.title}
              </h3>
              <p className="text-cream/70 leading-relaxed proc-anim">{s.text}</p>
            </li>
          ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
