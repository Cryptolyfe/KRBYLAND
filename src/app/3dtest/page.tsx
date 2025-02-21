"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export default function ScenePage() {
  return (
    <main className="w-full h-screen bg-black text-white">
      <Canvas>
        {/* Some basic lights */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />

        {/* Simple rotating box using <boxGeometry> */}
        <mesh rotation={[0.5, 1, 0]}>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="hotpink" />
        </mesh>

        <OrbitControls />
      </Canvas>
    </main>
  );
}
