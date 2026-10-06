"use client";

import { Canvas } from "@react-three/fiber";
import { Instance, Instances } from "@react-three/drei";
import { useCallback, useMemo, useRef } from "react";
import * as THREE from "three";
import { CONTAINER, YARD, createYard } from "@/lib/yard";
import { CameraRig } from "./CameraRig";
import {
  BridgeRegistration,
  GantryCrane,
  ReachStacker,
  YardDressing,
  type RegisterAgent,
} from "./Agents";
import { NetworkLayer } from "./NetworkLayer";
import { StackLabels } from "./StackLabels";
import { Trucks } from "./Trucks";

export type QualityTier = "full" | "lite";

function StackField({ tier }: { tier: QualityTier }) {
  const { boxes } = useMemo(() => createYard(116, tier === "lite" ? "lite" : "full"), [tier]);

  // Subtle per-instance tonal variation so the stacks read as individual
  // boxes, not a flat fill. Deterministic hash of the box number.
  const colors = useMemo(
    () =>
      boxes.map((b) => {
        const n = Number.parseInt(b.id.slice(4), 10) || 0;
        const j = (((n * 2654435761) % 1000) / 1000 - 0.5) * 0.07;
        return new THREE.Color(b.color).offsetHSL(0, 0, j);
      }),
    [boxes]
  );

  const ribTexture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 64, 64);
      ctx.fillStyle = "rgba(30,27,24,0.14)";
      for (let x = 0; x < 64; x += 8) ctx.fillRect(x, 0, 2, 64);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 1);
    return tex;
  }, []);

  return (
    <Instances limit={boxes.length} castShadow={false} receiveShadow={false}>
      <boxGeometry args={[CONTAINER.w, CONTAINER.h, CONTAINER.d]} />
      <meshStandardMaterial map={ribTexture} roughness={0.82} metalness={0.04} />
      {boxes.map((b, i) => (
        <Instance
          key={b.id}
          position={[b.x, (b.tier + 0.5) * (CONTAINER.h + 0.12), b.z]}
          color={colors[i]}
        />
      ))}
    </Instances>
  );
}

export interface HeroStageProps {
  tier: QualityTier;
  progress: React.RefObject<number>;
  active: boolean;
  reduced: boolean;
  onContextLost: () => void;
}

export function HeroStage({ tier, progress, active, reduced, onContextLost }: HeroStageProps) {
  const roots = useRef<Record<string, THREE.Object3D>>({});
  const registerAgent = useCallback<RegisterAgent>((id, node) => {
    if (node) roots.current[id] = node;
    else delete roots.current[id];
  }, []);

  // Painted apron: lane dashes under the two truck lanes + a stop bar at the
  // gate. Canvas top edge maps to the yard's north edge (z = -75).
  const apronTexture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 700;
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#E4DFD2";
      ctx.fillRect(0, 0, 1024, 700);
      const X = (x: number) => ((x + 110) / 220) * 1024;
      const Z = (z: number) => ((z + 75) / 150) * 700;
      ctx.strokeStyle = "rgba(250,248,244,0.6)";
      ctx.lineWidth = 5;
      ctx.setLineDash([28, 20]);
      for (const z of [-64, -12]) {
        ctx.beginPath();
        ctx.moveTo(X(-102), Z(z));
        ctx.lineTo(X(102), Z(z));
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(250,248,244,0.65)";
      ctx.fillRect(X(-13), Z(-66.5), X(13) - X(-13), 7);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, []);

  return (
    <Canvas
      aria-hidden
      frameloop={active ? "always" : "never"}
      dpr={[1, tier === "lite" ? 1.5 : 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [64, 100, 142], fov: 38, near: 0.5, far: 4000 }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onContextLost();
        });
      }}
    >
      <hemisphereLight args={[0xfff6e8, 0xd9d2c4, 1.15]} />
      <directionalLight position={[42, 70, 24]} intensity={1.5} color={0xfff1dc} />
      <fog attach="fog" args={["#FAF8F4", 280, 1700]} />

      {/* map paper */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.3, 0]}>
        <planeGeometry args={[2400, 2400]} />
        <meshStandardMaterial color="#F3EFE7" roughness={1} />
      </mesh>
      {/* yard apron */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
        <planeGeometry args={[YARD.w, YARD.d]} />
        <meshStandardMaterial map={apronTexture} roughness={1} />
      </mesh>

      <CameraRig progress={progress} />

      <BridgeRegistration roots={roots} />

      <NetworkLayer progress={progress} reduced={reduced} />

      <StackField tier={tier} />

      <StackLabels tier={tier} progress={progress} />

      <GantryCrane progress={progress} reduced={reduced} register={registerAgent} />

      <ReachStacker tier={tier} reduced={reduced} progress={progress} register={registerAgent} />

      <YardDressing />

      <Trucks tier={tier} reduced={reduced} progress={progress} register={registerAgent} />
    </Canvas>
  );
}
