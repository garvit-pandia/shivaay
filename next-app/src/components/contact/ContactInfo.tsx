import { contactInfo } from "@/lib/data";
import { MapPin, Phone, Mail, Clock, Calendar } from "lucide-react";

export function ContactInfo() {
  return (
    <div>
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">Contact Information</h2>
      <p className="text-text-dim mb-8">Reach out to us for any logistics requirements</p>
      <ul className="list-none m-0 p-0 space-y-5">
        <li className="flex items-start gap-4">
          <div className="why-us-check">
            <MapPin size={16} strokeWidth={2} aria-hidden="true" />
          </div>
          <div>
            <div className="text-text-dim text-xs font-semibold uppercase tracking-wide mb-1">Office Address</div>
            <div className="text-white text-sm leading-relaxed">{contactInfo.address}</div>
          </div>
        </li>
        <li className="flex items-start gap-4">
          <div className="why-us-check">
            <Phone size={16} strokeWidth={2} aria-hidden="true" />
          </div>
          <div>
            <div className="text-text-dim text-xs font-semibold uppercase tracking-wide mb-1">Phone</div>
            <div className="text-white text-sm leading-relaxed">
              {contactInfo.phones.map((p, i) => (
                <span key={p}>
                  {i > 0 && " / "}
                  <a href={`tel:${p.replace(/\s/g, "")}`} className="text-white hover:text-amber transition-colors no-underline">{p}</a>
                </span>
              ))}
            </div>
          </div>
        </li>
        <li className="flex items-start gap-4">
          <div className="why-us-check">
            <Mail size={16} strokeWidth={2} aria-hidden="true" />
          </div>
          <div>
            <div className="text-text-dim text-xs font-semibold uppercase tracking-wide mb-1">Email</div>
            <div className="text-white text-sm">
              <a href={`mailto:${contactInfo.email}`} className="text-white hover:text-amber transition-colors no-underline">{contactInfo.email}</a>
            </div>
          </div>
        </li>
        <li className="flex items-start gap-4">
          <div className="why-us-check">
            <Clock size={16} strokeWidth={2} aria-hidden="true" />
          </div>
          <div>
            <div className="text-text-dim text-xs font-semibold uppercase tracking-wide mb-1">Service Locations</div>
            <div className="text-white text-sm">Ludhiana &middot; Amritsar &middot; Delhi &middot; Mumbai &middot; Mundra</div>
          </div>
        </li>
        <li className="flex items-start gap-4">
          <div className="why-us-check">
            <Calendar size={16} strokeWidth={2} aria-hidden="true" />
          </div>
          <div>
            <div className="text-text-dim text-xs font-semibold uppercase tracking-wide mb-1">Business Hours</div>
            <div className="text-white text-sm">{contactInfo.hours}</div>
          </div>
        </li>
      </ul>
    </div>
  );
}
