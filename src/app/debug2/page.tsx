"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, useTexture } from "@react-three/drei";
import * as THREE from "three";

/* ===================== TYPE DEFINITIONS ===================== */
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

/* 
   ============ RandomColorStrobeLight ============
   Flickers ON half time, OFF half time,
   picks random color each time it flips ON
*/
function RandomColorStrobeLight({
  position = [0, 5, 5],
  frequency = 5,
  maxIntensity = 80,
}: {
  position?: [number, number, number];
  frequency?: number;
  maxIntensity?: number;
}) {
  const lightRef = useRef<THREE.SpotLight>(null);
  const isOnRef = useRef<boolean>(false);

  useFrame(() => {
    const t = performance.now() * 0.001;
    // wave => 0..1
    const strobeValue = (Math.sin(t * frequency * 2 * Math.PI) + 1) / 2;
    const isOn = strobeValue > 0.5;
    const intensity = isOn ? maxIntensity : 0;

    if (lightRef.current) {
      lightRef.current.intensity = intensity;

      // pick random hue each time strobe flips ON
      if (isOn && !isOnRef.current) {
        const hue = Math.random() * 360;
        const color = new THREE.Color(`hsl(${hue}, 100%, 50%)`);
        lightRef.current.color = color;
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

/* 
   ============ DiscoBallSpotlight ============
   Spotlight from above & slightly front => [0,7,1]
   intensity=3, angle=0.2 for narrower beam
*/
function DiscoBallSpotlight({
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
    // always aim at disco ball center
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
      {/* The target object in the scene */}
      <object3D position={targetPos} />
    </>
  );
}

/* ===================== MAIN PAGE COMPONENT ===================== */
export default function Page() {
  return (
    <main className="h-screen w-screen bg-black text-white flex flex-col">
      <section className="pt-6 text-center space-y-2">
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-cyan-400">
          Balanced Scene: Overheads=100, DiscoBallSpot=3
        </h1>
        <h2 className="text-xl sm:text-2xl text-cyan-300">
          No Floor Spots, Random Strobe=80, environment=studio
        </h2>
      </section>

      <section className="flex-1">
        <Canvas shadows className="h-full w-full">
          {/* Slight ambient => 0.03, environment => mild reflections */}
          <ambientLight intensity={0.03} />
          <Environment preset="studio" />
          <OrbitControls />

          <RotatingScene />
        </Canvas>
      </section>
    </main>
  );
}

/* ===================== RotatingScene ===================== */
function RotatingScene() {
  const sceneRef = useRef<THREE.Group>(null);

  // Slowly rotate entire scene
  useFrame(() => {
    if (sceneRef.current) {
      sceneRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={sceneRef}>
      {/* Overheads => overheadIntensity=100 => super bright colored lights */}
      <CeilingLights overheadIntensity={100} />

      {/* No floor spotlights => preventing white circles */}
      {/* Add them if you want colored floor spots at low intensity. */}

      {/* Disco ball spotlight => from above, intensity=3 */}
      <DiscoBallSpotlight position={[0,7,1]} targetPos={[0,2,0]} intensity={3} angle={0.2}/>

      <FloorPattern />
      <DiscoBall />
      <WallsWithNeon />
      <BarArea />
      <StageArea />
      <DJBooth />

      {/* 3 Laser groups => left, center, right */}
      <LaserLightsGroup groupID="left"   xRange={[-60,-40]} zRange={[-10,10]} />
      <LaserLightsGroup groupID="center" xRange={[-10,10]}  zRange={[-10,10]} />
      <LaserLightsGroup groupID="right"  xRange={[40,60]}   zRange={[-10,10]} />

      {/* Random color strobe => 80 */}
      <RandomColorStrobeLight position={[0,5,5]} frequency={5} maxIntensity={80} />
    </group>
  );
}

/* 
   =========== OverheadLights => purely colored array, overheadIntensity=100 
   means very bright 
*/
function CeilingLights({ overheadIntensity=100 }: { overheadIntensity?: number }) {
  const numLights = 30;
  // No "white" => purely colored
  const colorOptions = ["red","blue","green","yellow","magenta","cyan"];

  const lights= useMemo(()=>{
    const arr: CeilingLightProps[]=[];
    for(let i=0; i<numLights; i++){
      const color= colorOptions[Math.floor(Math.random()* colorOptions.length)];
      const x=(Math.random()-0.5)*30;
      const z=(Math.random()-0.5)*30;
      const speed= 0.5+ Math.random()*1.5;
      const mode= Math.random()>0.5? "rotate":"scan";
      arr.push({ color, x, z, speed, mode, overheadIntensity });
    }
    return arr;
  },[]);

  return (
    <>
      {lights.map((cfg,i)=><CeilingLight key={i} {...cfg} />)}
    </>
  );
}
function CeilingLight({
  color, x, z, speed, mode, overheadIntensity=100
}: CeilingLightProps & { overheadIntensity?: number }){
  const lightRef= useRef<THREE.SpotLight>(null);
  const angleRef= useRef<number>(0);
  const overheadY=10;

  useFrame((_, delta)=>{
    angleRef.current += speed*delta;
    if(!lightRef.current) return;

    if(mode==="rotate"){
      // revolve around local radius=3
      const localRadius=3;
      const offX= localRadius*Math.cos(angleRef.current);
      const offZ= localRadius*Math.sin(angleRef.current);
      lightRef.current.position.set(x+offX, overheadY, z+offZ);
    } else {
      // scanning
      const sweep= Math.sin(angleRef.current)*15;
      lightRef.current.position.set(x+sweep, overheadY, z);
    }
    lightRef.current.target.position.set(0,0,0);
    lightRef.current.target.updateMatrixWorld();
  });

  return(
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

/* =========== FloorPattern => checker.jpg =========== */
function FloorPattern(){
  const checker= useTexture("/textures/checker.jpg");
  checker.wrapS= THREE.RepeatWrapping;
  checker.wrapT= THREE.RepeatWrapping;
  checker.repeat.set(8,8);

  return(
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1,0]} receiveShadow>
      <planeGeometry args={[60,60]}/>
      <meshStandardMaterial map={checker} metalness={0.2} roughness={0.3}/>
    </mesh>
  );
}

/* =========== DiscoBall => disco_color.jpg =========== */
function DiscoBall(){
  const groupRef= useRef<THREE.Group>(null);
  const discoTex= useTexture("/textures/disco_color.jpg");

  useFrame(()=>{
    if(groupRef.current){
      // spin disco ball
      groupRef.current.rotation.y += 0.05;
    }
  });

  return(
    <group ref={groupRef} position={[0,2,0]}>
      <mesh castShadow>
        <sphereGeometry args={[0.8,32,32]} />
        <meshStandardMaterial map={discoTex} metalness={1} roughness={0}/>
      </mesh>
    </group>
  );
}

/* =========== Walls w/ neon stripes =========== */
function WallsWithNeon(){
  return(
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
  return(
    <mesh position={[0,y,0]} rotation={[Math.PI/2,0,0]}>
      <torusGeometry args={[35,0.15,16,100]}/>
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

/* =========== Bar, Stage, DJ =========== */
function BarArea(){
  return(
    <group position={[-20,0,0]}>
      <mesh receiveShadow castShadow position={[0,1,0]}>
        <boxGeometry args={[4,2,10]}/>
        <meshStandardMaterial color="#552222" metalness={0.2} roughness={0.4}/>
      </mesh>
    </group>
  );
}
function StageArea(){
  return(
    <group position={[0,0,-20]}>
      <mesh receiveShadow castShadow position={[0,0.1,0]}>
        <boxGeometry args={[10,0.2,6]}/>
        <meshStandardMaterial color="#444" metalness={0.2} roughness={0.3}/>
      </mesh>
    </group>
  );
}
function DJBooth(){
  return(
    <group position={[15,0,15]}>
      <mesh receiveShadow castShadow position={[0,1,0]}>
        <boxGeometry args={[4,2,3]}/>
        <meshStandardMaterial color="#333366" metalness={0.3} roughness={0.3}/>
      </mesh>
    </group>
  );
}

/* =========== LaserLightsGroup => 20 lasers =========== */
function LaserLightsGroup({
  groupID,
  xRange=[-60,-40],
  zRange=[-10,10],
  apexY=25
}: {
  groupID: string;
  xRange?: [number, number];
  zRange?: [number, number];
  apexY?: number;
}){
  const numLasers=20;
  const colorOptions=[
    "#ff00ff","#00ffff","#ff9900","#ff0000","#00ff00","#ffff00","#ff0099"
  ];

  const lasers= React.useMemo(()=>{
    const arr: LaserProps[]=[];
    for(let i=0;i<numLasers;i++){
      const color= colorOptions[Math.floor(Math.random()* colorOptions.length)];
      const xRand= xRange[0]+ Math.random()*(xRange[1]- xRange[0]);
      const zRand= zRange[0]+ Math.random()*(zRange[1]- zRange[0]);
      const speed= 0.5+ Math.random()*1.5;
      const mode= Math.random()>0.5? "rotate":"scan";
      arr.push({ color, x: xRand, z: zRand, speed, mode, apexY});
    }
    return arr;
  },[xRange,zRange,apexY]);

  return(
    <>
      {lasers.map((cfg,i)=>(<MovingLaser key={`${groupID}_${i}`} {...cfg}/>))}
    </>
  );
}
function MovingLaser({
  color, x, z, speed, mode, apexY=25
}: LaserProps){
  const coneRef= useRef<THREE.Mesh>(null);
  const angleRef= useRef<number>(0);

  useFrame((_, delta)=>{
    angleRef.current+= speed*delta;
    if(!coneRef.current) return;

    let sx= x; 
    let sz= z;
    if(mode==="rotate"){
      const localRadius=4;
      const offX= localRadius*Math.cos(angleRef.current);
      const offZ= localRadius*Math.sin(angleRef.current);
      sx+= offX;
      sz+= offZ;
    } else {
      const sweep= Math.sin(angleRef.current)*8;
      sx+= sweep;
    }

    const apex= new THREE.Vector3(sx, apexY, sz);
    const base= new THREE.Vector3(0,0,0);
    const dir= new THREE.Vector3().subVectors(base, apex);
    const dist= dir.length();
    const midpoint= apex.clone().add( dir.clone().multiplyScalar(0.5));

    const up= new THREE.Vector3(0,1,0);
    const look= new THREE.Quaternion();
    look.setFromUnitVectors(up, dir.clone().normalize());

    if(coneRef.current){
      coneRef.current.position.copy(midpoint);
      coneRef.current.quaternion.copy(look);
      const oldGeo= coneRef.current.geometry as THREE.ConeGeometry;
      if(oldGeo) oldGeo.dispose();
      coneRef.current.geometry= new THREE.ConeGeometry(0.1, dist,16,1,false);
    }
  });

  return(
    <mesh ref={coneRef}>
      <coneGeometry args={[0.1,1,16,1,false]}/>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1}
        side={THREE.DoubleSide}
        transparent
        opacity={0.7}
        metalness={0.1}
        roughness={0.2}
      />
    </mesh>
  );
}
