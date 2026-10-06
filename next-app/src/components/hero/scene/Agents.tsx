"use client";

import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { setThreeWaybill, type Waybill } from "@/lib/cursor-store";
import { heroBridge } from "@/lib/hero-bridge";
import { ACCENT_ORANGE } from "@/lib/palette";
import { CONTAINER, CRANE } from "@/lib/yard";

/* ------------------------------------------------------------------ *
 * Raycast bridge — hovered agents publish waybills to the cursor store
 * and expose their screen position for tests + tooling.
 * ------------------------------------------------------------------ */

/** Stable scene ids + waybill copy for the hoverable yard agents. */
const AGENT_WAYBILLS: Record<"crane" | "stacker", Waybill> = {
  crane: { id: "SHV-CRN-01", label: "ICD Transfer", route: "YARD → YARD" },
  stacker: { id: "SHV-STK-01", label: "Stack Shuffle", route: "LANE 2 → BLOCK C" },
};

/** Named agent roots, filled on mount and read by `BridgeRegistration`. */
export type AgentRoots = React.RefObject<Record<string, THREE.Object3D>>;

/** Registers (or clears, with `null`) a named agent root. */
export type RegisterAgent = (id: string, node: THREE.Object3D | null) => void;

/** Hover handlers for an agent: cursor highlight + waybill in, clear on out. */
export function agentHover(waybill: Waybill) {
  return {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      document.body.style.cursor = "pointer";
      setAgentHighlight(e.eventObject, true);
      setThreeWaybill(waybill);
    },
    onPointerOut: (e: ThreeEvent<PointerEvent>) => {
      document.body.style.cursor = "";
      setAgentHighlight(e.eventObject, false);
      setThreeWaybill(null);
    },
  };
}

/**
 * Teal emissive lift on the hovered agent's standard materials. All scene
 * materials start with black emissive, so clearing restores the base look
 * without storing anything.
 */
const HIGHLIGHT = new THREE.Color("#0F766E");

export function setAgentHighlight(root: THREE.Object3D | null, on: boolean) {
  root?.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mat = mesh.material as THREE.MeshStandardMaterial | undefined;
    if (!mat || !("emissive" in mat)) return;
    if (on) {
      mat.emissive.copy(HIGHLIGHT);
      mat.emissiveIntensity = 0.35;
    } else {
      mat.emissive.setRGB(0, 0, 0);
      mat.emissiveIntensity = 1;
    }
  });
}

/**
 * Publishes `heroBridge.getAgentScreenPosition` while the canvas is alive.
 * World position → NDC → viewport pixels via the GL element's rect, so the
 * numbers line up with page coordinates (and Playwright's mouse).
 */
export function BridgeRegistration({ roots }: { roots: AgentRoots }) {
  const { camera, gl } = useThree();

  useEffect(() => {
    heroBridge.getAgentScreenPosition = (id) => {
      const obj = roots.current[id];
      if (!obj) return null;
      const v = new THREE.Vector3();
      obj.getWorldPosition(v);
      v.project(camera);
      const rect = gl.domElement.getBoundingClientRect();
      return {
        x: rect.left + ((v.x + 1) / 2) * rect.width,
        y: rect.top + ((1 - v.y) / 2) * rect.height,
      };
    };
    return () => {
      heroBridge.getAgentScreenPosition = () => null;
    };
  }, [camera, gl, roots]);

  return null;
}

/** Crane timeline keys: t seconds → trolley (0 pick…1 place), hoist (1 high…0 low), carrying. */
const KEYS = [
  { t: 0, trolley: 0, hoist: 1, carry: false },
  { t: 2, trolley: 0, hoist: 0, carry: false },
  { t: 3, trolley: 0, hoist: 0, carry: true },
  { t: 5, trolley: 0, hoist: 1, carry: true },
  { t: 7.5, trolley: 1, hoist: 1, carry: true },
  { t: 9.5, trolley: 1, hoist: 0, carry: true },
  { t: 10.5, trolley: 1, hoist: 0, carry: false },
  { t: 12.5, trolley: 1, hoist: 1, carry: false },
  { t: 16, trolley: 0, hoist: 1, carry: false },
];

