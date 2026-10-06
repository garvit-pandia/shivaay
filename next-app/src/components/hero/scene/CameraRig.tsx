"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { makeCurves } from "@/lib/hero-poses";
import { smoothstep } from "@/lib/hero-ease";

/**
 * Consumes the shared progress ref (0 = map, 1 = settled yard) and drives the
 * camera along authored keyframes. Pointer parallax only once settled.
 */
export function CameraRig({ progress }: { progress: React.RefObject<number> }) {
  const curves = useMemo(() => makeCurves(), []);
  const { camera, pointer } = useThree();
  const target = useRef(new THREE.Vector3());
  const desired = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const p = progress.current ?? 1;
    curves.pos.getPoint(p, desired.current);
    curves.target.getPoint(p, target.current);

    // Damped pointer parallax, weighted to the settled pose.
    const w = smoothstep(0.85, 1, p);
    desired.current.x += pointer.x * 2.6 * w;
    desired.current.y += -pointer.y * 1.3 * w;

    const k = 1 - Math.exp(-6 * delta);
    camera.position.lerp(desired.current, k);
    camera.lookAt(look.current.copy(target.current));
  });

  return null;
}
