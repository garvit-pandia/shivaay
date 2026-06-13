"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Tooltip,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { cities, routes } from "@/lib/data";

const INDIA_CENTER: [number, number] = [27.0, 77.0];

const RouteLines = () => {
  return (
    <>
      {routes.map((r, i) => {
        const from = cities[r.from];
        const to = cities[r.to];
        return (
          <Polyline
            key={i}
            positions={[
              [from.lat, from.lng],
              [to.lat, to.lng],
            ]}
            pathOptions={{
              color: "#0F766E",
              weight: 2.5,
              opacity: 0.6,
              dashArray: "10 8",
            }}
          />
        );
      })}
    </>
  );
};

type Dot = {
  marker: L.CircleMarker;
  from: (typeof cities)[string];
  to: (typeof cities)[string];
  progress: number;
  direction: number;
  pause: number;
};

const FreightDots = () => {
  const map = useMap();
  const animRef = useRef<number>(0);
  const lastTime = useRef(0);
  const dotsRef = useRef<Dot[]>([]);

  const animateFn = useRef((timestamp: number) => {
    if (!lastTime.current) lastTime.current = timestamp;
    const delta = Math.min((timestamp - lastTime.current) / 1000, 0.05);
    lastTime.current = timestamp;

    const speed = 0.0003;

    dotsRef.current.forEach((d) => {
      if (d.pause > 0) {
        d.pause -= delta;
        return;
      }
      d.progress += speed * delta * d.direction * 60;

      if (d.progress >= 1) {
        d.progress = 1;
        d.direction = -1;
        d.pause = 0.5 + Math.random() * 1.0;
      } else if (d.progress <= 0) {
        d.progress = 0;
        d.direction = 1;
        d.pause = 0.5 + Math.random() * 1.0;
      }

      const lat = d.from.lat + (d.to.lat - d.from.lat) * d.progress;
      const lng = d.from.lng + (d.to.lng - d.from.lng) * d.progress;
      d.marker.setLatLng([lat, lng]);
    });

    animRef.current = requestAnimationFrame(animateFn.current);
  });

  useEffect(() => {
    routes.forEach((r) => {
      const from = cities[r.from];
      const to = cities[r.to];
      const marker = L.circleMarker([from.lat, from.lng], {
        radius: 4,
        fillColor: "#0F766E",
        color: "#0F766E",
        weight: 1.5,
        opacity: 0.9,
        fillOpacity: 0.9,
      }).addTo(map);

      dotsRef.current.push({
        marker,
        from,
        to,
        progress: Math.random(),
        direction: 1,
        pause: 0,
      });
    });

    animRef.current = requestAnimationFrame(animateFn.current);

    return () => {
      cancelAnimationFrame(animRef.current);
      dotsRef.current.forEach((d) => map.removeLayer(d.marker));
      dotsRef.current = [];
    };
  }, [map]);

  return null;
};

const Legend = () => (
  <div className="absolute bottom-4 left-4 z-[1000] map-legend">
    <div className="map-legend-item">
      <span className="map-legend-dot map-legend-hub" /> Service Hub
    </div>
    <div className="map-legend-item">
      <span className="map-legend-dot map-legend-city" /> Service City
    </div>
    <div className="map-legend-item">
      <span className="map-legend-line" /> Freight Route
    </div>
  </div>
);

const CityMarkers = () => {
  const icons = useMemo(() => {
    const map: Record<string, L.DivIcon> = {};
    Object.entries(cities).forEach(([name, c]) => {
      const size = c.isHub ? 24 : 18;
      const cls = c.isHub ? "map-marker-hub" : "";
      map[name] = L.divIcon({
        className: `map-marker-icon ${cls}`,
        html: '<div class="map-marker-inner"></div>',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
    });
    return map;
  }, []);

  return (
    <>
      {Object.entries(cities).map(([name, c]) => (
        <Marker key={name} position={[c.lat, c.lng]} icon={icons[name]}>
          <Tooltip direction="top" offset={[0, -8]} className="map-tooltip">
            <strong>{c.label}</strong>
            <br />
            <span className="map-tooltip-tag">{c.tag}</span>
          </Tooltip>
          <Popup className="map-popup-wrapper" closeButton offset={[0, -12]}>
            <div className="map-popup">
              <h4>{c.label}</h4>
              <span className="map-popup-tag">{c.tag}</span>
              <ul className="map-popup-services">
                {c.services.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

const FitBounds = () => {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds(
      Object.values(cities).map((c) => [c.lat, c.lng] as [number, number])
    );
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map]);
  return null;
};

export function NetworkMap() {
  return (
    <MapContainer
      center={INDIA_CENTER}
      zoom={5.5}
      className="w-full h-full rounded-xl"
      zoomControl={false}
      attributionControl={false}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        maxZoom={19}
        minZoom={3}
      />
      <FitBounds />
      <RouteLines />
      <CityMarkers />
      <FreightDots />
      <Legend />
    </MapContainer>
  );
}
