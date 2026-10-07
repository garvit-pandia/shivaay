"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Menu, X, ChevronDown, Link2, FileText, Download, MapPin } from "lucide-react";
import { Icon } from "@/components/ui/Icon";

const links = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
];

const resourceLinks = [
  { href: "/resources/links", label: "Quick Links", icon: Link2 },
  { href: "/resources/documents", label: "Documents", icon: FileText },
  { href: "/resources/files", label: "Download Files", icon: Download },
  { href: "/resources/ports", label: "Ports/ICDs/CFS", icon: MapPin },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  const contactActive = pathname === "/contact";
  const resourcesActive = pathname.startsWith("/resources");

  // Close menus when the route changes (adjust-during-render pattern).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setResourcesOpen(false);
    setMenuOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const linkClass = (active: boolean) =>
    `text-sm font-medium transition-colors no-underline ${
      active
        ? "text-teal relative after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-[2px] after:rounded after:bg-teal"
        : "text-ink-dim hover:text-teal"
    }`;

  return (
    <nav className={`sticky top-0 ${menuOpen ? "z-[70]" : "z-50"} bg-white border-b border-border`} aria-label="Primary navigation">
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
                className={linkClass(pathname === l.href)}
                {...(pathname === l.href ? { "aria-current": "page" as const } : {})}
              >
                {l.label}
              </Link>
            </li>
          ))}

          <li
            className="relative"
            onMouseEnter={() => setResourcesOpen(true)}
            onMouseLeave={() => setResourcesOpen(false)}
            onKeyDown={(e) => { if (e.key === "Escape") setResourcesOpen(false); }}
          >
            <button
              type="button"
              className={`flex items-center gap-1 bg-transparent border-0 cursor-pointer p-0 ${linkClass(resourcesActive)}`}
              aria-expanded={resourcesOpen}
              aria-haspopup="true"
              onClick={() => setResourcesOpen(!resourcesOpen)}
            >
              Resources
              <Icon
                icon={ChevronDown}
                size={14}
                className={`transition-transform ${resourcesOpen ? "rotate-180" : ""}`}
                aria-hidden={true}
              />
            </button>
            {resourcesOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3">
                <ul className="w-64 bg-white border border-border rounded-2xl shadow-[0_12px_40px_rgba(30,27,24,0.12)] py-2 list-none m-0 p-0">
                  {resourceLinks.map((r) => (
                    <li key={r.href} className="px-2">
                      <Link
                        href={r.href}
                        onClick={() => setResourcesOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm no-underline transition-colors ${
                          pathname === r.href
                            ? "text-teal bg-teal-tint font-semibold"
                            : "text-ink-dim hover:text-teal hover:bg-teal-tint"
                        }`}
                        {...(pathname === r.href ? { "aria-current": "page" as const } : {})}
                      >
                        <Icon icon={r.icon} size={15} aria-hidden={true} />
                        {r.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>

          <li>
            <Link
              href="/contact"
              className={linkClass(contactActive)}
              {...(contactActive ? { "aria-current": "page" as const } : {})}
            >
              Contact
            </Link>
          </li>
        </ul>

        <Link
          href="tel:+918847467790"
          className="hidden sm:inline-flex items-center gap-2 bg-ink text-white px-5 py-2.5 rounded-full text-sm font-semibold no-underline hover:bg-teal transition-colors duration-200"
        >
          <Icon icon={Phone} size={16} aria-hidden={true} />
          Call Now
        </Link>

        <button
          className="md:hidden p-2 text-ink bg-transparent border-0 cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close navigation menu" : "Toggle navigation menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <Icon icon={X} size={24} /> : <Icon icon={Menu} size={24} />}
        </button>
      </div>

      {/* Mobile Sheet */}
      {menuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-white md:hidden overflow-y-auto pb-12">
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

            <li className="w-full max-w-xs">
              <p className="text-ink-dim text-xs font-semibold uppercase tracking-[0.18em] text-center mb-4">
                Resources
              </p>
              <ul className="flex flex-col items-center gap-4 list-none m-0 p-0">
                {resourceLinks.map((r) => (
                  <li key={r.href}>
                    <Link
                      href={r.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-2 text-base font-semibold no-underline ${
                        pathname === r.href ? "text-teal" : "text-ink-dim"
                      }`}
                      {...(pathname === r.href ? { "aria-current": "page" as const } : {})}
                    >
                      <Icon icon={r.icon} size={16} aria-hidden={true} />
                      {r.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>

            <li>
              <Link
                href="/contact"
                onClick={() => setMenuOpen(false)}
                className={`text-lg font-semibold no-underline ${
                  contactActive ? "text-teal" : "text-ink-dim"
                }`}
                {...(contactActive ? { "aria-current": "page" as const } : {})}
              >
                Contact
              </Link>
            </li>

            <li>
              <Link href="tel:+918847467790" onClick={() => setMenuOpen(false)} className="inline-flex items-center gap-2 bg-ink text-white px-6 py-3 rounded-full text-base font-semibold no-underline mt-4 hover:bg-teal transition-colors duration-200">
                <Icon icon={Phone} size={18} aria-hidden={true} />
                Call Now
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
