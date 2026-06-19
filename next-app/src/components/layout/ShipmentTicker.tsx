import { tickerItems } from "@/lib/data";

export function ShipmentTicker() {
  const items = [...tickerItems, ...tickerItems];
  return (
    <div className="ticker-bar" role="marquee" aria-label="Recent shipment activity">
      <span className="ticker-label">Recent activity</span>
      <div className="ticker-track">
        {items.map((item, i) => (
          <span className="ticker-item" key={i}>
            <span className="ticker-dot" aria-hidden="true" />
            <span>
              {item.event} · {item.ref} · {item.route} · {item.time}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
