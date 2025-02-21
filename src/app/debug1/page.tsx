"use client";  // 1) Must be line one for hooks

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";  // 2) The main fiber import
import { OrbitControls } from "@react-three/drei";       // 3) Additional Drei helper
import * as THREE from "three";                          // 4) Usually needed if you do direct THREE.* manip

export default function Page() {
  return (
    <main className="h-screen w-screen bg-black text-white flex flex-col">
      <section className="pt-6 text-center">
        <h1 className="text-4xl">
          Debug1: Single Overhead Floodlight
        </h1>
      </section>

      <section className="flex-1">
        <Canvas className="h-full w-full">
          {/* Overhead single floodlight */}
          <spotLight
            position={[0, 12, 0]}
            color="red"
            intensity={100}
            distance={1000}
            angle={1.5}
            penumbra={0.5}
            castShadow={false}
          />

          <Floor />
          <DebugSphere />

          <OrbitControls />
        </Canvas>
      </section>
    </main>
  );
}

/* Simple floor => #333 so we can see color reflection. */
function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color="#333" />
    </mesh>
  );
}

/* A small sphere to confirm overhead color is hitting it. */
function DebugSphere() {
  const groupRef = useRef<THREE.Group>(null);

  // Slow rotation
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={groupRef} position={[0, 2, 0]}>
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color="white" metalness={0.2} roughness={0.3} />
      </mesh>
    </group>
  );
}
