"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-border" aria-label="Primary navigation">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6">
        <Link href="/" className="no-underline" aria-label="Shivaay Logistics Home">
          <span className="font-serif text-xl font-semibold text-ink tracking-tight">
            Shivaay <span className="text-teal">Logistics</span>
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
                    ? "text-teal relative after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-[2px] after:rounded after:bg-teal"
                    : "text-ink-dim hover:text-teal"
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
          className="hidden sm:inline-flex items-center gap-2 bg-ink text-white px-5 py-2.5 rounded-full text-sm font-semibold no-underline hover:bg-teal transition-colors duration-200"
        >
          <Phone size={16} aria-hidden="true" />
          Call Now
        </Link>

        <button
          className="md:hidden p-2 text-ink bg-transparent border-0 cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close navigation menu" : "Toggle navigation menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sheet */}
      {menuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-white md:hidden">
          <ul className="flex flex-col items-center gap-6 pt-12 list-none m-0 p-0">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className={`text-lg font-semibold no-underline ${
                    pathname === l.href ? "text-teal" : "text-ink-dim"
                  }`}
                  {...(pathname === l.href ? { "aria-current": "page" as const } : {})}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="tel:+918847467790" onClick={() => setMenuOpen(false)} className="inline-flex items-center gap-2 bg-ink text-white px-6 py-3 rounded-full text-base font-semibold no-underline mt-4 hover:bg-teal transition-colors duration-200">
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
