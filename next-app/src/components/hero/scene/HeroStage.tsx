"use client";

import { Canvas } from "@react-three/fiber";
import { Instance, Instances } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { CONTAINER, YARD, createYard } from "@/lib/yard";
import { CameraRig } from "./CameraRig";
import { NetworkLayer } from "./NetworkLayer";

export type QualityTier = "full" | "lite";

function StackField({ tier }: { tier: QualityTier }) {
  const { boxes } = useMemo(() => createYard(116, tier === "lite" ? "lite" : "full"), [tier]);

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
      {boxes.map((b) => (
        <Instance
          key={b.id}
          position={[b.x, (b.tier + 0.5) * (CONTAINER.h + 0.12), b.z]}
          color={b.color}
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
        <meshStandardMaterial color="#E4DFD2" roughness={1} />
      </mesh>

      <CameraRig progress={progress} />

      <NetworkLayer progress={progress} reduced={reduced} />

      <StackField tier={tier} />
    </Canvas>
  );
}
