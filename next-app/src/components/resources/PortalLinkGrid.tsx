import { ExternalLink } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { portalLinks } from "@/lib/resources";
import { TiltGroup } from "@/components/motion/TiltGroup";

export function PortalLinkGrid() {
  return (
    <section className="py-16 lg:py-20 bg-cream" aria-label="Transport & customs portals">
      <div className="mx-auto max-w-[1280px] px-6">
        <TiltGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {portalLinks.map((link, i) => (
            <div
              key={link.address}
              data-tilt
              className="reveal waybill flex flex-col justify-between gap-5 bg-white rounded-2xl p-6 card-hover"
            >
              <div>
                <p className="mono-label text-[9px] text-orange mb-1.5">
                  Portal {String(i + 1).padStart(2, "0")}
                </p>
                <h2 className="font-semibold text-ink">{link.name}</h2>
                <p className="text-ink-dim text-xs mt-2 truncate" title={link.address}>
                  {link.address}
                </p>
              </div>
              <a
                href={link.address}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline mono-label self-start text-[10px]"
              >
                Visit
                <Icon icon={ExternalLink} size={14} aria-hidden={true} />
              </a>
            </div>
          ))}
        </TiltGroup>
      </div>
    </section>
  );
}
