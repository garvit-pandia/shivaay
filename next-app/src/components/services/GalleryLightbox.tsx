"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { galleryImages } from "@/lib/data";

export function GalleryLightbox() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);

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
          <h2 id="gallery-heading" className="font-serif text-3xl lg:text-4xl font-medium text-ink text-center mb-12">
            Our network
          </h2>
          <div className="gallery-grid">
            {galleryImages.map((img, i) => (
              <div
                key={i}
                className="gallery-item"
                onClick={(e) => { triggerRef.current = e.currentTarget; open(i); }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") { triggerRef.current = e.currentTarget; open(i); } }}
              >
                <Image src={img.src} alt={img.alt} width={400} height={300} className="w-full h-full object-cover" />
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
            <X size={20} />
          </button>
        </div>
      )}
    </>
  );
}
