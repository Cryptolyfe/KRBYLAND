"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, useTexture } from "@react-three/drei";
import * as THREE from "three";

/* =================== TYPE DEFINITIONS (unchanged) =================== */
interface CeilingLightProps {
  color: string;
  x: number;
  z: number;
  speed: number;
  mode: "rotate" | "scan";
  overheadIntensity?: number;
}
interface LaserProps {
  color: string;
  x: number;
  z: number;
  speed: number;
  mode: "rotate" | "scan";
  apexY?: number;
}
interface AvatarProps {
  position?: [number, number, number];
  color?: string;
}

/* =================== 1) RANDOM COLOR STROBE LIGHT (renamed) =================== */
function RandomColorStrobeLightDebug({
  position = [0, 5, 5],
  frequency = 5,
  maxIntensity = 80,
}: {
  position?: [number, number, number];
  frequency?: number;
  maxIntensity?: number;
}) {
  const lightRef = useRef<THREE.SpotLight>(null);
  const isOnRef = useRef(false);

  useFrame(() => {
    const t = performance.now() * 0.001;
    const wave = (Math.sin(t * frequency * 2 * Math.PI) + 1) / 2;
    const isOn = wave > 0.5;
    const intensity = isOn ? maxIntensity : 0;

    if (lightRef.current) {
      lightRef.current.intensity = intensity;
      if (isOn && !isOnRef.current) {
        const hue = Math.random() * 360;
        lightRef.current.color = new THREE.Color(`hsl(${hue}, 100%, 50%)`);
      }
    }
    isOnRef.current = isOn;
  });

  return (
    <spotLight
      ref={lightRef}
      position={position}
      angle={0.8}
      penumbra={0.4}
      distance={200}
      castShadow
    />
  );
}

/* =================== 2) DISCO BALL SPOTLIGHT (renamed) =================== */
function DiscoBallSpotlightDebug({
  position = [0, 7, 1],
  targetPos = [0, 2, 0],
  intensity = 3,
  angle = 0.2,
}: {
  position?: [number, number, number];
  targetPos?: [number, number, number];
  intensity?: number;
  angle?: number;
}) {
  const lightRef = useRef<THREE.SpotLight>(null);

  useFrame(() => {
    if (!lightRef.current) return;
    lightRef.current.target.position.set(...targetPos);
    lightRef.current.target.updateMatrixWorld();
  });

  return (
    <>
      <spotLight
        ref={lightRef}
        position={position}
        intensity={intensity}
        angle={angle}
        penumbra={0.3}
        distance={60}
        castShadow
      />
      <object3D position={targetPos} />
    </>
  );
}

/* =================== 3) AVATAR COMPONENTS (all renamed) =================== */

