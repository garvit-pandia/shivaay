import { ExternalLink } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { portalLinks } from "@/lib/resources";

export function PortalLinkGrid() {
  return (
    <section className="pb-20 bg-white" aria-label="Transport & customs portals">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {portalLinks.map((link) => (
            <div
              key={link.address}
              className="reveal flex flex-col justify-between gap-5 bg-white border border-border rounded-2xl p-6 border-l-[3px] border-l-teal card-hover"
            >
              <div>
                <h2 className="font-semibold text-ink">{link.name}</h2>
                <p className="text-ink-dim text-xs mt-2 truncate" title={link.address}>
                  {link.address}
                </p>
              </div>
              <a
                href={link.address}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline self-start text-sm"
              >
                Visit
                <Icon icon={ExternalLink} size={14} aria-hidden={true} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
