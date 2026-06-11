"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Phone, Menu, X } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <nav className="sticky top-0 z-50 nav-blur border-b border-border h-[72px]" aria-label="Primary navigation">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 no-underline" aria-label="Shivaay Logistics Home">
          <Image src="/logo.svg" alt="Shivaay Logistics" width={44} height={44} className="brightness-110" priority />
          <span className="hidden min-[480px]:block font-display font-bold text-white text-lg">
            Shivaay
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`text-sm font-medium transition-colors no-underline ${
                  pathname === l.href
                    ? "text-amber relative after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-[2px] after:rounded after:bg-amber"
                    : "text-text-dim hover:text-white"
                }`}
                {...(pathname === l.href ? { "aria-current": "page" as const } : {})}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="tel:+918847467790"
          className="hidden sm:inline-flex items-center gap-2 btn-primary px-5 py-2.5 text-sm no-underline"
        >
          <Phone size={16} aria-hidden="true" />
          Call Now
        </Link>

        <button
          className="md:hidden p-2 text-white bg-transparent border-0 cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close navigation menu" : "Toggle navigation menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sheet */}
      {menuOpen && (
        <div className="fixed inset-0 top-[72px] z-40 bg-midnight/95 backdrop-blur-md md:hidden">
          <ul className="flex flex-col items-center gap-6 pt-12 list-none m-0 p-0">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`text-lg font-semibold no-underline ${
                    pathname === l.href ? "text-amber" : "text-text-dim"
                  }`}
                  {...(pathname === l.href ? { "aria-current": "page" as const } : {})}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="tel:+918847467790" className="inline-flex items-center gap-2 btn-primary px-6 py-3 text-base mt-4 no-underline">
                <Phone size={18} aria-hidden="true" />
                Call Now
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
