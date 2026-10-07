"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { galleryImages } from "@/lib/data";
import { gsap, useGSAP, MOTION_OK } from "@/components/motion/gsap";
import { TextReveal } from "@/components/motion/TextReveal";

export function GalleryLightbox() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Each photo sits behind a pair of container doors that swing apart as it
  // scrolls in, while the photo settles from a slight zoom. The doors only
  // exist visually once this runs (`.has-doors`), so no-JS shows photos.
  useGSAP(
    () => {
      const grid = gridRef.current;
      if (!grid) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        grid.classList.add("has-doors");
        gsap.utils.toArray<HTMLElement>(".gallery-item", grid).forEach((item, i) => {
          gsap
            .timeline({
              scrollTrigger: { trigger: item, start: "top 85%", once: true },
              delay: i * 0.12,
              defaults: { duration: 1.2, ease: "power3.inOut" },
            })
            .to(item.querySelector(".gal-door-l"), { xPercent: -102 }, 0)
            .to(item.querySelector(".gal-door-r"), { xPercent: 102 }, 0)
            .from(item.querySelector("img"), { scale: 1.35, duration: 1.6, ease: "expo.out" }, 0.15);
        });
        return () => grid.classList.remove("has-doors");
      });
      return () => mm.revert();
    },
    { scope: gridRef }
  );

  const open = useCallback((i: number) => { setOpenIdx(i); }, []);
  const close = useCallback(() => { setOpenIdx(null); }, []);
  const isOpen = openIdx !== null;

  useEffect(() => {
    if (!isOpen) return;
    const lightbox = lightboxRef.current;
    if (!lightbox) return;
    lightbox.focus();

    const focusableSelectors = 'button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { close(); return; }
      if (e.key !== "Tab") return;
      const focusable = Array.from(lightbox.querySelectorAll(focusableSelectors)).filter(
        (el) => el instanceof HTMLElement && el.offsetParent !== null
      ) as HTMLElement[];
      if (focusable.length === 0) { e.preventDefault(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (e.shiftKey) {
        if (active === first || active === lightbox) { e.preventDefault(); last.focus(); }
      } else {
        if (active === last) { e.preventDefault(); first.focus(); }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen && triggerRef.current) { triggerRef.current.focus(); }
  }, [isOpen]);

  return (
    <>
      <section className="py-24 bg-white border-t border-border" aria-labelledby="gallery-heading">
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="mb-12">
            <p className="mono-label text-[10px] text-orange mb-3">
              Manifest — Network · 03
            </p>
            <TextReveal id="gallery-heading" className="font-serif text-4xl lg:text-6xl font-medium text-ink leading-[1.05]">
              Our network
            </TextReveal>
          </div>
          <div ref={gridRef} className="gallery-grid">
            {galleryImages.map((img, i) => (
              <div
                key={i}
                className="gallery-item"
                data-scan
                data-stamp="scanned"
                onClick={(e) => { triggerRef.current = e.currentTarget; open(i); }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") { triggerRef.current = e.currentTarget; open(i); } }}
              >
                <Image src={img.src} alt={img.alt} width={400} height={300} className="w-full h-full object-cover" />
                <span className="gal-door gal-door-l corrugated" aria-hidden="true" />
                <span className="gal-door gal-door-r corrugated" aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {isOpen && (
        <div ref={lightboxRef} className="lightbox open" onClick={close} role="dialog" aria-modal="true" aria-label="Image gallery lightbox" tabIndex={-1}>
          <Image src={galleryImages[openIdx].src} alt={galleryImages[openIdx].alt} width={1200} height={800} className="max-w-[90vw] max-h-[90vh] object-contain" onClick={(e) => e.stopPropagation()} priority />
          <button
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white text-teal flex items-center justify-center border-0 cursor-pointer shadow-[0_2px_8px_rgba(30,27,24,0.2)] hover:text-teal-hover transition-colors"
            onClick={close}
            aria-label="Close lightbox"
          >
            <Icon icon={X} size={20} />
          </button>
        </div>
      )}
    </>
  );
}
