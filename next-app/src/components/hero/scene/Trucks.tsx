"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { Suspense, useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ACCENT_ORANGE } from "@/lib/palette";
import { GATE, TRUCK_PATHS, gateRaiseAmount } from "@/lib/yard";

/** Flat brand tints for the tinted-by-traverse Kenney models. */
const INK = "#1E1B18";
const CREAM = "#FAF8F4";
const BODY_A = "#0F766E";
const BODY_B = "#134E4A";

/** Fitted truck length in scene units (the yard scale is ≈ metres). */
const TRUCK_LENGTH = 7;

/**
 * Kenney's `truck.glb` faces +Z: the cab and sloped hood sit at positive Z
 * (checked against the raw glTF accessors, then confirmed in the settled
 * screenshot). three's `Object3D.lookAt` aims a group's +Z along the target
 * direction, so the model needs no yaw correction. Wheels spin about their
 * local X axle — positive rotation rolls the truck forward.
 */
const MODEL_YAW = 0;
/** Spin sign that rolls the wheels forward for the chosen MODEL_YAW. */
const WHEEL_SPIN = MODEL_YAW === 0 ? 1 : -1;

/** Trucks + gate only animate once the dive has settled, like the crane. */
const SETTLE_P = 0.55;

/** Scratch objects so the per-frame path math never allocates. */
const _box = new THREE.Box3();
const _size = new THREE.Vector3();
const _center = new THREE.Vector3();
const _pos = new THREE.Vector3();
const _tan = new THREE.Vector3();
const _look = new THREE.Vector3();

/** Scale/ground fit: longest horizontal axis → `length`, pivot at ground centre. */
function fitToGround(obj: THREE.Object3D, length: number) {
  _box.setFromObject(obj);
  _box.getSize(_size);
  const scale = length / Math.max(_size.x, _size.z, 0.0001);
  _box.getCenter(_center);
  obj.scale.setScalar(scale);
  obj.position.set(-_center.x * scale, -_box.min.y * scale, -_center.z * scale);
}

/** Flat brand tint: wheels/glass ink, crates/trailers cream, body per model. */
function tintObject(obj: THREE.Object3D, body: string) {
  obj.traverse((o) => {
    if (!(o as THREE.Mesh).isMesh) return;
    const n = o.name.toLowerCase();
    const dark = /wheel|tire|window|glass/.test(n);
    const crate = /box|trailer|container/.test(n);
    (o as THREE.Mesh).material = new THREE.MeshStandardMaterial({
      color: dark ? INK : crate ? CREAM : body,
      roughness: 0.8,
      metalness: 0.05,
    });
  });
}

interface FittedModel {
  object: THREE.Group;
  /** Wheel nodes, if the GLB exposes them as separate meshes (spin cosmetic). */
  wheels: THREE.Object3D[];
  /** World-space wheel radius after fitting — drives the spin rate. */
  wheelRadius: number;
}

function buildFitted(source: THREE.Object3D, body: string, length: number): FittedModel {
  const object = source.clone(true) as THREE.Group;
  tintObject(object, body);
  fitToGround(object, length);
  object.updateMatrixWorld(true);

  const wheels: THREE.Object3D[] = [];
  object.traverse((o) => {
    if (/wheel|tire/.test(o.name.toLowerCase())) wheels.push(o);
  });
  let wheelRadius = 0;
  if (wheels.length > 0) {
    _box.setFromObject(wheels[0]);
    _box.getSize(_size);
    wheelRadius = Math.max(_size.y, _size.z) / 2;
  }
  return { object, wheels, wheelRadius };
}

interface TruckRoute {
  curve: THREE.CatmullRomCurve3;
  speed: number;
  offset: number;
  length: number;
}

// --- imperative scene-graph updates, kept out of the component so the React
// compiler's immutability rules don't flag per-frame mutation (same pattern as
// NetworkLayer) ---

function placeTruck(group: THREE.Group, route: TruckRoute, u: number) {
  route.curve.getPointAt(u, _pos);
  route.curve.getTangentAt(u, _tan);
  group.position.copy(_pos);
  group.lookAt(_look.copy(_pos).add(_tan));
}

function spinWheels(model: FittedModel, omega: number, step: number) {
  for (const wheel of model.wheels) wheel.rotation.x += omega * step;
}

function buildRoutes(): TruckRoute[] {
  return TRUCK_PATHS.map((p) => {
    const curve = new THREE.CatmullRomCurve3(
      p.points.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
      p.closed
    );
    curve.arcLengthDivisions = 200;
    return { curve, speed: p.speed, offset: p.offset, length: curve.getLength() };
  });
}

