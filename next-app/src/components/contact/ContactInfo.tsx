import { contactInfo } from "@/lib/data";
import { MapPin, Phone, Mail, Clock, Calendar } from "lucide-react";
import { Icon } from "@/components/ui/Icon";

export function ContactInfo() {
  return (
    <div>
      <h2 className="mono-label text-[11px] text-orange mb-6">Contact Information</h2>
      <ul className="list-none m-0 p-0 space-y-4">
        <li className="waybill rounded-xl bg-white p-4 flex items-start gap-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-teal-tint">
            <Icon icon={MapPin} size={15} className="text-teal" aria-hidden={true} />
          </div>
          <div>
            <div className="mono-label text-[9px] text-ink-dim mb-1">Office Address</div>
            <div className="text-ink text-sm leading-relaxed">{contactInfo.address}</div>
          </div>
        </li>
        <li className="waybill rounded-xl bg-white p-4 flex items-start gap-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-teal-tint">
            <Icon icon={Phone} size={15} className="text-teal" aria-hidden={true} />
          </div>
          <div>
            <div className="mono-label text-[9px] text-ink-dim mb-1">Phone</div>
            <div className="text-ink text-sm leading-relaxed">
              {contactInfo.phones.map((p, i) => (
                <span key={p}>
                  {i > 0 && " / "}
                  <a href={`tel:${p.replace(/\s/g, "")}`} className="text-ink hover:text-teal transition-colors no-underline">{p}</a>
                </span>
              ))}
            </div>
          </div>
        </li>
        <li className="waybill rounded-xl bg-white p-4 flex items-start gap-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-teal-tint">
            <Icon icon={Mail} size={15} className="text-teal" aria-hidden={true} />
          </div>
          <div>
            <div className="mono-label text-[9px] text-ink-dim mb-1">Email</div>
            <div className="text-ink text-sm">
              <a href={`mailto:${contactInfo.email}`} className="text-ink hover:text-teal transition-colors no-underline">{contactInfo.email}</a>
            </div>
          </div>
        </li>
        <li className="waybill rounded-xl bg-white p-4 flex items-start gap-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-teal-tint">
            <Icon icon={Clock} size={15} className="text-teal" aria-hidden={true} />
          </div>
          <div>
            <div className="mono-label text-[9px] text-ink-dim mb-1">Service Locations</div>
            <div className="text-ink text-sm">Ludhiana &middot; Amritsar &middot; Delhi &middot; Mumbai &middot; Mundra</div>
          </div>
        </li>
        <li className="waybill rounded-xl bg-white p-4 flex items-start gap-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-teal-tint">
            <Icon icon={Calendar} size={15} className="text-teal" aria-hidden={true} />
          </div>
          <div>
            <div className="mono-label text-[9px] text-ink-dim mb-1">Business Hours</div>
            <div className="text-ink text-sm">{contactInfo.hours}</div>
          </div>
        </li>
      </ul>
    </div>
  );
}
