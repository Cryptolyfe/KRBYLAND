"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, useTexture } from "@react-three/drei";
import * as THREE from "three";

/*
  ============== TYPE DEFINITIONS ==============
*/
interface CeilingLightProps {
  color: string;
  x: number;
  z: number;
  speed: number;
  mode: "rotate" | "scan";
}

interface FloorSpotlightProps {
  color?: string;
  initialAngle?: number;
  speed?: number;
}

/*
  ============== MAIN PAGE COMPONENT ==============
*/
export default function Page() {
  return (
    <main className="h-screen w-screen bg-black text-white flex flex-col">
      <section className="pt-6 text-center space-y-2">
        <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-cyan-400">
          KRBYLAND
        </h1>
        <h2 className="text-2xl font-medium text-cyan-300">
          Gig From Anywhere
        </h2>
      </section>

      <section className="flex-1">
        <Canvas shadows className="h-full w-full">
          {/* Minimal ambient => overhead + floor spots remain main */}
          <ambientLight intensity={0.02} />

          {/* Environment => disco ball reflection */}
          <Environment preset="studio" />

          {/* Overhead: 50 lights => big coverage, no shadows => avoid GPU limit */}
          <CeilingLights />

          {/* Four rotating floor spotlights => can cast shadows */}
          <FloorSpotlight color="red" />
          <FloorSpotlight color="blue" initialAngle={Math.PI / 2} speed={1.5} />
          <FloorSpotlight color="green" initialAngle={Math.PI} speed={0.8} />
          <FloorSpotlight color="magenta" initialAngle={(3 * Math.PI) / 2} speed={1.2} />

          <Floor />
          <DiscoBall />

          <OrbitControls />
        </Canvas>
      </section>
    </main>
  );
}

/* 
  1) The floor => #333, moderate reflection 
*/
function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color="#333" metalness={0.2} roughness={0.3} />
    </mesh>
  );
}

/*
  2) Disco Ball => same from debug3, 
     but let's spin faster e.g. rotation.y += 0.02
     If you want exactly debug3 speed, use 0.01
     If you want it even faster, do 0.02 or 0.03
*/
function DiscoBall() {
  const groupRef = useRef<THREE.Group>(null);

  // Single disco color texture
  const colorMap = useTexture("/textures/disco_color.jpg");

  useFrame(() => {
    if (groupRef.current) {
      // Spin faster. Debug3 used ~0.01, let's do 0.02 for extra speed
      groupRef.current.rotation.y += 0.02;
    }
  });

  return (
    <group ref={groupRef} position={[0, 2, 0]}>
      <mesh castShadow>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial map={colorMap} metalness={1} roughness={0} />
      </mesh>
    </group>
  );
}

/*
  3) Overhead lights => 50 from debug4, no shadows => big coverage
*/
function CeilingLights() {
  const numLights = 50;
  const colorOptions = ["red", "blue", "green", "yellow", "magenta", "cyan", "white"];

  const lights: CeilingLightProps[] = useMemo(() => {
    const arr: CeilingLightProps[] = [];
    for (let i = 0; i < numLights; i++) {
      const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      const x = (Math.random() - 0.5) * 30;
      const z = (Math.random() - 0.5) * 30;
      const speed = 0.5 + Math.random() * 1.5;
      const mode: "rotate" | "scan" = Math.random() > 0.5 ? "rotate" : "scan";
      arr.push({ color, x, z, speed, mode });
    }
    return arr;
  }, [numLights]);

  return (
    <>
      {lights.map((cfg, i) => (
        <CeilingLight key={i} {...cfg} />
      ))}
    </>
  );
}
function CeilingLight({ color, x, z, speed, mode }: CeilingLightProps) {
  const lightRef = useRef<THREE.SpotLight>(null);
  const angleRef = useRef<number>(0);
  const overheadY = 10;

  useFrame((_, delta) => {
    angleRef.current += speed * delta;
    if (!lightRef.current) return;

    if (mode === "rotate") {
      const localRadius = 3;
      const offsetX = localRadius * Math.cos(angleRef.current);
      const offsetZ = localRadius * Math.sin(angleRef.current);
      lightRef.current.position.set(x + offsetX, overheadY, z + offsetZ);
      lightRef.current.target.position.set(0, 0, 0);
      lightRef.current.target.updateMatrixWorld();
    } else {
      // scanning
      lightRef.current.position.set(x, overheadY, z);
      const sweep = Math.sin(angleRef.current) * 15;
      lightRef.current.target.position.set(sweep, 0, 0);
      lightRef.current.target.updateMatrixWorld();
    }
  });

  return (
    <spotLight
      ref={lightRef}
      color={color}
      intensity={20}
      distance={300}
      angle={1.2}
      penumbra={0.5}
      castShadow={false}
    />
  );
}

/*
  4) Floor spotlights => rotating around center, can cast shadows, 
     same as debug3 or debug4
*/
function FloorSpotlight({
  color = "white",
  initialAngle = 0,
  speed = 1,
}: FloorSpotlightProps) {
  const lightRef = useRef<THREE.SpotLight>(null);
  const angleRef = useRef<number>(initialAngle);

  useFrame((_, delta) => {
    angleRef.current += speed * delta;
    const radius = 6;
    const height = 3;
    const x = radius * Math.cos(angleRef.current);
    const z = radius * Math.sin(angleRef.current);

    if (lightRef.current) {
      lightRef.current.position.set(x, height, z);
      lightRef.current.target.position.set(0, 0, 0);
      lightRef.current.target.updateMatrixWorld();
    }
  });

  return (
    <spotLight
      ref={lightRef}
      color={color}
      intensity={4}
      distance={30}
      angle={0.4}
      penumbra={0.5}
      castShadow
    />
  );
}
