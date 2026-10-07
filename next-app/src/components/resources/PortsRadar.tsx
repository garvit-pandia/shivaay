"use client";

import { cities } from "@/lib/data";
import { portFacilities } from "@/lib/resources";
import { bearingDeg, distanceKm, niceRange, parseEmbedCoords, polarToXY } from "@/lib/radar";

const SWEEP_S = 6;
const RADIUS = 100;
const HQ = { lat: cities.Ludhiana.lat, lng: cities.Ludhiana.lng };

export const radarBlips = portFacilities.flatMap((f) => {
  const c = parseEmbedCoords(f.maps);
  if (!c) return [];
  return [{ id: f.id, name: f.name, km: distanceKm(HQ, c), bearing: bearingDeg(HQ, c) }];
});
const { max: MAX_KM, step: STEP_KM } = niceRange(Math.max(...radarBlips.map((b) => b.km)));
const RINGS = Array.from({ length: MAX_KM / STEP_KM }, (_, i) => (i + 1) * STEP_KM);
/** Beam: leading edge at north, a fading tail of 10° slices behind it. */
const TAIL = Array.from({ length: 7 }, (_, i) => {
  const pt = (deg: number) => {
    const r = (deg * Math.PI) / 180;
    return `${(RADIUS * Math.sin(r)).toFixed(2)} ${(-RADIUS * Math.cos(r)).toFixed(2)}`;
  };
  return {
    d: `M0 0 L${pt(-(i + 1) * 10)} A${RADIUS} ${RADIUS} 0 0 1 ${pt(-i * 10)} Z`,
    opacity: 0.32 * (1 - i / 7),
  };
});
/** Stack labels of blips sitting within ~10 svg units of an earlier one. */
const LABEL_SLOTS = (() => {
  const pts = radarBlips.map((b) => polarToXY(b.km, b.bearing, MAX_KM, RADIUS));
  return pts.map((p, i) => pts.slice(0, i).filter((q) => Math.hypot(p.x - q.x, p.y - q.y) < 10).length);
})();

/**
 * Customs radar: every ICD/CFS with a known position, plotted by true range
 * and bearing from Ludhiana (coordinates come from each facility's Maps
 * embed). The sweep is a rotating conic gradient; each blip's ping is
 * delayed by bearing/360 of the period, so it lights as the beam passes.
 */
export function PortsRadar({
  activeId,
  onPick,
}: {
  activeId: number | null;
  onPick: (id: number) => void;
}) {
  const active = radarBlips.find((b) => b.id === activeId) ?? null;
  const activeXY = active ? polarToXY(active.km, active.bearing, MAX_KM, RADIUS) : null;

  return (
    <figure className="radar m-0">
      <div className="radar-scope">
        <svg
          viewBox="-120 -120 240 240"
          className="radar-svg"
          role="img"
          aria-label={`Radar of ${radarBlips.length} clearance facilities around Ludhiana, up to ${MAX_KM} km`}
        >
          {RINGS.map((km) => {
            const r = (km / MAX_KM) * RADIUS;
            return (
              <g key={km} className="radar-ring">
                <circle r={r} />
                <text x={3} y={-r + 7}>{km} km</text>
              </g>
            );
          })}
          <g className="radar-cross">
            <line x1={-RADIUS} x2={RADIUS} y1={0} y2={0} />
            <line y1={-RADIUS} y2={RADIUS} x1={0} x2={0} />
            <text x={0} y={-RADIUS - 6} textAnchor="middle">N</text>
            <text x={RADIUS + 7} y={3} textAnchor="middle">E</text>
            <text x={0} y={RADIUS + 12} textAnchor="middle">S</text>
            <text x={-RADIUS - 7} y={3} textAnchor="middle">W</text>
          </g>

          <g className="radar-beam" style={{ animationDuration: `${SWEEP_S}s` }} aria-hidden="true">
            {TAIL.map((t, i) => (
              <path key={i} d={t.d} opacity={t.opacity} />
            ))}
            <line x1={0} y1={0} x2={0} y2={-RADIUS} />
          </g>

          {activeXY && (
            <line className="radar-range" x1={0} y1={0} x2={activeXY.x} y2={activeXY.y} />
          )}

          <g className="radar-hq">
            <circle r={3.2} />
            <text y={-7} textAnchor="middle">LDH</text>
          </g>

          {radarBlips.map((b, i) => {
            const { x, y } = polarToXY(b.km, b.bearing, MAX_KM, RADIUS);
            return (
              <g
                key={b.id}
                className={`radar-blip${b.id === activeId ? " is-active" : ""}`}
                transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}
                style={{ "--delay": `${((b.bearing / 360) * SWEEP_S).toFixed(2)}s`, "--period": `${SWEEP_S}s` } as React.CSSProperties}
                onClick={() => onPick(b.id)}
              >
                <circle className="radar-ping" r={4} />
                <circle className="radar-dot" r={3} />
                <text x={6} y={-4 + LABEL_SLOTS[i] * 8}>{String(b.id).padStart(2, "0")}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="radar-caption">
        {active ? (
          <>
            <span className="text-[#5EEAD4]">№ {String(active.id).padStart(2, "0")}</span>
            <span className="truncate">{active.name}</span>
            <span className="tabular-nums">
              {active.km.toFixed(1)} km · {Math.round(active.bearing)}°
            </span>
          </>
        ) : (
          <>
            <span className="text-[#5EEAD4]">● Live</span>
            <span>
              {radarBlips.length} of {portFacilities.length} facilities plotted from Ludhiana
            </span>
            <span>Hover a facility</span>
          </>
        )}
      </figcaption>
    </figure>
  );
}
