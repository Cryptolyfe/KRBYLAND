"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";

/* 
  Overhead lights config: color, position, movement 
*/
interface OverheadLightConfig {
  color: string;
  x: number;
  z: number;
  speed: number;
  mode: "rotate" | "scan";
}
interface CeilingLightProps extends OverheadLightConfig {}

/*
  Floor spotlights
*/
interface FloorSpotlightProps {
  color?: string;
  initialAngle?: number;
  speed?: number;
}

/*
  We'll also add random boxes for extra reflection
*/
interface SceneObjectConfig {
  x: number;
  z: number;
  size: number;
  color: string;
}

export default function HomePage() {
  return (
    <main className="h-screen w-screen bg-black text-white flex flex-col">
      {/* Heading: KRBYLAND + Gig From Anywhere */}
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
          {/* Minimal ambient, let overhead + floor spots do the main lighting */}
          <ambientLight intensity={0.02} />

          {/* Environment => for disco ball reflection */}
          <Environment preset="studio" />

          {/* Overhead lights => 12 in color + white */}
          <CeilingLights />

          {/* Rotating floor spotlights => same logic as snippet 3 */}
          <FloorSpotlight color="red" />
          <FloorSpotlight color="blue" initialAngle={Math.PI / 2} speed={1.5} />
          <FloorSpotlight color="green" initialAngle={Math.PI} speed={0.8} />
          <FloorSpotlight color="magenta" initialAngle={(3 * Math.PI) / 2} speed={1.2} />

          {/* The floor => new color #444 with some reflection */}
          <Floor />

          {/* Original disco ball code => same rotation speed from snippet 3 */}
          <DiscoBall />

          {/* Random scene objects => boxes or pillars */}
          <SceneObjects />

          <OrbitControls />
        </Canvas>
      </section>
    </main>
  );
}

/* 
  1) Floor => #444, slightly reflective 
*/
function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color="#444" metalness={0.2} roughness={0.3} />
    </mesh>
  );
}

/* 
  2) Disco Ball => same code from snippet 3,
     single color texture, radius=0.8, pos [0,2,0]
     rotation speed is groupRef.current.rotation.y += 0.01
*/
function DiscoBall() {
  const groupRef = useRef<THREE.Group>(null);

  // Single disco color texture
  const colorMap = useTexture("/textures/disco_color.jpg");

  // Rotate at same speed from snippet 3
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01; 
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
  3) Overhead Lights => 12 total,
     includes color + "white",
     no shadows => avoid GPU texture limit
*/
function CeilingLights() {
  const numLights = 12;
  // Add "white" to color array along with your existing colors
  const colorOptions = [
    "red",
    "blue",
    "green",
    "yellow",
    "magenta",
    "cyan",
    "white",
  ];

  const lights = useMemo<OverheadLightConfig[]>(() => {
    const arr: OverheadLightConfig[] = [];
    for (let i = 0; i < numLights; i++) {
      const color =
        colorOptions[Math.floor(Math.random() * colorOptions.length)];
      const x = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20;
      const speed = 0.5 + Math.random() * 1.5;
      const mode: "rotate" | "scan" =
        Math.random() > 0.5 ? "rotate" : "scan";
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
      const sweep = Math.sin(angleRef.current) * 10;
      lightRef.current.target.position.set(sweep, 0, 0);
      lightRef.current.target.updateMatrixWorld();
    }
  });

  return (
    <spotLight
      ref={lightRef}
      color={color}
      intensity={12}   // bright
      distance={150}
      angle={1.0}
      penumbra={0.5}
      castShadow={false}
    />
  );
}

/* 
  4) Rotating floor spotlights => same logic from snippet 3
     can cast shadows, lower intensity => overhead remains main coverage
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

/* 
  5) Scene objects => random boxes/pillars for extra reflection
  We'll place ~6 boxes at random (x,z), random size
*/
function SceneObjects() {
  const numObjs = 6;

  // We'll pick from a small array of colors for the boxes
  const boxColors = ["red", "blue", "green", "purple", "orange"];

  const configs = useMemo<SceneObjectConfig[]>(() => {
    const arr: SceneObjectConfig[] = [];
    for (let i = 0; i < numObjs; i++) {
      const color = boxColors[Math.floor(Math.random() * boxColors.length)];
      const x = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20;
      const size = 1 + Math.random() * 2; // random box size, 1..3
      arr.push({ x, z, size, color });
    }
    return arr;
  }, [numObjs, boxColors]);

  return (
    <>
      {configs.map((cfg, i) => (
        <BoxObject key={i} {...cfg} />
      ))}
    </>
  );
}

interface SceneObjectConfig {
  x: number;
  z: number;
  size: number;
  color: string;
}
function BoxObject({ x, z, size, color }: SceneObjectConfig) {
  const boxRef = useRef<THREE.Mesh>(null);

  return (
    <mesh ref={boxRef} position={[x, size / 2 - 1, z]} receiveShadow castShadow>
      {/* either a box or a cylinder, pick one */}
      <boxGeometry args={[size, size, size]} />
      {/* moderate reflection so overhead lights color them */}
      <meshStandardMaterial color={color} metalness={0.2} roughness={0.3} />
    </mesh>
  );
}