/** GLB-file errors (offline, 404, aborted request) fall back to procedural props. */
class ModelBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("[hero] GLB unavailable — using procedural fallback", error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** Procedural box-truck stand-in: cab + cargo box + four cylinder wheels. */
function ProceduralTruck({ body }: { body: string }) {
  const wheelR = 0.75;
  return (
    <group>
      <mesh position={[0, 1.5, 1.9]}>
        <boxGeometry args={[2.4, 2.6, 2.6]} />
        <meshStandardMaterial color={body} roughness={0.8} metalness={0.05} />
      </mesh>
      <mesh position={[0, 1.7, -1.3]}>
        <boxGeometry args={[2.6, 3.4, 4.4]} />
        <meshStandardMaterial color={CREAM} roughness={0.8} metalness={0.05} />
      </mesh>
      {([
        [-1.15, 2.3],
        [1.15, 2.3],
        [-1.15, -1.7],
        [1.15, -1.7],
      ] as const).map(([x, z]) => (
        <mesh key={`${x}:${z}`} position={[x, wheelR, z]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[wheelR, wheelR, 0.6, 14]} />
          <meshStandardMaterial color={INK} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

/** Soft blob shadow: 12×8 plane, radial gradient ink 18% → transparent. */
function BlobShadow() {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext("2d");
    if (ctx) {
      const g = ctx.createRadialGradient(64, 64, 8, 64, 64, 64);
      g.addColorStop(0, "rgba(30,27,24,0.18)");
      g.addColorStop(1, "rgba(30,27,24,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.05, 0]} renderOrder={1}>
      <planeGeometry args={[12, 8]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

interface TruckGLBProps {
  body: string;
  onModel: (model: FittedModel | null) => void;
}

function TruckGLB({ body, onModel }: TruckGLBProps) {
  const { scene } = useGLTF("/models/truck.glb");
  const model = useMemo(() => buildFitted(scene, body, TRUCK_LENGTH), [scene, body]);

  useEffect(() => {
    onModel(model);
    return () => onModel(null);
  }, [model, onModel]);

  return <primitive object={model.object} />;
}

interface TruckProps {
  route: TruckRoute;
  body: string;
  reduced: boolean;
  progress: React.RefObject<number>;
  onProgress?: (u: number) => void;
}

/**
 * One truck on one route. u advances only once the dive has settled (and never
 * under reduced motion); the group is placed with `getPointAt` and yawed with
 * `lookAt(pos + tangent)`. Wheels spin proportionally to ground speed when the
 * GLB exposes them (Kenney's does — four separate wheel meshes).
 */
function Truck({ route, body, reduced, progress, onProgress }: TruckProps) {
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<FittedModel | null>(null);
  const tRef = useRef(0);

  const register = useCallback((model: FittedModel | null) => {
    modelRef.current = model;
  }, []);

  useFrame((_, delta) => {
    const p = progress.current ?? 1;
    const step = Math.min(delta, 0.05);
    if (!reduced && p >= SETTLE_P) tRef.current = (tRef.current + step) % 1e6;

    const u = (tRef.current * route.speed + route.offset) % 1;
    onProgress?.(u);

    const group = groupRef.current;
    if (!group) return;
    placeTruck(group, route, u);

    const model = modelRef.current;
    if (reduced || !model || model.wheels.length === 0 || model.wheelRadius <= 0) return;
    const omega = (route.length * route.speed * WHEEL_SPIN) / model.wheelRadius;
    spinWheels(model, omega, step);
  });

  return (
    <group ref={groupRef}>
      <BlobShadow />
      <ModelBoundary fallback={<ProceduralTruck body={body} />}>
        <Suspense fallback={null}>
          {/* Inner group carries the model-forward correction (see MODEL_YAW). */}
          <group rotation-y={MODEL_YAW}>
            <TruckGLB body={body} onModel={register} />
          </group>
        </Suspense>
      </ModelBoundary>
    </group>
  );
}

/** Procedural traffic cone for the GLB failure path. */
function ProceduralCone({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, 0.75, z]}>
      <coneGeometry args={[0.55, 1.5, 12]} />
      <meshStandardMaterial color={ACCENT_ORANGE} roughness={0.75} />
    </mesh>
  );
}

/** Two CC0 cones by the gate (full tier only). */
function GateCones() {
  const { scene } = useGLTF("/models/cone.glb");
  const cones = useMemo(
    () => [
      buildFitted(scene, ACCENT_ORANGE, 1.1),
      buildFitted(scene, ACCENT_ORANGE, 1.1),
    ],
    [scene]
  );
  return (
    <>
      <group position={[-15.5, 0, GATE.z + 4.5]} rotation-y={0.5}>
        <primitive object={cones[0].object} />
      </group>
      <group position={[16, 0, GATE.z + 5]} rotation-y={-0.7}>
        <primitive object={cones[1].object} />
      </group>
    </>
  );
}

/** Procedural crate for the GLB failure path (bottom at y). */
function ProceduralCrate({
  position,
  rotationY = 0,
}: {
  position: [number, number, number];
  rotationY?: number;
}) {
  return (
    <mesh position={[position[0], position[1] + 1, position[2]]} rotation-y={rotationY}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={CREAM} roughness={0.9} />
    </mesh>
  );
}

/** Crate prop spots by the gate: a two-high stack + a single box. */
const CRATES: { position: [number, number, number]; rotationY: number }[] = [
  { position: [-18, 0, -72.5], rotationY: 0.3 },
  { position: [-18.3, 2, -72.3], rotationY: -0.4 },
  { position: [18.5, 0, -71.5], rotationY: 0.9 },
];

/** Crate props by the gate (full tier only). */
function GateCrates() {
  const { scene } = useGLTF("/models/box.glb");
  const crates = useMemo(
    () => CRATES.map(() => buildFitted(scene, CREAM, 2)),
    [scene]
  );
  return (
    <>
      {CRATES.map((crate, i) => (
        <group key={i} position={crate.position} rotation-y={crate.rotationY}>
          <primitive object={crates[i].object} />
        </group>
      ))}
    </>
  );
}

interface GateProps {
  tier: "full" | "lite";
  u1: React.RefObject<number>;
}

/**
 * Yard gate at GATE: two booths, a barrier arm pivoted on the inner face of
 * the west booth. The 9-unit arm covers the west lane only (tip at x ≈ −2.5
 * closed) and raises while truck #1 is inside its gate window
 * (u ∈ [0.12, 0.26]); cones and crate props on full tier.
 */
function Gate({ tier, u1 }: GateProps) {
  const armRef = useRef<THREE.Group>(null);
  const armLength = 9;

  useFrame(() => {
    if (!armRef.current) return;
    armRef.current.rotation.z = gateRaiseAmount(u1.current ?? 0) * 1.25;
  });

  const pivotX = GATE.x - GATE.width / 2 + 1.5;

  return (
    <group>
      {[-1, 1].map((s) => (
        <group key={s} position={[GATE.x + s * (GATE.width / 2), 0, GATE.z]}>
          <mesh position={[0, 1.7, 0]}>
            <boxGeometry args={[3, 3.4, 3]} />
            <meshStandardMaterial color={CREAM} roughness={0.9} />
          </mesh>
          <mesh position={[0, 3.55, 0]}>
            <boxGeometry args={[3.5, 0.35, 3.5]} />
            <meshStandardMaterial color={INK} roughness={0.7} />
          </mesh>
          <mesh position={[s === -1 ? 1.51 : -1.51, 2.1, 0]}>
            <boxGeometry args={[0.06, 1.1, 1.4]} />
            <meshStandardMaterial color={INK} roughness={0.4} />
          </mesh>
        </group>
      ))}
      <group ref={armRef} position={[pivotX, 1.6, GATE.z]}>
        <mesh position={[armLength / 2, 0, 0]}>
          <boxGeometry args={[armLength, 0.3, 0.3]} />
          <meshStandardMaterial color={INK} roughness={0.6} />
        </mesh>
        <mesh position={[armLength - 1, 0, 0]}>
          <boxGeometry args={[2, 0.32, 0.32]} />
          <meshStandardMaterial color={ACCENT_ORANGE} roughness={0.6} />
        </mesh>
      </group>

      {tier === "full" && (
        <>
          <ModelBoundary
            fallback={
              <>
                <ProceduralCone x={-15.5} z={GATE.z + 4.5} />
                <ProceduralCone x={16} z={GATE.z + 5} />
              </>
            }
          >
            <Suspense fallback={null}>
              <GateCones />
            </Suspense>
          </ModelBoundary>
          <ModelBoundary
            fallback={
              <>
                {CRATES.map((crate, i) => (
                  <ProceduralCrate
                    key={i}
                    position={crate.position}
                    rotationY={crate.rotationY}
                  />
                ))}
              </>
            }
          >
            <Suspense fallback={null}>
              <GateCrates />
            </Suspense>
          </ModelBoundary>
        </>
      )}
    </group>
  );
}

export interface TrucksProps {
  tier: "full" | "lite";
  reduced: boolean;
  progress: React.RefObject<number>;
}

/**
 * The yard's rolling stock: trucks on the TRUCK_PATHS routes, the gate with its
 * animated barrier, and (full tier) cones + crate props. All model subtrees are
 * wrapped in a `ModelBoundary` so a missing/blocked GLB degrades to procedural
 * geometry instead of taking the scene down.
 */
export function Trucks({ tier, reduced, progress }: TrucksProps) {
  const routes = useMemo(() => buildRoutes(), []);
  const u1 = useRef(0);
  const onU1 = useCallback((u: number) => {
    u1.current = u;
  }, []);

  return (
    <group>
      <Truck
        route={routes[0]}
        body={BODY_A}
        reduced={reduced}
        progress={progress}
        onProgress={onU1}
      />
      {tier === "full" && (
        <Truck route={routes[1]} body={BODY_B} reduced={reduced} progress={progress} />
      )}
      <Gate tier={tier} u1={u1} />
    </group>
  );
}
