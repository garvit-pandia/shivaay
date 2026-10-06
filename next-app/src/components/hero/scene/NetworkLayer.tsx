"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { cities, routes } from "@/lib/data";
import { smoothstep } from "@/lib/hero-ease";

/** Scene units per degree — diagrammatic, not geographically to scale. */
const SCALE = 7;
const TEAL = 0x0f766e;
const ORANGE = 0xea580c;
const MAP_SIZE = 2400;
/** Grid cell size in scene units (canvas texture repeats every cell). */
const GRID_CELL = 40;

interface Packet {
  mesh: THREE.Mesh;
  curve: THREE.QuadraticBezierCurve3;
  speed: number;
  offset: number;
}

interface PulseRing {
  mesh: THREE.Mesh;
  phase: number;
}

interface Network {
  map: THREE.Group;
  clouds: THREE.Group;
  mapMats: THREE.Material[];
  cloudMats: THREE.Material[];
  packets: Packet[];
  rings: PulseRing[];
}

/** City → yard-plane coordinates, origin at Ludhiana. */
function project(city: { lat: number; lng: number }): [number, number] {
  const hub = cities.Ludhiana;
  return [(city.lng - hub.lng) * SCALE, -(city.lat - hub.lat) * SCALE];
}

/**
 * Fanned label anchors, on top of the "~8 above the beacon" base height.
 * Amritsar lands ~8.6 units from the hub at this scale, so its label would
 * collide with Ludhiana's; the others fan outward from the cluster, and all
 * sit above the 10-unit container stacks the labels fly over.
 */
const LABEL_OFFSET: Record<string, [number, number, number]> = {
  Ludhiana: [0, 15, 0],
  Amritsar: [-16, 19, -5],
  Delhi: [16, 15, 0],
  Mumbai: [-14, 13, 6],
  Mundra: [-17, 13, 6],
};

/** Register a material for the per-frame opacity fade. */
function fade<T extends THREE.Material>(mat: T, base: number, bucket: THREE.Material[]): T {
  mat.opacity = base;
  mat.userData.baseOpacity = base;
  bucket.push(mat);
  return mat;
}

function makeGridTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#0F766E";
    ctx.fillRect(0, 0, 256, 4);
    ctx.fillRect(0, 0, 4, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(MAP_SIZE / GRID_CELL, MAP_SIZE / GRID_CELL);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function makeLabelTexture(text: string, color: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 96;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.font = "700 72px 'JetBrains Mono', ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const label = text.toUpperCase();
    const textWidth = ctx.measureText(label).width;
    // Paper-chip backing so the mono text stays legible over container stacks.
    const padX = 24;
    const x0 = 256 - textWidth / 2 - padX;
    const w = textWidth + padX * 2;
    const y0 = 12;
    const h = 72;
    const r = 12;
    ctx.beginPath();
    ctx.moveTo(x0 + r, y0);
    ctx.lineTo(x0 + w - r, y0);
    ctx.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r);
    ctx.lineTo(x0 + w, y0 + h - r);
    ctx.quadraticCurveTo(x0 + w, y0 + h, x0 + w - r, y0 + h);
    ctx.lineTo(x0 + r, y0 + h);
    ctx.quadraticCurveTo(x0, y0 + h, x0, y0 + h - r);
    ctx.lineTo(x0, y0 + r);
    ctx.quadraticCurveTo(x0, y0, x0 + r, y0);
    ctx.closePath();
    ctx.fillStyle = "rgba(250,248,244,0.78)";
    ctx.fill();
    ctx.strokeStyle = "rgba(30,27,24,0.1)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.fillText(label, 256, 50);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Soft warm-grey puffs — pure white would vanish against the cream sky. */
function makeCloudTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const puffs: [number, number, number][] = [
      [128, 138, 52],
      [176, 122, 40],
      [88, 126, 44],
      [144, 176, 38],
      [196, 162, 30],
      [74, 168, 32],
      [130, 96, 34],
    ];
    for (const [x, y, r] of puffs) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(188,182,169,0.9)");
      g.addColorStop(0.5, "rgba(188,182,169,0.55)");
      g.addColorStop(1, "rgba(188,182,169,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 256, 256);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Cloud deck the descent passes through. Curve math (camera y=166 at p=0.5,
 * pitch −48°, fov 38°) shows a band at y≥150 can only ever hit the very top
 * of the frame mid-descent — the camera is already inside/under it — so the
 * deck rides at 105–130 where it reads as distinct puffs seen from above,
 * and the fade envelope (gone by p=0.78, settled camera at y≤142) still
 * guarantees zero cloud residue before settle.
 */
const CLOUDS: { x: number; y: number; z: number; w: number; opacity: number }[] = [
  { x: 25, y: 125, z: 105, w: 34, opacity: 0.72 },
  { x: -5, y: 112, z: 95, w: 30, opacity: 0.68 },
  { x: 40, y: 108, z: 65, w: 28, opacity: 0.7 },
  { x: 10, y: 120, z: 130, w: 30, opacity: 0.7 },
  { x: -15, y: 115, z: 55, w: 30, opacity: 0.65 },
  { x: 50, y: 118, z: 80, w: 32, opacity: 0.7 },
];

function buildNetwork(): Network {
  const map = new THREE.Group();
  const clouds = new THREE.Group();
  const mapMats: THREE.Material[] = [];
  const cloudMats: THREE.Material[] = [];
  const packets: Packet[] = [];
  const rings: PulseRing[] = [];

  // --- map paper grid, 40-unit cells at 7% teal ---
  const gridMat = fade(
    new THREE.MeshBasicMaterial({
      map: makeGridTexture(),
      transparent: true,
      depthWrite: false,
    }),
    0.07,
    mapMats
  );
  const grid = new THREE.Mesh(new THREE.PlaneGeometry(MAP_SIZE, MAP_SIZE), gridMat);
  grid.rotation.x = -Math.PI / 2;
  grid.position.y = -0.25;
  map.add(grid);

  // --- city beacons: flat pulse ring + vertical beam + mono label ---
  Object.values(cities).forEach((city, i) => {
    const [x, z] = project(city);
    const color = city.isHub ? ORANGE : TEAL;
    const beacon = new THREE.Group();
    beacon.position.set(x, 0, z);

    const ringMat = fade(
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
      city.isHub ? 0.95 : 0.85,
      mapMats
    );
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(city.isHub ? 3.2 : 2.5, city.isHub ? 4.5 : 3.6, 40),
      ringMat
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.12;
    beacon.add(ring);
    rings.push({ mesh: ring, phase: i * 1.37 });

    const beamMat = fade(
      new THREE.MeshBasicMaterial({ color, transparent: true, depthWrite: false }),
      city.isHub ? 0.42 : 0.3,
      mapMats
    );
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 1.0, 10, 12, 1, true),
      beamMat
    );
    beam.position.y = 5;
    beacon.add(beam);

    const labelMat = fade(
      new THREE.SpriteMaterial({
        map: makeLabelTexture(city.label, city.isHub ? "#EA580C" : "#0F766E"),
        transparent: true,
        depthWrite: false,
      }),
      0.95,
      mapMats
    );
    const label = new THREE.Sprite(labelMat);
    label.scale.set(6 + 4.2 * city.label.length, 8.5, 1);
    label.position.set(...(LABEL_OFFSET[city.name] ?? [0, 9, 0]));
    beacon.add(label);

    map.add(beacon);
  });

  // --- dashed routes + one slow packet per route ---
  routes.forEach((route, i) => {
    const from = cities[route.from];
    const to = cities[route.to];
    if (!from || !to) return;
    const [fx, fz] = project(from);
    const [tx, tz] = project(to);
    const a = new THREE.Vector3(fx, 0, fz);
    const b = new THREE.Vector3(tx, 0, tz);
    const dist = a.distanceTo(b);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    mid.y = dist * 0.18;
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);

    const dash = Math.max(1.6, dist * 0.045);
    const lineMat = fade(
      new THREE.LineDashedMaterial({
        color: TEAL,
        transparent: true,
        dashSize: dash,
        gapSize: dash * 0.8,
        depthWrite: false,
      }),
      0.55,
      mapMats
    );
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(curve.getPoints(64)),
      lineMat
    );
    line.computeLineDistances();
    map.add(line);

    const packetMat = fade(
      new THREE.MeshBasicMaterial({
        color: ORANGE,
        transparent: true,
        depthWrite: false,
      }),
      0.95,
      mapMats
    );
    const packet = new THREE.Mesh(new THREE.SphereGeometry(1.9, 12, 12), packetMat);
    curve.getPoint(0.5, packet.position);
    map.add(packet);
    packets.push({ mesh: packet, curve, speed: 0.05 + (i % 3) * 0.02, offset: i * 0.17 });
  });

  // --- cloud deck (positions explained above CLOUDS) ---
  const cloudTex = makeCloudTexture();
  for (const spec of CLOUDS) {
    const cloudMat = fade(
      new THREE.SpriteMaterial({
        map: cloudTex,
        transparent: true,
        depthWrite: false,
      }),
      spec.opacity,
      cloudMats
    );
    const sprite = new THREE.Sprite(cloudMat);
    sprite.position.set(spec.x, spec.y, spec.z);
    sprite.scale.set(spec.w, spec.w * 0.55, 1);
    clouds.add(sprite);
  }

  return { map, clouds, mapMats, cloudMats, packets, rings };
}

