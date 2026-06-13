import { cities } from "@/lib/data";

export function NetworkMapSection() {
  return (
    <section
      className="relative bg-white border-t border-[#ECEDF0] overflow-hidden divider-down"
      aria-labelledby="network-heading"
    >
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <div className="text-center mb-10">
          <h2
            id="network-heading"
            className="font-display text-3xl sm:text-4xl font-bold text-[#0B0F19]"
          >
            Our Coverage Network
          </h2>
          <p className="text-[#4B5468] mt-3 text-lg max-w-xl mx-auto">
            Pan-India logistics network — hub-and-spoke from Ludhiana to key ports and cities
          </p>
        </div>

        <div className="w-full aspect-[16/10] max-h-[700px] relative rounded-xl overflow-hidden border border-[#E8E4DB] bg-[#FAF8F4]">
          <iframe
            src="https://www.openstreetmap.org/export/embed.html?bbox=68.1,6.5,97.4,37.1&layer=mapnik"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Shivaay Logistics service network across India"
          />
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3" aria-label="Service cities">
          {Object.entries(cities).map(([name, city]) => (
            <span
              key={name}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${
                city.isHub
                  ? "bg-[rgba(15,118,110,0.1)] border border-[#0F766E] text-[#0F766E] font-semibold"
                  : "bg-white border border-[#E8E4DB] text-[#1E1B18]"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  city.isHub ? "bg-[#0F766E]" : "bg-[#6B5E4A]"
                }`}
                aria-hidden="true"
              />
              {city.label}
              {city.tag && (
                <span className="text-xs text-[#6B5E4A] font-normal">— {city.tag}</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
