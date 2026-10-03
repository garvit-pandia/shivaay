"use client";

import { useEffect, useRef } from "react";
import { cities, routes } from "@/lib/data";

const R = 1.7;

function latLngToVec3(lat: number, lng: number, radius: number) {
  const phi = (lat * Math.PI) / 180;
  const theta = (lng * Math.PI) / 180;
  return {
    x: radius * Math.cos(phi) * Math.sin(theta),
    y: radius * Math.sin(phi),
    z: radius * Math.cos(phi) * Math.cos(theta),
  };
}

/**
 * Interactive 3D trade-routes globe. Teal dot-sphere on cream, animated
 * great-circle arcs from Ludhiana to every port, moving cargo packets,
 * mono city labels, drag-to-rotate with idle spin. Lazy-loads three.js,
 * pauses offscreen, static frame under reduced motion, gradient fallback
 * when WebGL is unavailable.
 */
export function GlobeHero() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      let THREE: typeof import("three");
      try {
        THREE = await import("three");
      } catch {
        return; // fallback stays visible
      }
      if (disposed || !mountRef.current) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      try {
        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        mount.appendChild(renderer.domElement);
        // WebGL is up — fade out the static fallback composition
        mount.querySelector(".globe-fallback-ui")?.classList.add("is-hidden");

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          38,
          mount.clientWidth / Math.max(mount.clientHeight, 1),
          0.1,
          100
        );
        camera.position.z = 7.6;

        const group = new THREE.Group();
        scene.add(group);

        // --- Dot sphere (fibonacci distribution) ---
        const N = 1500;
        const positions = new Float32Array(N * 3);
        const golden = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < N; i++) {
          const y = 1 - (i / (N - 1)) * 2;
          const r = Math.sqrt(1 - y * y);
          const theta = golden * i;
          positions[i * 3] = Math.cos(theta) * r * R;
          positions[i * 3 + 1] = y * R;
          positions[i * 3 + 2] = Math.sin(theta) * r * R;
        }
        const dotGeo = new THREE.BufferGeometry();
        dotGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        const dots = new THREE.Points(
          dotGeo,
          new THREE.PointsMaterial({
            color: 0x0f766e,
            size: 0.028,
            transparent: true,
            opacity: 0.55,
            sizeAttenuation: true,
          })
        );
        group.add(dots);

        // Faint inner sphere to occlude back-side dots slightly
        const innerSphere = new THREE.Mesh(
          new THREE.SphereGeometry(R * 0.985, 48, 48),
          new THREE.MeshBasicMaterial({
            color: 0xfaf8f4,
            transparent: true,
            opacity: 0.92,
          })
        );
        group.add(innerSphere);

        // --- City markers + labels ---
        const cityVecs: Record<string, InstanceType<typeof THREE.Vector3>> = {};
        const markers: InstanceType<typeof THREE.Mesh>[] = [];
        Object.values(cities).forEach((city) => {
          const p = latLngToVec3(city.lat, city.lng, R);
          const v = new THREE.Vector3(p.x, p.y, p.z);
          cityVecs[city.name] = v;

          const marker = new THREE.Mesh(
            new THREE.SphereGeometry(city.isHub ? 0.05 : 0.034, 16, 16),
            new THREE.MeshBasicMaterial({
              color: city.isHub ? 0xea580c : 0x0f766e,
            })
          );
          marker.position.copy(v.clone().multiplyScalar(1.005));
          group.add(marker);
          markers.push(marker);

          // Label sprite — hub only (cities cluster on a globe; the
          // Leaflet coverage map carries the full set of labels)
          if (city.isHub) {
            const canvas = document.createElement("canvas");
            canvas.width = 512;
            canvas.height = 128;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.font = "700 52px 'JetBrains Mono', monospace";
              ctx.fillStyle = "#EA580C";
              ctx.textBaseline = "middle";
              ctx.fillText(city.label.toUpperCase(), 10, 64);
              const tex = new THREE.CanvasTexture(canvas);
              tex.anisotropy = 4;
              const sprite = new THREE.Sprite(
                new THREE.SpriteMaterial({
                  map: tex,
                  transparent: true,
                  opacity: 0.95,
                  depthTest: false,
                })
              );
              const w = 0.15 * (city.label.length * 0.62 + 0.4);
              sprite.scale.set(w, 0.15 * 0.9, 1);
              sprite.position.copy(
                v
                  .clone()
                  .multiplyScalar(1.08)
                  .add(new THREE.Vector3(0, 0.16, 0))
              );
              sprite.renderOrder = 10;
              group.add(sprite);
            }
          }
        });

        // --- Route arcs + moving packets ---
        interface Arc {
          curve: InstanceType<typeof THREE.QuadraticBezierCurve3>;
          packet: InstanceType<typeof THREE.Mesh>;
          speed: number;
          phase: number;
        }
        const arcs: Arc[] = [];
        routes.forEach((route, i) => {
          const a = cityVecs[route.from];
          const b = cityVecs[route.to];
          if (!a || !b) return;
          const dist = a.distanceTo(b);
          const mid = a
            .clone()
            .add(b)
            .multiplyScalar(0.5)
            .normalize()
            .multiplyScalar(R + dist * 0.45);
          const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
          const geo = new THREE.BufferGeometry().setFromPoints(
            curve.getPoints(64)
          );
          const line = new THREE.Line(
            geo,
            new THREE.LineBasicMaterial({
              color: 0x0f766e,
              transparent: true,
              opacity: 0.45,
            })
          );
          group.add(line);

          const packet = new THREE.Mesh(
            new THREE.SphereGeometry(0.024, 12, 12),
            new THREE.MeshBasicMaterial({ color: 0xea580c })
          );
          group.add(packet);
          arcs.push({
            curve,
            packet,
            speed: 0.1 + (i % 3) * 0.035,
            phase: i * 0.17,
          });
        });

        // --- Orientation: face Ludhiana toward camera ---
        const ludTheta = (cities.Ludhiana.lng * Math.PI) / 180;
        let targetRotY = -ludTheta + 0.35;
        let targetRotX = 0.3;
        group.rotation.y = targetRotY;
        group.rotation.x = targetRotX;

        // --- Drag to rotate ---
        let dragging = false;
        let lastPX = 0;
        let lastPY = 0;
        let idleSpin = true;
        const onPointerDown = (e: PointerEvent) => {
          dragging = true;
          idleSpin = false;
          lastPX = e.clientX;
          lastPY = e.clientY;
          mount.style.cursor = "grabbing";
        };
        const onPointerMove = (e: PointerEvent) => {
          if (!dragging) return;
          targetRotY += (e.clientX - lastPX) * 0.005;
          targetRotX += (e.clientY - lastPY) * 0.003;
          targetRotX = Math.max(-0.2, Math.min(0.9, targetRotX));
          lastPX = e.clientX;
          lastPY = e.clientY;
        };
        const onPointerUp = () => {
          dragging = false;
          mount.style.cursor = "grab";
          window.setTimeout(() => {
            idleSpin = true;
          }, 2500);
        };
        mount.style.cursor = "grab";
        mount.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("pointermove", onPointerMove, { passive: true });
        window.addEventListener("pointerup", onPointerUp);

        // --- Resize ---
        const onResize = () => {
          const w = mount.clientWidth;
          const h = Math.max(mount.clientHeight, 1);
          renderer.setSize(w, h);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        };
        const ro = new ResizeObserver(onResize);
        ro.observe(mount);

        // --- Pause offscreen / tab hidden ---
        let visible = true;
        const io = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
        });
        io.observe(mount);

        // --- Render loop ---
        let raf = 0;
        const t0 = performance.now();
        const renderFrame = () => {
          const t = (performance.now() - t0) / 1000;
          if (idleSpin) targetRotY += 0.0016;
          group.rotation.y += (targetRotY - group.rotation.y) * 0.08;
          group.rotation.x += (targetRotX - group.rotation.x) * 0.08;

          arcs.forEach((arc) => {
            const p = (t * arc.speed + arc.phase) % 1;
            arc.packet.position.copy(arc.curve.getPoint(p));
          });
          markers.forEach((m, i) => {
            const s = 1 + 0.22 * Math.sin(t * 2 + i * 1.3);
            m.scale.setScalar(s);
          });

          renderer.render(scene, camera);
        };

        if (reduced) {
          arcs.forEach((arc) => {
            arc.packet.position.copy(arc.curve.getPoint(0.6));
          });
          renderFrame();
        } else {
          const loop = () => {
            raf = requestAnimationFrame(loop);
            if (!visible || document.hidden) return;
            renderFrame();
          };
          loop();
        }

        cleanup = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          io.disconnect();
          mount.removeEventListener("pointerdown", onPointerDown);
          window.removeEventListener("pointermove", onPointerMove);
          window.removeEventListener("pointerup", onPointerUp);
          scene.traverse((obj) => {
            if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.Line) {
              obj.geometry.dispose();
              const mat = obj.material;
              if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
              else mat.dispose();
            }
            if (obj instanceof THREE.Sprite) {
              obj.material.map?.dispose();
              obj.material.dispose();
            }
          });
          renderer.dispose();
          renderer.domElement.remove();
        };
      } catch {
        // WebGL unavailable — gradient fallback stays visible
      }
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <div ref={mountRef} className="globe-wrap" aria-hidden="true">
      {/* Static no-WebGL composition: dashed trade arcs + city dots */}
      <div className="globe-fallback-ui">
        <div className="globe-fallback" />
        <svg
          className="absolute inset-0 h-full w-full opacity-50"
          viewBox="0 0 800 600"
          preserveAspectRatio="xMidYMid slice"
          focusable="false"
        >
          <g
            fill="none"
            stroke="#0F766E"
            strokeWidth="1.5"
            strokeDasharray="7 9"
            strokeLinecap="round"
          >
            <path d="M 180 310 Q 290 160 450 195" />
            <path d="M 180 310 Q 380 250 565 305" />
            <path d="M 180 310 Q 300 445 465 435" />
            <path d="M 180 310 Q 425 135 645 235" />
          </g>
          <g fill="#0F766E">
            <circle cx="450" cy="195" r="4.5" />
            <circle cx="565" cy="305" r="4.5" />
            <circle cx="465" cy="435" r="4.5" />
            <circle cx="645" cy="235" r="4.5" />
          </g>
          <circle cx="180" cy="310" r="7" fill="#EA580C" />
        </svg>
      </div>
    </div>
  );
}