function disposeNetwork(net: Network) {
  for (const root of [net.map, net.clouds]) {
    root.traverse((obj) => {
      const mesh = obj as Partial<THREE.Mesh>;
      mesh.geometry?.dispose();
      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : mesh.material
          ? [mesh.material]
          : [];
      for (const material of materials) {
        (material as THREE.MeshBasicMaterial).map?.dispose();
        material.dispose();
      }
    });
  }
}

// --- imperative three.js updates, kept out of the component so the React
// compiler's immutability rules don't flag scene-graph mutation per frame ---

function applyFade(mats: readonly THREE.Material[], opacity: number) {
  for (const m of mats) {
    m.opacity = ((m.userData.baseOpacity as number | undefined) ?? 1) * opacity;
  }
}

function setVisible(obj: THREE.Object3D, visible: boolean) {
  obj.visible = visible;
}

function placePacket(packet: Packet, t: number) {
  const u = (packet.offset + t * packet.speed) % 1;
  packet.curve.getPoint(u, packet.mesh.position);
}

function pulseRing(ring: PulseRing, t: number) {
  ring.mesh.scale.setScalar(1 + 0.32 * (0.5 + 0.5 * Math.sin(t * 1.7 + ring.phase)));
}

export interface NetworkLayerProps {
  progress: React.RefObject<number>;
  reduced: boolean;
}

/**
 * The network map the hero dives in from: paper grid, city beacons, dashed
 * routes with moving packets, and a cloud band the descent passes through.
 * Everything fades by progress so the settled yard is untouched.
 */
export function NetworkLayer({ progress, reduced }: NetworkLayerProps) {
  const net = useMemo(() => buildNetwork(), []);
  const { map, clouds, mapMats, cloudMats, packets, rings } = net;

  useEffect(() => () => disposeNetwork(net), [net]);

  useFrame(({ clock }) => {
    const p = progress.current ?? 1;
    const mapOpacity = 1 - smoothstep(0.35, 0.62, p);
    const cloudOpacity =
      smoothstep(0.3, 0.45, p) * (1 - smoothstep(0.6, 0.78, p));

    applyFade(mapMats, mapOpacity);
    applyFade(cloudMats, cloudOpacity);
    setVisible(map, mapOpacity > 0.002);
    setVisible(clouds, cloudOpacity > 0.002);

    if (reduced) return;
    const t = clock.elapsedTime;
    for (const packet of packets) placePacket(packet, t);
    for (const ring of rings) pulseRing(ring, t);
  });

  return (
    <>
      <primitive object={net.map} />
      <primitive object={net.clouds} />
    </>
  );
}
