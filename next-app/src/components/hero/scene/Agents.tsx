"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { ACCENT_ORANGE } from "@/lib/palette";
import { CONTAINER, CRANE } from "@/lib/yard";

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
}

/**
 * Gantry crane: two X-braced A-frame supports carrying a beam over the cleared
 * lane at x = pickX, a trolley that rides the beam between the pick and place
 * slots, and a spreader that hoists a container along the KEYS timeline. The
 * hoist clamps at the grip station so the spreader settles on a grounded
 * container instead of sinking through it.
 */
export function GantryCrane({ progress, reduced }: GantryCraneProps) {
  const trolleyRef = useRef<THREE.Group>(null);
  const spreaderRef = useRef<THREE.Group>(null);
  const cableRefs = useRef<(THREE.Mesh | null)[]>([]);
  const boxRef = useRef<THREE.Mesh>(null);
  const tRef = useRef(2); // start after load-in

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
    <group>
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
