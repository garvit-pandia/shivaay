"use client";

import { useRef } from "react";
import { ShieldCheck, Clock, BadgeIndianRupee, FileText, Headphones, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Icon as IconWrapper } from "@/components/ui/Icon";
import { gsap, useGSAP, MOTION_OK } from "@/components/motion/gsap";
import { TextReveal } from "@/components/motion/TextReveal";
import { whyUsItems } from "@/lib/data";

const iconMap: Record<string, LucideIcon> = {
  "shield-check": ShieldCheck,
  clock: Clock,
  "badge-indian-rupee": BadgeIndianRupee,
  "file-text": FileText,
  headphones: Headphones,
};

/**
 * Sticky heading column beside a ruled list; each row's hairline draws and
 * its text rises as it enters.
 */
export function WhyPartnerSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.utils.toArray<HTMLElement>(".why-row", root.current).forEach((row) => {
          gsap
            .timeline({ scrollTrigger: { trigger: row, start: "top 85%", once: true } })
            .from(row.querySelector(".why-rule"), { scaleX: 0, duration: 1, ease: "expo.out" })
            .from(row.querySelectorAll(".why-anim"), { y: 26, opacity: 0, stagger: 0.07, duration: 0.7, ease: "power3.out" }, 0.1);
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      className="bg-white border-t border-border py-24 lg:py-32"
      aria-labelledby="why-us-heading"
    >
      <div className="mx-auto max-w-[1280px] px-6 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-20 items-start">
        <div className="lg:sticky lg:top-28">
          <p className="mono-label text-[10px] text-orange mb-3">Manifest · 04 — Why us</p>
          <TextReveal
            id="why-us-heading"
            className="font-serif text-4xl lg:text-6xl font-medium text-ink leading-[1.05]"
          >
            Why partner with us
          </TextReveal>
          <span className="stamp-badge hidden lg:inline-flex text-orange w-28 h-28 text-[10px] mt-12" aria-hidden="true">
            Cleared
            <br />
            LDH
          </span>
        </div>
        <ol className="list-none m-0 p-0">
          {whyUsItems.map((item, i) => {
            const Icon = iconMap[item.icon] || Check;
            return (
              <li key={item.title} className="why-row relative py-7 lg:py-9">
                <span className="why-rule" aria-hidden="true" />
                <div className="grid grid-cols-[auto_1fr_auto] gap-5 lg:gap-8 items-start">
                  <span className="why-anim mono-label text-[10px] text-ink-dim pt-2">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="why-anim font-grotesk text-xl lg:text-2xl font-semibold text-ink">
                      {item.title}
                    </h3>
                    <p className="why-anim text-ink-dim mt-1.5">{item.description}</p>
                  </div>
                  <span className="why-anim w-11 h-11 rounded-full flex items-center justify-center bg-teal-tint">
                    <IconWrapper icon={Icon} size={18} className="text-teal" aria-hidden={true} />
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