function sample(keys: typeof KEYS, t: number) {
  const time = t % CRANE.cycle;
  let a = keys[0];
  let b = keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i++) {
    if (time >= keys[i].t && time <= keys[i + 1].t) {
      a = keys[i];
      b = keys[i + 1];
      break;
    }
  }
  const span = Math.max(b.t - a.t, 0.0001);
  const raw = (time - a.t) / span;
  const e = raw * raw * (3 - 2 * raw);
  const lerp = (x: number, y: number) => x + (y - x) * e;
  const trolley = lerp(a.trolley, b.trolley);
  const hoist = lerp(a.hoist, b.hoist);
  let carry: boolean;
  if (a.carry !== b.carry) carry = raw >= 0.999 ? b.carry : a.carry;
  else carry = a.carry;
  return { trolley, hoist, carry };
}

/** Trolley block height — deep enough to stay visible under the beam. */
const TROLLEY_H = 2.6;
/** Trolley centre height: its top face meets the beam underside. */
const TROLLEY_Y = CRANE.beamY - 0.6 - TROLLEY_H / 2;
/** Spreader centre height when its underside grips a container resting on the apron. */
const SPREADER_GRIP_Y = CONTAINER.h + 0.2;
/** Container centre height when it rests on the apron. */
const GROUND_BOX_Y = CONTAINER.h / 2;
/** Trolley-local Y of its underside — where the hoist cables anchor. */
const TROLLEY_UNDERSIDE = -TROLLEY_H / 2;

/** Cable span between the trolley underside and the spreader top, in trolley-local Y. */
function cableSpan(spreaderY: number) {
  const topLocal = spreaderY - TROLLEY_Y + 0.2;
  const length = Math.max(TROLLEY_UNDERSIDE - topLocal, 0.01);
  return { length, mid: (topLocal + TROLLEY_UNDERSIDE) / 2 };
}

const PARK_CABLE = cableSpan(SPREADER_GRIP_Y);

/** A-frame end supports: legs splay outward toward the ground and X-brace each pair. */
const LEG_FOOT = 3.4; // half-separation at the ground — outer faces stay inside the cleared lane
const LEG_TOP = 1.5; // half-separation where the legs meet the beam
const LEG_T = 2.2; // leg cross-section
const BRACE_T = 0.5; // brace thickness

/** Leg centreline half-separation at height y. */
const legXAt = (y: number) => LEG_FOOT + (LEG_TOP - LEG_FOOT) * (y / CRANE.beamY);

/** One X-brace per A-frame, spanning between the two leg centrelines. */
const BRACE = (() => {
  const y0 = 1.2;
  const y1 = CRANE.beamY - 1.2;
  const x0 = legXAt(y0);
  const x1 = legXAt(y1);
  const length = Math.hypot(x0 + x1, y1 - y0);
  return {
    cx: (x1 - x0) / 2,
    cy: (y0 + y1) / 2,
    length,
    angle: Math.atan2(x0 + x1, y1 - y0),
  };
})();

export interface GantryCraneProps {
  progress: React.RefObject<number>;
  reduced: boolean;
  register: RegisterAgent;
}

/**
 * Gantry crane: two X-braced A-frame supports carrying a beam over the cleared
 * lane at x = pickX, a trolley that rides the beam between the pick and place
 * slots, and a spreader that hoists a container along the KEYS timeline. The
 * hoist clamps at the grip station so the spreader settles on a grounded
 * container instead of sinking through it.
 */
