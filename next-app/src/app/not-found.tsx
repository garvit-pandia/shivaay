import type { Metadata } from "next";
import Link from "next/link";
import { CrateDrop } from "@/components/motion/CrateDrop";

export const metadata: Metadata = {
  title: "Page not found | Shivaay Logistics",
};

export default function NotFound() {
  return (
    <div className="relative min-h-[80vh] flex flex-col items-center justify-center bg-cream px-6 overflow-hidden">
      <div className="absolute inset-0 bg-blueprint" aria-hidden="true" />

      <div className="relative flex flex-col items-center text-center">
        <p className="mono-label text-[11px] text-teal mb-8">
          Shivaay Logistics · Lost Shipment Desk
        </p>

        <CrateDrop className="relative">
          <h1
            aria-label="404"
            className="font-serif text-[7rem] sm:text-[10rem] lg:text-[13rem] font-normal text-ink leading-none tracking-tight"
          >
            {["4", "0", "4"].map((d, i) => (
              <span key={i} className="crate-drop inline-block" aria-hidden="true">
                {d}
              </span>
            ))}
          </h1>
          <span className="crate-stamp stamp-badge absolute -right-4 -top-2 sm:-right-16 sm:top-4 w-24 h-24 sm:w-32 sm:h-32 p-4 text-[9px] sm:text-[11px] text-orange">
            Route not found
          </span>
        </CrateDrop>

        <p className="mono-label text-[10px] text-ink-dim mt-10 mb-8">
          This page is off the manifest — check the address and try again
        </p>

        <Link href="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
