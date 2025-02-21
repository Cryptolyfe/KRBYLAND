"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  useTexture
} from "@react-three/drei";
import * as THREE from "three";

/* ==================== TYPE DEFINITIONS ==================== */
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

/** LaserProps => apex overhead => floor center */
interface LaserProps {
  color: string;
  x: number; // apex x
  z: number; // apex z
  speed: number;
  mode: "rotate" | "scan";
  apexY?: number; // default 25
}

/* ==================== MAIN PAGE COMPONENT ==================== */
export default function Page() {
  return (
    <main className="h-screen w-screen bg-black text-white flex flex-col">
      <section className="pt-6 text-center space-y-2">
        <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-cyan-400">
          KRBYLAND
        </h1>
        <h2 className="text-2xl font-medium text-cyan-300">Gig From Anywhere</h2>
      </section>

      <section className="flex-1">
        <Canvas shadows className="h-full w-full">
          <ambientLight intensity={0.02} />
          <Environment preset="studio" />

          {/* Overhead Lights */}
          <CeilingLights />

          {/* 4 rotating floor spots => cast shadows */}
          <FloorSpotlight color="red" />
          <FloorSpotlight color="blue" initialAngle={Math.PI / 2} speed={1.5} />
          <FloorSpotlight color="green" initialAngle={Math.PI} speed={0.8} />
          <FloorSpotlight color="magenta" initialAngle={(3 * Math.PI)/2} speed={1.2} />

          <Floor />
          <DiscoBall />

          <Walls />
          <BarArea />
          <StageArea />
          <DJBooth />

          {/* 
            3 distinct laser groups => 20 lasers each, 
            each group in different overhead region
          */}
          <LaserLightsGroup groupID="left"   xRange={[-60, -40]} zRange={[-10, 10]} />
          <LaserLightsGroup groupID="center" xRange={[-10, 10]}  zRange={[-10, 10]} />
          <LaserLightsGroup groupID="right"  xRange={[40, 60]}   zRange={[-10, 10]} />

          <OrbitControls />
        </Canvas>
      </section>
    </main>
  );
}

/* ==================== 1) Floor => #333 ==================== */
function Floor() {
  return (
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1,0]} receiveShadow>
      <planeGeometry args={[60,60]} />
      <meshStandardMaterial color="#333" metalness={0.2} roughness={0.3}/>
    </mesh>
  );
}

/* ==================== 2) DiscoBall => fast spin ==================== */
function DiscoBall() {
  const groupRef= useRef<THREE.Group>(null);
  const colorMap= useTexture("/textures/disco_color.jpg");

  useFrame(()=>{
    if(groupRef.current){
      groupRef.current.rotation.y += 0.05; // spin faster
    }
  });

  return (
    <group ref={groupRef} position={[0,2,0]}>
      <mesh castShadow>
        <sphereGeometry args={[0.8,32,32]} />
        <meshStandardMaterial map={colorMap} metalness={1} roughness={0}/>
      </mesh>
    </group>
  );
}

/* ==================== 3) Overhead Lights => 50 ==================== */
function CeilingLights(){
  const numLights=50;
  const colorOptions=["red","blue","green","yellow","magenta","cyan","white"];

  const lights= useMemo(()=>{
    const arr: CeilingLightProps[]=[];
    for(let i=0;i<numLights;i++){
      const color= colorOptions[Math.floor(Math.random()* colorOptions.length)];
      const x=(Math.random()-0.5)*30;
      const z=(Math.random()-0.5)*30;
      const speed=0.5 + Math.random()*1.5;
      const mode= Math.random()>0.5? "rotate":"scan";
      arr.push({color,x,z,speed,mode});
    }
    return arr;
  },[numLights]);

  return (
    <>
      {lights.map((cfg,i)=>(<CeilingLight key={i} {...cfg}/>))}
    </>
  );
}
function CeilingLight({ color, x, z, speed, mode }: CeilingLightProps){
  const lightRef= useRef<THREE.SpotLight>(null);
  const angleRef= useRef<number>(0);
  const overheadY=10;

  useFrame((_,delta)=>{
    angleRef.current+= speed*delta;
    if(!lightRef.current) return;

    if(mode==="rotate"){
      const localRadius=3;
      const offsetX= localRadius*Math.cos(angleRef.current);
      const offsetZ= localRadius*Math.sin(angleRef.current);
      lightRef.current.position.set(x+offsetX,overheadY,z+offsetZ);
      lightRef.current.target.position.set(0,0,0);
      lightRef.current.target.updateMatrixWorld();
    } else {
      // scan
      const sweep= Math.sin(angleRef.current)*15;
      lightRef.current.position.set(x+sweep,overheadY,z);
      lightRef.current.target.position.set(0,0,0);
      lightRef.current.target.updateMatrixWorld();
    }
  });

  return(
    <spotLight
      ref={lightRef}
      color={color}
      intensity={15}
      distance={300}
      angle={1.2}
      penumbra={0.5}
      castShadow={false}
    />
  );
}