/* --- BartenderMaleDebug --- */
function BartenderMaleDebug({ position = [0, 0, 0] }: AvatarProps) {
  const skinColor = "#ffe0bd";
  const clothesColor = "#000000";
  const bottleColor = "#33ff33";
  const UPPER_ARM_ANGLE = -Math.PI / 2;
  const FOREARM_ANGLE = 0.2;

  return (
    <group position={position}>
      {/* Legs */}
      <mesh position={[-0.25, 0.5, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 1, 12]} />
        <meshStandardMaterial color={clothesColor} />
      </mesh>
      <mesh position={[0.25, 0.5, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 1, 12]} />
        <meshStandardMaterial color={clothesColor} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.8, 1, 0.4]} />
        <meshStandardMaterial color={clothesColor} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>

      {/* Fedora */}
      <group position={[0, 2.2, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.3, 0.06, 16, 24]} />
          <meshStandardMaterial color={clothesColor} />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.2, 16]} />
          <meshStandardMaterial color={clothesColor} />
        </mesh>
      </group>

      {/* Arms */}
      {/* Left Arm (overhead waving) */}
      <group position={[-0.55, 1.5, 0]}>
        <mesh position={[0, 0.2, 0]} rotation={[UPPER_ARM_ANGLE, 0, 0]}>
          <boxGeometry args={[0.15, 0.4, 0.15]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        <group position={[0, 0.4, 0]}>
          <mesh position={[0, 0.2, 0]} rotation={[FOREARM_ANGLE, 0, 0]}>
            <boxGeometry args={[0.15, 0.4, 0.15]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>
        </group>
      </group>

      {/* Right Arm (overhead, holding bottle) */}
      <group position={[0.55, 1.5, 0]}>
        <mesh position={[0, 0.2, 0]} rotation={[UPPER_ARM_ANGLE, 0, 0]}>
          <boxGeometry args={[0.15, 0.4, 0.15]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        <group position={[0, 0.4, 0]}>
          <mesh position={[0, 0.2, 0]} rotation={[FOREARM_ANGLE, 0, 0]}>
            <boxGeometry args={[0.15, 0.4, 0.15]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>

          {/* Bottle */}
          <mesh position={[0, 0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 0.3, 8]} />
            <meshStandardMaterial color={bottleColor} metalness={0.1} roughness={0.5} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* --- BartenderFemaleDebug --- */
function BartenderFemaleDebug({ position = [0, 0, 0] }: AvatarProps) {
  const skinColor = "#ffe0bd";
  const clothesColor = "#000000";
  const glassColor = "#ffffff";
  const UPPER_ARM_ANGLE = -Math.PI / 2;
  const FOREARM_ANGLE = 0.2;

  return (
    <group position={position}>
      {/* Legs */}
      <mesh position={[-0.15, 0.5, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 1, 12]} />
        <meshStandardMaterial color={clothesColor} />
      </mesh>
      <mesh position={[0.15, 0.5, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 1, 12]} />
        <meshStandardMaterial color={clothesColor} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.7, 1, 0.4]} />
        <meshStandardMaterial color={clothesColor} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>

      {/* Left Arm (holding glass) */}
      <group position={[-0.5, 1.5, 0]}>
        <mesh position={[0, 0.2, 0]} rotation={[UPPER_ARM_ANGLE, 0, 0]}>
          <boxGeometry args={[0.15, 0.4, 0.15]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        <group position={[0, 0.4, 0]}>
          <mesh position={[0, 0.2, 0]} rotation={[FOREARM_ANGLE, 0, 0]}>
            <boxGeometry args={[0.15, 0.4, 0.15]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>

          {/* Glass */}
          <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.08, 0.2, 8]} />
            <meshStandardMaterial
              color={glassColor}
              emissive="#cccccc"
              emissiveIntensity={0.1}
              transparent
              opacity={0.8}
            />
          </mesh>
        </group>
      </group>

      {/* Right Arm (static) */}
      <group position={[0.5, 1.5, 0]}>
        <mesh position={[0, 0.2, 0]} rotation={[UPPER_ARM_ANGLE, 0, 0]}>
          <boxGeometry args={[0.15, 0.4, 0.15]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        <group position={[0, 0.4, 0]}>
          <mesh position={[0, 0.2, 0]} rotation={[FOREARM_ANGLE, 0, 0]}>
            <boxGeometry args={[0.15, 0.4, 0.15]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* --- DJAvatarMixingDebug --- */
function DJAvatarMixingDebug({ position = [15, 1, 14] }: AvatarProps) {
  const skinColor = "#ffe0bd";
  const clothesColor = "#000000";
  const headphoneColor = "#000000";
  const UPPER_ARM_ANGLE = -0.4;
  const BASE_FOREARM_ANGLE = 0.3;
  const rightForearmRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (rightForearmRef.current) {
      rightForearmRef.current.rotation.x =
        BASE_FOREARM_ANGLE + Math.sin(t * 2) * 0.2;
    }
  });

  return (
    <group position={position}>
      {/* Legs */}
      <mesh position={[-0.15, 0.5, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 1, 12]} />
        <meshStandardMaterial color={clothesColor} />
      </mesh>
      <mesh position={[0.15, 0.5, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 1, 12]} />
        <meshStandardMaterial color={clothesColor} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.75, 1, 0.4]} />
        <meshStandardMaterial color={clothesColor} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[0.24, 16, 16]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>

      {/* HEADPHONES */}
      <group position={[0, 2, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.03, 0]}>
          <torusGeometry args={[0.28, 0.04, 12, 24]} />
          <meshStandardMaterial color={headphoneColor} metalness={0.4} roughness={0.2} />
        </mesh>
        <mesh position={[0.25, 0, 0]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color={headphoneColor} metalness={0.4} roughness={0.2} />
        </mesh>
        <mesh position={[-0.25, 0, 0]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color={headphoneColor} metalness={0.4} roughness={0.2} />
        </mesh>
      </group>

      {/* Left Arm (static) */}
      <group position={[-0.45, 1.5, 0]}>
        <mesh position={[0, 0.2, 0]} rotation={[-UPPER_ARM_ANGLE, 0, 0]}>
          <boxGeometry args={[0.13, 0.4, 0.13]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        <group position={[0, 0.4, 0]}>
          <mesh position={[0, 0.2, 0]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.13, 0.4, 0.13]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>
        </group>
      </group>

      {/* Right Arm (mixing motion) */}
      <group position={[0.45, 1.5, 0]}>
        <mesh position={[0, 0.2, 0]} rotation={[-UPPER_ARM_ANGLE, 0, 0]}>
          <boxGeometry args={[0.13, 0.4, 0.13]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        <group position={[0, 0.4, 0]}>
          <mesh
            ref={rightForearmRef}
            position={[0, 0.2, 0]}
            rotation={[BASE_FOREARM_ANGLE, 0, 0]}
          >
            <boxGeometry args={[0.13, 0.4, 0.13]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* --- DancerAvatarDebug --- */
function DancerAvatarDebug({ position = [0, 0, 0], color = "#000000" }: AvatarProps) {
  return (
    <group position={position}>
      <mesh position={[-0.15, 0.5, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 1, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.15, 0.5, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 1, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[0.6, 1, 0.4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 2.3, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.55, 1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.55, 1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

/* ========================= 4) ROTATING SCENE (renamed) ========================= */
function RotatingSceneDebug() {
  const sceneRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (sceneRef.current) {
      sceneRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={sceneRef}>
      <CeilingLightsDebug overheadIntensity={100} />
      <DiscoBallSpotlightDebug
        position={[0, 7, 1]}
        targetPos={[0, 2, 0]}
        intensity={3}
        angle={0.2}
      />
      <FloorPatternDebug />
      <DiscoBallDebug />
      <WallsWithNeonDebug />
      <BarAreaDebug />
      <StageAreaDebug />
      <DJBoothDebug />

      <LaserLightsGroupDebug groupID="left" xRange={[-60, -40]} zRange={[-10, 10]} />
      <LaserLightsGroupDebug groupID="center" xRange={[-10, 10]} zRange={[-10, 10]} />
      <LaserLightsGroupDebug groupID="right" xRange={[40, 60]} zRange={[-10, 10]} />

      <RandomColorStrobeLightDebug position={[0, 5, 5]} frequency={5} maxIntensity={80} />

      {/* Avatars */}
      <BartenderMaleDebug position={[-19, 0, 1]} />
      <BartenderFemaleDebug position={[-19, 0, -1]} />
      <DJAvatarMixingDebug position={[15, 1, 14]} />
      <DancerAvatarDebug position={[0, 0, -10]} />
    </group>
  );
}

/* ========================= 5) CEILING LIGHTS (renamed) ========================= */
function CeilingLightsDebug({ overheadIntensity = 100 }: { overheadIntensity?: number }) {
  const numLights = 30;
  const colorOptions = ["red", "blue", "green", "yellow", "magenta", "cyan"];

  const lights = useMemo(() => {
    const temp: CeilingLightProps[] = [];
    for (let i = 0; i < numLights; i++) {
      const c = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      const x = (Math.random() - 0.5) * 30;
      const z = (Math.random() - 0.5) * 30;
      const speed = 0.5 + Math.random() * 1.5;
      const mode = Math.random() > 0.5 ? "rotate" : "scan";
      temp.push({ color: c, x, z, speed, mode, overheadIntensity });
    }
    return temp;
  }, [overheadIntensity]);

  return (
    <>
      {lights.map((cfg, i) => (
        <SingleOverheadDebug key={i} {...cfg} />
      ))}
    </>
  );
}

function SingleOverheadDebug({
  color,
  x,
  z,
  speed,
  mode,
  overheadIntensity = 100,
}: CeilingLightProps & { overheadIntensity?: number }) {
  const lightRef = useRef<THREE.SpotLight>(null);
  const angleRef = useRef(0);
  const overheadY = 10;

  useFrame((_, delta) => {
    angleRef.current += speed * delta;
    if (!lightRef.current) return;

    if (mode === "rotate") {
      const r = 3;
      const offX = r * Math.cos(angleRef.current);
      const offZ = r * Math.sin(angleRef.current);
      lightRef.current.position.set(x + offX, overheadY, z + offZ);
    } else {
      const sweep = Math.sin(angleRef.current) * 15;
      lightRef.current.position.set(x + sweep, overheadY, z);
    }

    lightRef.current.target.position.set(0, 0, 0);
    lightRef.current.target.updateMatrixWorld();
  });

  return (
    <spotLight
      ref={lightRef}
      color={color}
      intensity={overheadIntensity}
      distance={300}
      angle={1.2}
      penumbra={0.5}
      castShadow={false}
    />
  );
}

/* ========================= 6) FLOOR & DISCO BALL (renamed) ========================= */
function FloorPatternDebug() {
  const checker = useTexture("/textures/checker.jpg");
  checker.wrapS = THREE.RepeatWrapping;
  checker.wrapT = THREE.RepeatWrapping;
  checker.repeat.set(8, 8);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial map={checker} metalness={0.2} roughness={0.3} />
    </mesh>
  );
}

function DiscoBallDebug() {
  const groupRef = useRef<THREE.Group>(null);
  const discoTex = useTexture("/textures/disco_color.jpg");

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, 2, 0]}>
      <mesh castShadow>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial map={discoTex} metalness={1} roughness={0} />
      </mesh>
    </group>
  );
}

/* ========================= 7) WALLS, BAR, STAGE, DJ BOOTH (renamed) ========================= */
function WallsWithNeonDebug() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[35, 35, 10, 32, 1, true]} />
        <meshStandardMaterial
          color="#111"
          side={THREE.DoubleSide}
          metalness={0.2}
          roughness={0.6}
        />
      </mesh>

      <NeonStripDebug y={-2} />
      <NeonStripDebug y={0} />
      <NeonStripDebug y={2} />
    </group>
  );
}

function NeonStripDebug({ y }: { y: number }) {
  return (
    <mesh position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[35, 0.15, 16, 100]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive="#ffffff"
        emissiveIntensity={1}
        metalness={0.1}
        roughness={0.2}
      />
    </mesh>
  );
}

function BarAreaDebug() {
  return (
    <group position={[-20, -1, 0]}>
      <mesh receiveShadow castShadow position={[0, 1, 0]}>
        <boxGeometry args={[4, 2, 10]} />
        <meshStandardMaterial color="#552222" metalness={0.2} roughness={0.4} />
      </mesh>
    </group>
  );
}

function StageAreaDebug() {
  return (
    <group position={[0, 0, -20]}>
      <mesh receiveShadow castShadow position={[0, 0.1, 0]}>
        <boxGeometry args={[10, 0.2, 6]} />
        <meshStandardMaterial color="#444444" metalness={0.2} roughness={0.3} />
      </mesh>
      <mesh receiveShadow castShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[8, 0.2, 4]} />
        <meshStandardMaterial color="#555555" metalness={0.2} roughness={0.3} />
      </mesh>
      <mesh receiveShadow castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[6, 0.2, 3]} />
        <meshStandardMaterial color="#666666" metalness={0.2} roughness={0.3} />
      </mesh>
    </group>
  );
}

function DJBoothDebug() {
  return (
    <group position={[15, 0, 15]}>
      <mesh receiveShadow castShadow position={[0, 1, 0]}>
        <boxGeometry args={[4, 2, 3]} />
        <meshStandardMaterial color="#333366" metalness={0.3} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ========================= 8) LASER LIGHTS GROUP & MOVING LASER (renamed) ========================= */
function LaserLightsGroupDebug({
  groupID,
  xRange,
  zRange,
  apexY = 25,
}: {
  groupID: string;
  xRange: [number, number];
  zRange: [number, number];
  apexY?: number;
}) {
  const numLasers = 20;
  const colorOptions = [
    "#ff00ff",
    "#00ffff",
    "#ff9900",
    "#ff0000",
    "#00ff00",
    "#ffff00",
    "#ff0099",
  ];

  const lasers = useMemo(() => {
    const temp: LaserProps[] = [];
    for (let i = 0; i < numLasers; i++) {
      const c = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      const xRand = xRange[0] + Math.random() * (xRange[1] - xRange[0]);
      const zRand = zRange[0] + Math.random() * (zRange[1] - zRange[0]);
      const speed = 0.5 + Math.random() * 1.5;
      const mode = Math.random() > 0.5 ? "rotate" : "scan";
      temp.push({ color: c, x: xRand, z: zRand, speed, mode, apexY });
    }
    return temp;
  }, [xRange, zRange, apexY]);

  return (
    <>
      {lasers.map((cfg, i) => (
        <MovingLaserDebug key={`${groupID}_${i}`} {...cfg} />
      ))}
    </>
  );
}

function MovingLaserDebug({
  color,
  x,
  z,
  speed,
  mode,
  apexY = 25,
}: LaserProps) {
  const coneRef = useRef<THREE.Mesh>(null);
  const angleRef = useRef<number>(0);

  useFrame((_, delta) => {
    angleRef.current += speed * delta;
    if (!coneRef.current) return;

    let sx = x;
    let sz = z;

    if (mode === "rotate") {
      const localRadius = 4;
      const offX = localRadius * Math.cos(angleRef.current);
      const offZ = localRadius * Math.sin(angleRef.current);
      sx += offX;
      sz += offZ;
    } else {
      const sweep = Math.sin(angleRef.current) * 8;
      sx += sweep;
    }

    const apex = new THREE.Vector3(sx, apexY, sz);
    const base = new THREE.Vector3(0, 0, 0);
    const dir = new THREE.Vector3().subVectors(base, apex);
    const dist = dir.length();
    const midpoint = apex.clone().add(dir.clone().multiplyScalar(0.5));

    const up = new THREE.Vector3(0, 1, 0);
    const look = new THREE.Quaternion();
    look.setFromUnitVectors(up, dir.clone().normalize());

    if (coneRef.current) {
      coneRef.current.position.copy(midpoint);
      coneRef.current.quaternion.copy(look);

      const oldGeo = coneRef.current.geometry as THREE.ConeGeometry;
      if (oldGeo) oldGeo.dispose();

      coneRef.current.geometry = new THREE.ConeGeometry(0.1, dist, 16, 1, false);
    }
  });

  return (
    <mesh ref={coneRef}>
      <coneGeometry args={[0.1, 1, 16, 1, false]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={3}
        side={THREE.DoubleSide}
        transparent
        opacity={0.7}
        metalness={0.1}
        roughness={0.2}
      />
    </mesh>
  );
}

/* ========================= 9) DEBUG PAGE (Default Export) ========================= */
export default function DebugPage() {
  return (
    <main className="h-screen w-screen bg-black text-white flex flex-col">
      {/* Title / Intro */}
      <section className="pt-6 text-center space-y-2">
        <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-cyan-400">
          KRBYLAND (Debug)
        </h1>
        <h2 className="text-2xl font-medium text-cyan-300">
          Gig From Anywhere - Debug Version
        </h2>
      </section>

      {/* Canvas */}
      <section className="flex-1">
        <Canvas shadows className="h-full w-full">
          <ambientLight intensity={0.03} />
          <Environment preset="studio" />
          <OrbitControls />
          <RotatingSceneDebug />
        </Canvas>
      </section>
    </main>
  );
}
