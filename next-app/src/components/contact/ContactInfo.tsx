import { contactInfo } from "@/lib/data";
import { MapPin, Phone, Mail, Clock, Calendar } from "lucide-react";

export function ContactInfo() {
  return (
    <div>
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0B0F19] mb-3">Contact Information</h2>
      <p className="text-[#4B5468] mb-8">Reach out to us for any logistics requirements</p>
      <ul className="list-none m-0 p-0 space-y-5">
        <li className="flex items-start gap-4">
          <div className="why-us-check">
            <MapPin size={16} strokeWidth={2} aria-hidden="true" />
          </div>
          <div>
            <div className="text-[#4B5468] text-xs font-semibold uppercase tracking-wide mb-1">Office Address</div>
            <div className="text-[#0B0F19] text-sm leading-relaxed">{contactInfo.address}</div>
          </div>
        </li>
        <li className="flex items-start gap-4">
          <div className="why-us-check">
            <Phone size={16} strokeWidth={2} aria-hidden="true" />
          </div>
          <div>
            <div className="text-[#4B5468] text-xs font-semibold uppercase tracking-wide mb-1">Phone</div>
            <div className="text-[#0B0F19] text-sm leading-relaxed">
              {contactInfo.phones.map((p, i) => (
                <span key={p}>
                  {i > 0 && " / "}
                  <a href={`tel:${p.replace(/\s/g, "")}`} className="text-[#0B0F19] hover:text-[#1E3A8A] transition-colors no-underline">{p}</a>
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
            <div className="text-[#4B5468] text-xs font-semibold uppercase tracking-wide mb-1">Email</div>
            <div className="text-[#0B0F19] text-sm">
              <a href={`mailto:${contactInfo.email}`} className="text-[#0B0F19] hover:text-[#1E3A8A] transition-colors no-underline">{contactInfo.email}</a>
            </div>
          </div>
        </li>
        <li className="flex items-start gap-4">
          <div className="why-us-check">
            <Clock size={16} strokeWidth={2} aria-hidden="true" />
          </div>
          <div>
            <div className="text-[#4B5468] text-xs font-semibold uppercase tracking-wide mb-1">Service Locations</div>
            <div className="text-[#0B0F19] text-sm">Ludhiana &middot; Amritsar &middot; Delhi &middot; Mumbai &middot; Mundra</div>
          </div>
        </li>
        <li className="flex items-start gap-4">
          <div className="why-us-check">
            <Calendar size={16} strokeWidth={2} aria-hidden="true" />
          </div>
          <div>
            <div className="text-[#4B5468] text-xs font-semibold uppercase tracking-wide mb-1">Business Hours</div>
            <div className="text-[#0B0F19] text-sm">{contactInfo.hours}</div>
          </div>
        </li>
      </ul>
    </div>
  );
}
