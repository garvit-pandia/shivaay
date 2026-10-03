/**
 * Stats marquee band — infinite ticker of proof points between the hero
 * and services. Pure CSS motion, duplicated content for the loop seam.
 */
const items = [
  "15+ years",
  "800+ happy clients",
  "5 major ports",
  "Zero detention, most of the time",
  "Quote in 24 hours",
  "Pan-India coverage",
];

export function StatsMarquee() {
  const row = (hidden: boolean) => (
    <div className="flex items-center shrink-0" aria-hidden={hidden || undefined}>
      {items.map((t) => (
        <span key={t} className="flex items-center shrink-0">
          <span className="font-grotesk font-semibold text-sm text-cream px-6">
            {t}
          </span>
          <span className="text-orange text-xs" aria-hidden="true">
            ●
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      className="py-3.5 overflow-hidden"
      style={{ backgroundColor: "#134E4A" }}
      role="region"
      aria-label="Shivaay Logistics at a glance"
    >
      <div className="marquee-strip">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
