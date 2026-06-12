"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { galleryImages } from "@/lib/data";

export function GalleryLightbox() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  const open = useCallback((i: number) => {
    setOpenIdx(i);
  }, []);

  const close = useCallback(() => {
    setOpenIdx(null);
  }, []);

  const isOpen = openIdx !== null;

  // Focus trap and keyboard support
  useEffect(() => {
    if (!isOpen) return;

    const lightbox = lightboxRef.current;
    if (!lightbox) return;

    // Focus the lightbox container on open
    lightbox.focus();

    const focusableSelectors = [
      'button',
      'a[href]',
      'input',
      'select',
      'textarea',
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab") return;

      const focusable = Array.from(lightbox.querySelectorAll(focusableSelectors)).filter(
        (el) => el instanceof HTMLElement && el.offsetParent !== null
      ) as HTMLElement[];

      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || active === lightbox) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  // Restore focus when lightbox closes
  useEffect(() => {
    if (!isOpen && triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [isOpen]);

  return (
    <>
      <section className="py-20 bg-white border-t border-[#ECEDF0]" aria-labelledby="gallery-heading">
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="text-center mb-12">
            <h2 id="gallery-heading" className="font-display text-3xl sm:text-4xl font-bold text-[#0B0F19]">
              Our Network
            </h2>
            <p className="text-[#4B5468] mt-3 text-lg">A glimpse into our operations across India</p>
          </div>
          <div className="gallery-grid">
            {galleryImages.map((img, i) => (
              <div
                key={i}
                className="gallery-item"
                onClick={(e) => {
                  triggerRef.current = e.currentTarget;
                  open(i);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    triggerRef.current = e.currentTarget;
                    open(i);
                  }
                }}
              >
                <Image src={img.src} alt={img.alt} width={400} height={300} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {isOpen && (
        <div
          ref={lightboxRef}
          className="lightbox open"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Image gallery lightbox"
          tabIndex={-1}
        >
          <Image src={galleryImages[openIdx].src} alt={galleryImages[openIdx].alt} width={1200} height={800} className="max-w-[90vw] max-h-[90vh] object-contain" onClick={(e) => e.stopPropagation()} priority />
          <button
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white text-[#1E3A8A] text-2xl flex items-center justify-center border-0 cursor-pointer shadow-[0_2px_8px_rgba(11,15,25,0.2)]"
            onClick={close}
            aria-label="Close lightbox"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
