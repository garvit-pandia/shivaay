"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Stage = "idle" | "enter" | "exit";

/**
 * Container-door page transitions. Intercepts internal link clicks,
 * closes two teal panels, navigates, then opens them. Disabled for
 * reduced motion (panels are display:none and clicks pass through).
 */
export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [stage, setStage] = useState<Stage>("idle");
  const [prev, setPrev] = useState(pathname);
  const [pending, setPending] = useState<string | null>(null);

  // Navigation completed → open the doors (adjust-during-render pattern)
  if (prev !== pathname) {
    setPrev(pathname);
    if (pending) {
      setPending(null);
      setStage("exit");
    }
  }

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const a = (e.target as HTMLElement | null)?.closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      if (/^(https?:|mailto:|tel:)/i.test(href)) return;
      const target = href.split("#")[0];
      if (target === pathname || target === "") return;

      e.preventDefault();
      setPending(href);
      setStage("enter");
      window.setTimeout(() => router.push(href), 470);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname, router]);

  useEffect(() => {
    if (stage !== "exit") return;
    const t = setTimeout(() => setStage("idle"), 750);
    return () => clearTimeout(t);
  }, [stage]);

  return (
    <div
      className={`page-wipe ${stage !== "idle" ? "active" : ""} ${stage}`}
      aria-hidden="true"
    >
      <div className="wipe-panel left corrugated" />
      <div className="wipe-panel right corrugated" />
    </div>
  );
}
