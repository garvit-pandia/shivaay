"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, FileCheck, Ship, PackageCheck, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { gsap, useGSAP, MOTION_OK } from "@/components/motion/gsap";
import { TextReveal } from "@/components/motion/TextReveal";
import { homepageServices } from "@/lib/data";

const iconMap: Record<string, LucideIcon> = {
  "file-check": FileCheck,
  ship: Ship,
  "package-check": PackageCheck,
  "shield-check": ShieldCheck,
};

const CONTAINER_COLORS = ["#0F766E", "#134E4A", "#0D9488", "#EA580C"];

/**
 * "What we do" as a stack of shipping containers: each card sticks a little
 * lower than the last (CSS sticky), and covered cards recede (GSAP scrub).
 */
export function ServiceStack() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const slots = gsap.utils.toArray<HTMLElement>(".svc-slot", root.current);
        slots.forEach((slot, i) => {
          const next = slots[i + 1];
          if (!next) return;
          const card = slot.querySelector(".svc-card");
          const depth = slots.length - 1 - i;
          gsap.to(card, {
            scale: 1 - 0.035 * depth,
            "--svc-dim": 0.28,
            ease: "none",
            scrollTrigger: {
              trigger: next,
              start: "top bottom",
              end: () => `top ${parseFloat(getComputedStyle(next).top) || 0}px`,
              scrub: true,
              invalidateOnRefresh: true,
            },
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
      className="relative bg-white border-t border-border py-24 lg:py-32"
      aria-labelledby="services-heading"
    >
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12 lg:mb-16">
          <div>
            <p className="mono-label text-[10px] text-orange mb-3">Manifest · 01 — Services</p>
            <TextReveal
              id="services-heading"
              className="font-serif text-4xl lg:text-6xl font-medium text-ink leading-[1.05]"
            >
              What we do
            </TextReveal>
          </div>
          <Link
            href="/services"
            className="mono-label text-[10px] text-teal hover:text-orange transition-colors"
          >
            View all 12 services →
          </Link>
        </div>

        <ol className="svc-stack list-none m-0 p-0">
          {homepageServices.map((s, i) => {
            const Icon = iconMap[s.icon] || PackageCheck;
            const color = CONTAINER_COLORS[i % CONTAINER_COLORS.length];
            const code = `SHV-${String(i + 1).padStart(3, "0")}`;
            return (
              <li key={s.title} className="svc-slot" style={{ "--i": i } as React.CSSProperties}>
                <Link
                  href="/services"
                  className="svc-card group"
                  data-scan
                  data-waybill={JSON.stringify({
                    id: `SHV-${String(i + 1).padStart(2, "0")}`,
                    label: s.title,
                    route: "LDH → PAN-INDIA",
                    eta: "24–72H",
                  })}
                >
                  <div className="svc-door corrugated" style={{ backgroundColor: color }}>
                    <div className="flex items-start justify-between">
                      <span className="mono-label text-[10px] text-white/85">{code}</span>
                      <Icon size={26} className="text-white" aria-hidden="true" />
                    </div>
                    <span className="svc-index" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="svc-body">
                    <p className="mono-label text-[10px] text-ink-dim mb-4">
                      Container {i + 1} of {homepageServices.length} · LDH → Pan-India
                    </p>
                    <h3 className="font-serif text-3xl lg:text-[2.6rem] leading-tight font-medium text-ink mb-4 group-hover:text-teal transition-colors">
                      {s.title}
                    </h3>
                    <p className="text-ink-dim leading-relaxed max-w-md">{s.description}</p>
                    <span className="svc-cta mono-label text-[10px] text-teal mt-auto pt-8 inline-flex items-center gap-2">
                      Explore service
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