export function GantryCrane({ progress, reduced, register }: GantryCraneProps) {
  const trolleyRef = useRef<THREE.Group>(null);
  const spreaderRef = useRef<THREE.Group>(null);
  const cableRefs = useRef<(THREE.Mesh | null)[]>([]);
  const boxRef = useRef<THREE.Mesh>(null);
  const anchorRef = useRef<THREE.Group>(null);
  const tRef = useRef(2); // start after load-in

  useLayoutEffect(() => {
    register("crane", anchorRef.current);
    return () => register("crane", null);
  }, [register]);

  const apply = (trolley: number, hoist: number, carry: boolean, boxZ: number) => {
    const z = CRANE.pickZ + (CRANE.placeZ - CRANE.pickZ) * trolley;
    const spreaderY = Math.max(
      CRANE.hoistLow + (CRANE.hoistHigh - CRANE.hoistLow) * hoist,
      SPREADER_GRIP_Y
    );
    trolleyRef.current?.position.set(CRANE.pickX, TROLLEY_Y, z);
    if (spreaderRef.current) spreaderRef.current.position.y = spreaderY - TROLLEY_Y;
    const { length, mid } = cableSpan(spreaderY);
    for (const cable of cableRefs.current) {
      if (!cable) continue;
      cable.scale.y = length;
      cable.position.y = mid;
    }
    if (boxRef.current) {
      boxRef.current.position.set(
        CRANE.pickX,
        carry ? spreaderY - 0.2 - CONTAINER.h / 2 : GROUND_BOX_Y,
        carry ? z : boxZ
      );
    }
  };

  useFrame((_, delta) => {
    if (reduced) {
      // Reduced motion: no cycle — trolley parked at the pick slot, box grounded.
      apply(0, 0, false, CRANE.pickZ);
      return;
    }
    const p = progress.current ?? 1;
    // The crane only runs in the settled half of the dive.
    if (p < 0.55) return;
    tRef.current += Math.min(delta, 0.05);
    const { trolley, hoist, carry } = sample(KEYS, tRef.current);
    const atPlace = tRef.current % CRANE.cycle >= 10.5;
    apply(trolley, hoist, carry, atPlace ? CRANE.placeZ : CRANE.pickZ);
  });

  return (
    <group {...agentHover(AGENT_WAYBILLS.crane)}>
      {/* bridge anchor: the beam midpoint, always inside the frame */}
      <group ref={anchorRef} position={[CRANE.pickX, CRANE.beamY, 0]} />
      {/* static frame: two X-braced A-frames + beam */}
      <group position={[CRANE.pickX, 0, 0]}>
        {[-1, 1].map((z) => (
          <group key={z} position={[0, 0, z * (CRANE.railZ / 2)]}>
            {[-1, 1].map((sx) => {
              const legTilt = Math.atan2(LEG_FOOT - LEG_TOP, CRANE.beamY);
              return (
                <mesh
                  key={sx}
                  position={[sx * ((LEG_FOOT + LEG_TOP) / 2), CRANE.beamY / 2, 0]}
                  rotation-z={sx * legTilt}
                >
                  <boxGeometry
                    args={[LEG_T, Math.hypot(LEG_FOOT - LEG_TOP, CRANE.beamY), LEG_T]}
                  />
                  <meshStandardMaterial color="#1E1B18" roughness={0.6} />
                </mesh>
              );
            })}
            {[-1, 1].map((sb) => (
              <mesh
                key={sb}
                position={[sb * BRACE.cx, BRACE.cy, 0]}
                rotation-z={-sb * BRACE.angle}
              >
                <boxGeometry args={[BRACE_T, BRACE.length, BRACE_T]} />
                <meshStandardMaterial color="#1E1B18" roughness={0.6} />
              </mesh>
            ))}
          </group>
        ))}
        <mesh position={[0, CRANE.beamY, 0]}>
          <boxGeometry args={[2.4, 1.4, CRANE.railZ + 4]} />
          <meshStandardMaterial color="#1E1B18" roughness={0.6} />
        </mesh>
      </group>
      {/* trolley + hoist, initialised at the parked pose */}
      <group ref={trolleyRef} position={[CRANE.pickX, TROLLEY_Y, CRANE.pickZ]}>
        <mesh>
          <boxGeometry args={[2.4, TROLLEY_H, 2.4]} />
          <meshStandardMaterial color="#EA580C" roughness={0.6} />
        </mesh>
        {[-0.9, 0.9].map((x, i) => (
          <mesh
            key={x}
            ref={(el) => {
              cableRefs.current[i] = el;
            }}
            position={[x, PARK_CABLE.mid, 0]}
            scale={[1, PARK_CABLE.length, 1]}
          >
            <cylinderGeometry args={[0.06, 0.06, 1, 6]} />
            <meshStandardMaterial color="#1E1B18" roughness={0.6} />
          </mesh>
        ))}
        <group ref={spreaderRef} position={[0, SPREADER_GRIP_Y - TROLLEY_Y, 0]}>
          <mesh>
            <boxGeometry args={[4.6, 0.4, 1.6]} />
            <meshStandardMaterial color="#1E1B18" roughness={0.6} />
          </mesh>
        </group>
      </group>
      {/* carried container — grounded at the pick slot while parked */}
      <mesh ref={boxRef} position={[CRANE.pickX, GROUND_BOX_Y, CRANE.pickZ]}>
        <boxGeometry args={[CONTAINER.w, CONTAINER.h, CONTAINER.d]} />
        <meshStandardMaterial color={ACCENT_ORANGE} roughness={0.82} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ *
 * Reach stacker — the second working agent, on the z = −12 service lane
 * ------------------------------------------------------------------ */

/** Reach-stacker timeline keys: x shuttles −34…14, boom work at the x = 8 pause. */
const STACKER_KEYS: { t: number; x: number; lift: number }[] = [
  { t: 0, x: 8, lift: 0 },
  { t: 1, x: 8, lift: 0 },
  { t: 2.5, x: 8, lift: 1 },
  { t: 3.5, x: 8, lift: 1 },
  { t: 5, x: 14, lift: 1 },
  { t: 6, x: 14, lift: 1 },
  { t: 12, x: -34, lift: 1 },
  { t: 13, x: -34, lift: 1 },
  { t: 14.5, x: -34, lift: 0 },
  { t: 15.5, x: -34, lift: 0 },
  { t: 20, x: 8, lift: 0 },
];

/** Reach-stacker constants; z = −12 is the stack-free service lane by design. */
const STACKER = {
  z: -12,
  cycle: 20,
  pauseX: 8,
  pivotX: 2.3,
  pivotY: 3.25,
  reach: 7,
  slingGap: 1,
  groundY: 1.35,
  topY: 6.34,
  boxW: 4,
} as const;

/** Wheel hubs, [x, z] pairs on the chassis. */
const STACKER_WHEELS: [number, number][] = [
  [-2.3, 1.55],
  [2.3, 1.55],
  [-2.3, -1.55],
  [2.3, -1.55],
];

function sampleStacker(t: number): { x: number; lift: number } {
  const time = t % STACKER.cycle;
  let a = STACKER_KEYS[0];
  let b = STACKER_KEYS[STACKER_KEYS.length - 1];
  for (let i = 0; i < STACKER_KEYS.length - 1; i++) {
    if (time >= STACKER_KEYS[i].t && time <= STACKER_KEYS[i + 1].t) {
      a = STACKER_KEYS[i];
      b = STACKER_KEYS[i + 1];
      break;
    }
  }
  const span = Math.max(b.t - a.t, 0.0001);
  const raw = (time - a.t) / span;
  const e = raw * raw * (3 - 2 * raw);
  const lerp = (u: number, v: number) => u + (v - u) * e;
  return { x: lerp(a.x, b.x), lift: lerp(a.lift, b.lift) };
}

/**
 * Rig pose for a lift value (0 = container near the apron, 1 = stack-top
 * height). The sling point sits `slingGap` above the container top and the
 * container hangs *forward* of it, so the angled boom never crosses the box.
 */
function stackerPose(lift: number) {
  const boxY = STACKER.groundY + (STACKER.topY - STACKER.groundY) * lift;
  const boxTopY = boxY + CONTAINER.h / 2;
  const tipY = boxTopY + STACKER.slingGap;
  const angle = Math.asin(
    Math.min(1, Math.max(-1, (tipY - STACKER.pivotY) / STACKER.reach))
  );
  const tipX = STACKER.pivotX + STACKER.reach * Math.cos(angle);
  return {
    boxY,
    boxTopY,
    tipY,
    angle,
    tipX,
    boxX: tipX + STACKER.boxW / 2,
    frameX: tipX + 1.2,
  };
}

const STACKER_PARKED = stackerPose(0);

export interface ReachStackerProps {
  tier: "full" | "lite";
  reduced: boolean;
  progress: React.RefObject<number>;
  register: RegisterAgent;
}

/**
 * Reach stacker: body + cab on four wheels with a two-stage angled boom. It
 * shuttles the service lane z = −12 between x = −34 and x = 14, pauses at the
 * x = 8 station and works its boom there — raising the slung container from the
 * apron to stack-top height — on a ≈20 s loop. Full tier only; under reduced
 * motion it stands parked at the pause station.
 */
export function ReachStacker({ tier, reduced, progress, register }: ReachStackerProps) {
  const vehicleRef = useRef<THREE.Group>(null);
  const boomRef = useRef<THREE.Group>(null);
  const boxRef = useRef<THREE.Mesh>(null);
  const frameRef = useRef<THREE.Mesh>(null);
  const cableRef = useRef<THREE.Mesh>(null);
  const anchorRef = useRef<THREE.Group>(null);
  const tRef = useRef(0);

  useLayoutEffect(() => {
    register("stacker", anchorRef.current);
    return () => register("stacker", null);
  }, [register]);

  const apply = (x: number, lift: number) => {
    const pose = stackerPose(lift);
    vehicleRef.current?.position.set(x, 0, STACKER.z);
    if (boomRef.current) boomRef.current.rotation.z = pose.angle;
    if (boxRef.current) boxRef.current.position.set(pose.boxX, pose.boxY, 0);
    if (frameRef.current) {
      frameRef.current.position.set(pose.frameX, pose.boxTopY + 0.13, 0);
    }
    if (cableRef.current) {
      const frameTopY = pose.boxTopY + 0.26;
      cableRef.current.position.set(pose.tipX, (pose.tipY + frameTopY) / 2, 0);
      cableRef.current.scale.y = Math.max(pose.tipY - frameTopY, 0.05);
    }
  };

  useFrame((_, delta) => {
    if (reduced) {
      // Reduced motion: parked at the pause station, container on the apron.
      apply(STACKER.pauseX, 0);
      return;
    }
    const p = progress.current ?? 1;
    // Agents run only in the settled half of the dive, like the crane.
    if (p < 0.55) return;
    tRef.current += Math.min(delta, 0.05);
    const { x, lift } = sampleStacker(tRef.current);
    apply(x, lift);
  });

  if (tier === "lite") return null;

  return (
    <group
      ref={vehicleRef}
      position={[STACKER.pauseX, 0, STACKER.z]}
      {...agentHover(AGENT_WAYBILLS.stacker)}
    >
      {/* bridge anchor at chassis height */}
      <group ref={anchorRef} position={[0, 2, 0]} />
      {/* chassis + cab + wheels */}
      <mesh position={[0, 1.95, 0]}>
        <boxGeometry args={[6.4, 2.3, 3.4]} />
        <meshStandardMaterial color="#0F766E" roughness={0.75} metalness={0.05} />
      </mesh>
      <mesh position={[-2, 3.8, -0.9]}>
        <boxGeometry args={[2.4, 2.4, 1.6]} />
        <meshStandardMaterial color="#134E4A" roughness={0.5} metalness={0.1} />
      </mesh>
      {STACKER_WHEELS.map(([wx, wz]) => (
        <mesh
          key={`${wx}:${wz}`}
          position={[wx, 0.85, wz]}
          rotation-x={Math.PI / 2}
        >
          <cylinderGeometry args={[0.85, 0.85, 0.55, 14]} />
          <meshStandardMaterial color="#1E1B18" roughness={0.85} />
        </mesh>
      ))}
      {/* two-stage angled boom, pivoted ahead of the cab */}
      <group
        ref={boomRef}
        position={[STACKER.pivotX, STACKER.pivotY, 0]}
        rotation-z={STACKER_PARKED.angle}
      >
        <mesh position={[2.3, 0, 0]}>
          <boxGeometry args={[4.6, 0.8, 1.05]} />
          <meshStandardMaterial color={ACCENT_ORANGE} roughness={0.65} />
        </mesh>
        <mesh position={[6.2, 0, 0]}>
          <boxGeometry args={[3.2, 0.6, 0.8]} />
          <meshStandardMaterial color={ACCENT_ORANGE} roughness={0.65} />
        </mesh>
      </group>
      {/* sling + lifting frame + carried container (hangs forward of the tip) */}
      <mesh
        ref={cableRef}
        position={[
          STACKER_PARKED.tipX,
          (STACKER_PARKED.tipY + STACKER_PARKED.boxTopY + 0.26) / 2,
          0,
        ]}
        scale={[
          1,
          Math.max(STACKER_PARKED.tipY - STACKER_PARKED.boxTopY - 0.26, 0.05),
          1,
        ]}
      >
        <cylinderGeometry args={[0.07, 0.07, 1, 6]} />
        <meshStandardMaterial color="#1E1B18" roughness={0.6} />
      </mesh>
      <mesh
        ref={frameRef}
        position={[STACKER_PARKED.frameX, STACKER_PARKED.boxTopY + 0.13, 0]}
      >
        <boxGeometry args={[3, 0.26, 1.8]} />
        <meshStandardMaterial color="#1E1B18" roughness={0.65} />
      </mesh>
      <mesh ref={boxRef} position={[STACKER_PARKED.boxX, STACKER_PARKED.boxY, 0]}>
        <boxGeometry args={[STACKER.boxW, CONTAINER.h, 2.3]} />
        <meshStandardMaterial color="#FAF8F4" roughness={0.85} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ *
 * Yard dressing — warehouse silhouette + painted apron decals
 * ------------------------------------------------------------------ */

const WAREHOUSE = { x: -58, z: -89, w: 70, h: 10, d: 20 } as const;
const WAREHOUSE_DOORS_X = [-70, -60, -50, -40, -30] as const;

/**
 * Flat silhouette of the bonded warehouse beyond the yard's far (north-west)
 * edge: long cream volume, a strip of dark roller doors on the apron-facing
 * wall and a barcode + wordmark band near the roofline.
 */
function Warehouse() {
  const barcode = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 64;
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, 256, 64);
      ctx.fillStyle = "#1E1B18";
      let x = 6;
      while (x < 248) {
        const w = 1 + ((x * 7) % 3);
        ctx.fillRect(x, 6, w, 34);
        x += w + 2 + ((x * 5) % 4);
      }
      ctx.font = "600 13px monospace";
      ctx.fillText("SHV · LDH / IN", 6, 58);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  return (
    <group position={[WAREHOUSE.x, 0, WAREHOUSE.z]}>
      <mesh position={[0, WAREHOUSE.h / 2, 0]}>
        <boxGeometry args={[WAREHOUSE.w, WAREHOUSE.h, WAREHOUSE.d]} />
        <meshStandardMaterial color="#F3EFE7" roughness={1} />
      </mesh>
      {WAREHOUSE_DOORS_X.map((dx) => (
        <mesh key={dx} position={[dx, 3.2, WAREHOUSE.d / 2 + 0.15]}>
          <boxGeometry args={[7, 6.4, 0.3]} />
          <meshStandardMaterial color="#1E1B18" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 8.4, WAREHOUSE.d / 2 + 0.06]}>
        <planeGeometry args={[18, 2.2]} />
        <meshBasicMaterial map={barcode} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Canvas paint for the apron decals: lane arrow / SHV stencil. */
function usePaintedDecal(kind: "arrow" | "stencil") {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 128;
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, 256, 128);
      if (kind === "arrow") {
        ctx.fillStyle = "rgba(250,248,244,0.95)";
        ctx.fillRect(32, 56, 130, 16);
        ctx.beginPath();
        ctx.moveTo(150, 34);
        ctx.lineTo(216, 64);
        ctx.lineTo(150, 94);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.strokeStyle = "rgba(15,118,110,0.8)";
        ctx.lineWidth = 6;
        ctx.strokeRect(10, 10, 236, 108);
        ctx.fillStyle = "rgba(15,118,110,0.82)";
        ctx.font = "700 62px 'Courier New', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("SHV", 128, 58);
        ctx.font = "600 16px 'Courier New', monospace";
        ctx.fillText("LDH · ICD", 128, 100);
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }, [kind]);
}

const decalMaterial = (
  map: THREE.Texture,
  opacity = 0.9
): React.ReactElement => (
  <meshBasicMaterial
    map={map}
    transparent
    opacity={opacity}
    depthWrite={false}
    toneMapped={false}
    polygonOffset
    polygonOffsetFactor={-2}
    polygonOffsetUnits={-2}
  />
);

/**
 * Thin painted markings on the apron (y = 0.02): lane arrows on the x lane at
 * z = 36 and an SHV stencil on the south pad — all clear of the truck lanes
 * (z = −64, z = −12) and the gantry lane (x ≈ 24).
 */
function ApronDecals() {
  const arrow = usePaintedDecal("arrow");
  const stencil = usePaintedDecal("stencil");
  return (
    <group>
      <mesh position={[-46, 0.02, 36]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[9, 4.5]} />
        {decalMaterial(arrow)}
      </mesh>
      <mesh position={[54, 0.02, 36]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[9, 4.5]} />
        {decalMaterial(arrow)}
      </mesh>
      <mesh position={[6, 0.02, 56]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[8, 4]} />
        {decalMaterial(stencil)}
      </mesh>
    </group>
  );
}

/** Static yard set-dressing (both tiers): warehouse silhouette + decals. */
export function YardDressing() {
  return (
    <group>
      <Warehouse />
      <ApronDecals />
    </group>
  );
}
