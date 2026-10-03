"use client";

import { useRef } from "react";
import { RouteSpine } from "@/components/motion/RouteSpine";

/**
 * Homepage shell — hosts the route spine that threads through every
 * section marked with [data-station].
 */
export function HomeShell({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className="relative">
      <RouteSpine containerRef={ref} />
      {children}
    </div>
  );
}