/* ==================== 4) FloorSpotlight => rotating = shadows ==================== */
function FloorSpotlight({
  color="white",
  initialAngle=0,
  speed=1
}: FloorSpotlightProps){
  const lightRef= useRef<THREE.SpotLight>(null);
  const angleRef= useRef<number>(initialAngle);

  useFrame((_,delta)=>{
    angleRef.current+= speed*delta;
    const radius=6; const height=3;
    const x= radius*Math.cos(angleRef.current);
    const z= radius*Math.sin(angleRef.current);
    if(lightRef.current){
      lightRef.current.position.set(x,height,z);
      lightRef.current.target.position.set(0,0,0);
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

/* ==================== 5) Cylinder walls => #111 w/ neon stripes ==================== */
function Walls(){
  return (
    <group>
      <mesh rotation={[-Math.PI/2,0,0]}>
        <cylinderGeometry args={[35,35,10,32,1,true]}/>
        <meshStandardMaterial
          color="#111"
          side={THREE.DoubleSide}
          metalness={0.2}
          roughness={0.6}
        />
      </mesh>

      <NeonStrip y={-2}/>
      <NeonStrip y={0}/>
      <NeonStrip y={2}/>
    </group>
  );
}
function NeonStrip({y}:{y:number}){
  return (
    <mesh position={[0,y,0]} rotation={[Math.PI/2,0,0]}>
      <torusGeometry args={[35,0.1,16,100]}/>
      <meshStandardMaterial
        color="#00ffcc"
        emissive="#00ffcc"
        emissiveIntensity={1}
        metalness={0.2}
        roughness={0.2}
      />
    </mesh>
  );
}

/* ==================== 6) Bar ==================== */
function BarArea(){
  return(
    <group position={[-20,0,0]}>
      <mesh receiveShadow castShadow position={[0,1,0]}>
        <boxGeometry args={[4,2,10]}/>
        <meshStandardMaterial color="#552222" metalness={0.3} roughness={0.4}/>
      </mesh>

      <mesh receiveShadow castShadow position={[0,2,0]}>
        <boxGeometry args={[4.5,0.2,11]}/>
        <meshStandardMaterial color="#774444" metalness={0.3} roughness={0.3}/>
      </mesh>

      <mesh receiveShadow castShadow position={[1.8,2,0]}>
        <boxGeometry args={[0.2,2,10]}/>
        <meshStandardMaterial color="#442222" metalness={0.2} roughness={0.4}/>
      </mesh>
    </group>
  );
}

/* ==================== 7) Stage => 3 steps ==================== */
function StageArea(){
  return(
    <group position={[0,0,-20]}>
      <mesh receiveShadow castShadow position={[0,0.1,0]}>
        <boxGeometry args={[10,0.2,6]}/>
        <meshStandardMaterial color="#444444" metalness={0.2} roughness={0.3}/>
      </mesh>
      <mesh receiveShadow castShadow position={[0,0.3,0]}>
        <boxGeometry args={[8,0.2,4]}/>
        <meshStandardMaterial color="#555555" metalness={0.2} roughness={0.3}/>
      </mesh>
      <mesh receiveShadow castShadow position={[0,0.5,0]}>
        <boxGeometry args={[6,0.2,3]}/>
        <meshStandardMaterial color="#666666" metalness={0.2} roughness={0.3}/>
      </mesh>
    </group>
  );
}

/* ==================== 8) DJBooth ==================== */
function DJBooth(){
  return(
    <group position={[15,0,15]}>
      <mesh receiveShadow castShadow position={[0,1,0]}>
        <boxGeometry args={[4,2,3]}/>
        <meshStandardMaterial color="#333366" metalness={0.3} roughness={0.3}/>
      </mesh>
      <mesh receiveShadow castShadow position={[0,2,0]}>
        <boxGeometry args={[4.5,0.2,3.5]}/>
        <meshStandardMaterial color="#555588" metalness={0.3} roughness={0.3}/>
      </mesh>
      <mesh receiveShadow castShadow position={[0,1.5,1.75]}>
        <boxGeometry args={[3.5,1,0.1]}/>
        <meshStandardMaterial color="#222255" metalness={0.2} roughness={0.3}/>
      </mesh>
    </group>
  );
}

/* ==================== 9) LaserLightsGroup => spawns 20 lasers in a distinct region ==================== */
function LaserLightsGroup({
  groupID,
  xRange,
  zRange,
  apexY=25
}: {
  groupID: string;
  xRange: [number, number];
  zRange: [number, number];
  apexY?: number;
}) {
  const numLasers = 20;
  const colorOptions = [
    "#ff00ff","#00ffff","#ff9900","#ff0000","#00ff00","#ffff00","#ff0099"
  ];

  const lasers = useMemo(() => {
    const arr: LaserProps[] = [];
    for (let i = 0; i < numLasers; i++) {
      const color =
        colorOptions[Math.floor(Math.random() * colorOptions.length)];
      // pick x in [xRange[0], xRange[1]]
      const xRand = xRange[0] + Math.random()*(xRange[1] - xRange[0]);
      // pick z in [zRange[0], zRange[1]]
      const zRand = zRange[0] + Math.random()*(zRange[1] - zRange[0]);
      const speed = 0.5 + Math.random() * 1.5;
      const mode: "rotate" | "scan" = Math.random() > 0.5 ? "rotate" : "scan";
      arr.push({ color, x: xRand, z: zRand, speed, mode, apexY});
    }
    return arr;
  }, [numLasers, xRange, zRange, apexY]);

  return (
    <>
      {lasers.map((cfg, i) => (
        <MovingLaser key={`${groupID}_${i}`} {...cfg} />
      ))}
    </>
  );
}

/* ==================== 10) Single moving laser => apex => (sx, apexY, sz), base => (0,0,0) ==================== */
function MovingLaser({
  color, x, z, speed, mode, apexY=25
}: LaserProps) {
  const coneRef = useRef<THREE.Mesh>(null);
  const angleRef = useRef<number>(0);

  useFrame((_, delta) => {
    angleRef.current += speed * delta;
    if (!coneRef.current) return;

    let sx = x; 
    let sz = z;

    // revolve or scan
    if (mode === "rotate") {
      const localRadius=4;
      const offsetX= localRadius*Math.cos(angleRef.current);
      const offsetZ= localRadius*Math.sin(angleRef.current);
      sx += offsetX;
      sz += offsetZ;
    } else {
      // scanning
      const sweep= Math.sin(angleRef.current)*8;
      sx += sweep;
    }

    // apex overhead
    const apex = new THREE.Vector3(sx, apexY, sz);
    const base = new THREE.Vector3(0,0,0);

    // direction => base - apex => downward
    const dir = new THREE.Vector3().subVectors(base, apex);
    const dist= dir.length();
    const midpoint= apex.clone().add( dir.clone().multiplyScalar(0.5));

    // orientation => from +Y => downward
    const up= new THREE.Vector3(0,1,0);
    const look= new THREE.Quaternion();
    look.setFromUnitVectors(up, dir.clone().normalize());

    coneRef.current.position.copy(midpoint);
    coneRef.current.quaternion.copy(look);

    // rebuild geometry => apex local y=0 => base local y=+dist
    const oldGeo = coneRef.current.geometry as THREE.ConeGeometry;
    if(oldGeo) oldGeo.dispose();

    // apex radius= 0.1 => slightly visible top, height= dist => all the way to floor
    coneRef.current.geometry = new THREE.ConeGeometry(0.1, dist, 16,1,false);
  });

  return (
    <mesh ref={coneRef}>
      {/* dummy geometry => replaced each frame */}
      <coneGeometry args={[0.1,1,16,1,false]}/>

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
