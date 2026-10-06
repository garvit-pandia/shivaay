"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { makeCurves } from "@/lib/hero-poses";
import { smoothstep } from "@/lib/hero-ease";

/**
 * Consumes the shared progress ref (0 = map, 1 = settled yard) and drives the
 * camera along authored keyframes. The path itself is tracked exactly (the
 * progress value already carries the motion smoothing); only the pointer
 * parallax and the look target are damped, so the dive never lags its
 * choreography.
 */
export function CameraRig({ progress }: { progress: React.RefObject<number> }) {
  const curves = useMemo(() => makeCurves(), []);
  const { camera, pointer } = useThree();
  const target = useRef(new THREE.Vector3());
  const desired = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3());
  const par = useRef(new THREE.Vector2());
  const lookInit = useRef(false);

  useFrame((_, delta) => {
    const p = progress.current ?? 1;
    curves.pos.getPoint(p, desired.current);
    curves.target.getPoint(p, target.current);

    // Damped pointer parallax, weighted to the settled pose.
    const step = 1 - Math.exp(-8 * Math.min(delta, 0.05));
    const w = smoothstep(0.85, 1, p);
    par.current.x += (pointer.x * 2.6 * w - par.current.x) * step;
    par.current.y += (-pointer.y * 1.3 * w - par.current.y) * step;
    camera.position.set(
      desired.current.x + par.current.x,
      desired.current.y + par.current.y,
      desired.current.z
    );

    if (!lookInit.current) {
      look.current.copy(target.current);
      lookInit.current = true;
    } else {
      look.current.lerp(target.current, 1 - Math.exp(-10 * Math.min(delta, 0.05)));
    }
    camera.lookAt(look.current);
  });

  return null;
}
