"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, useTexture } from "@react-three/drei";
import * as THREE from "three";

/* =================== TYPE DEFINITIONS =================== */
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

/* =================== 1) RANDOM COLOR STROBE =================== */
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
  const isOnRef = useRef(false);

  useFrame(() => {
    const t = performance.now() * 0.001;
    const wave = (Math.sin(t * frequency * 2 * Math.PI) + 1) / 2;
    const isOn = wave > 0.5;
    const intensity = isOn ? maxIntensity : 0;

    if (lightRef.current) {
      lightRef.current.intensity = intensity;
      if (isOn && !isOnRef.current) {
        // random hue
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

/* =================== 2) DISCO BALL SPOT =================== */
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

/* 
   =========================
   3) BARTENDER => arms overhead
       - Base angle: -Math.PI/2 (~-1.57) => 90° overhead
       - small wave amplitude = ±0.1 => ~±6°
   =========================
*/
function BartenderOverhead({
  position = [0, 0, 0],
  color = "#ffcccc",
}: AvatarProps) {
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // wave amplitude = 0.1 => about ±6 degrees
    const wave = Math.sin(t * 2) * 0.1; 

    // arms pointing up => ~ -1.57 => wave offset
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = -Math.PI / 2 + wave;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = -Math.PI / 2 - wave;
    }
  });

  return (
    <group position={position}>
      {/* legs => cylinder */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 1, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* torso => box */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[0.6, 1, 0.4]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* head => sphere */}
      <mesh position={[0, 2.3, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* arms => overhead wave */}
      <mesh ref={leftArmRef} position={[-0.55, 1.5, 0]}>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh ref={rightArmRef} position={[0.55, 1.5, 0]}>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

/* 
   =========================
   4) DJ => with HEADPHONES 
   =========================
*/
function DJAvatar({
  position = [15, 1, 14],
  color = "#ccccff",
}: AvatarProps) {
  const groupRef = useRef<THREE.Group>(null);

  // arms (basic wave or static)
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef= useRef<THREE.Mesh>(null);

  // basic wave on right arm
  useFrame((state)=>{
    const t= state.clock.elapsedTime;
    const wave= Math.sin(t*2)*0.4;
    if(rightArmRef.current){
      rightArmRef.current.rotation.x = -wave;
    }
    // left arm => static or do your multi-joint code
  });

  return (
    <group ref={groupRef} position={position}>
      {/* legs => cylinder */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 1, 12]} />
        <meshStandardMaterial color={color}/>
      </mesh>

      {/* torso => box */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[0.6, 1, 0.4]} />
        <meshStandardMaterial color={color}/>
      </mesh>

      {/* head => sphere */}
      <mesh position={[0,2.3,0]}>
        <sphereGeometry args={[0.25,16,16]} />
        <meshStandardMaterial color={color}/>
      </mesh>

      {/* HEADPHONES => torus headband + 2 small sphere ear cups */}
      <group position={[0,2.3,0]}>
        {/* Headband => small torus => radius=0.28, tube=0.04 */}
        <mesh rotation={[0,0,Math.PI/2]} position={[0,0.05,0]}>
          <torusGeometry args={[0.28,0.04,8,16]}/>
          <meshStandardMaterial color="#222" metalness={0.4} roughness={0.2}/>
        </mesh>
        {/* ear cups => small spheres on sides */}
        <mesh position={[0.25,0,0]}>
          <sphereGeometry args={[0.07,12,12]}/>
          <meshStandardMaterial color="#000" metalness={0.4} roughness={0.2}/>
        </mesh>
        <mesh position={[-0.25,0,0]}>
          <sphereGeometry args={[0.07,12,12]}/>
          <meshStandardMaterial color="#000" metalness={0.4} roughness={0.2}/>
        </mesh>
      </group>

      {/* arms => left => static, right => wave */}
      <mesh ref={leftArmRef} position={[-0.55,1.5,0]}>
        <boxGeometry args={[0.15,0.8,0.15]}/>
        <meshStandardMaterial color={color}/>
      </mesh>
      <mesh ref={rightArmRef} position={[0.55,1.5,0]}>
        <boxGeometry args={[0.15,0.8,0.15]}/>
        <meshStandardMaterial color={color}/>
      </mesh>
    </group>
  );
}

/* ========================= 5) MAIN PAGE ========================= */
export default function Page() {
  return (
    <main className="h-screen w-screen bg-black text-white flex flex-col">
      {/* Title Bar */}
      <section className="pt-6 text-center space-y-2">
        <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-cyan-400">
          KRBYLAND
        </h1>
        <h2 className="text-2xl font-medium text-cyan-300">
          Gig From Anywhere
        </h2>
      </section>

      {/* Canvas */}
      <section className="flex-1">
        <Canvas shadows className="h-full w-full">
          <ambientLight intensity={0.03} />
          <Environment preset="studio" />
          <OrbitControls />

          <RotatingScene />
        </Canvas>
      </section>
    </main>
  );
}

/* ========================= 6) RotatingScene ========================= */
function RotatingScene() {
  const sceneRef = useRef<THREE.Group>(null);

  // Spin entire scene slowly
  useFrame(()=>{
    if(sceneRef.current){
      sceneRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={sceneRef}>
      <CeilingLights overheadIntensity={100}/>
      <DiscoBallSpotlight position={[0,7,1]} targetPos={[0,2,0]} intensity={3} angle={0.2}/>
      <FloorPattern/>
      <DiscoBall/>
      <WallsWithNeon/>
      <BarArea/>
      <StageArea/>
      <DJBooth/>

      <LaserLightsGroup groupID="left"   xRange={[-60,-40]} zRange={[-10,10]} />
      <LaserLightsGroup groupID="center" xRange={[-10,10]}  zRange={[-10,10]} />
      <LaserLightsGroup groupID="right"  xRange={[40,60]}   zRange={[-10,10]} />

      <RandomColorStrobeLight position={[0,5,5]} frequency={5} maxIntensity={80} />

      {/* 2 bartenders => arms overhead => wave => near bar => [-19,0, ±1] */}
      <BartenderOverhead position={[-19,0,1]}  color="#ffcccc"/>
      <BartenderOverhead position={[-19,0,-1]} color="#ccffcc"/>

      {/* 1 DJ => has headphones */}
      <DJAvatar position={[15,1,14]} color="#ccccff"/>
    </group>
  );
}

/* ========================= 7) OverheadLights => purely colored ========================= */
function CeilingLights({ overheadIntensity=100 }: { overheadIntensity?: number }) {
  const numLights=30;
  const colorOptions = ["red","blue","green","yellow","magenta","cyan"];

  const lights = React.useMemo(()=>{
    const temp: CeilingLightProps[] = [];
    for(let i=0; i<numLights;i++){
      const c= colorOptions[Math.floor(Math.random()* colorOptions.length)];
      const x=(Math.random()-0.5)*30;
      const z=(Math.random()-0.5)*30;
      const speed=0.5+ Math.random()*1.5;
      const mode= Math.random()>0.5? "rotate":"scan";
      temp.push({ color:c, x, z, speed, mode, overheadIntensity });
    }
    return temp;
  },[overheadIntensity]);

  return(
    <>
      {lights.map((cfg,i)=>(
        <SingleOverhead key={i} {...cfg} />
      ))}
    </>
  );
}

function SingleOverhead({
  color, x, z, speed, mode, overheadIntensity=100
}: CeilingLightProps & { overheadIntensity?: number }) {
  const lightRef= useRef<THREE.SpotLight>(null);
  const angleRef= useRef(0);
  const overheadY=10;

  useFrame((_, delta)=>{
    angleRef.current += speed*delta;
    if(!lightRef.current)return;

    if(mode==="rotate"){
      const r=3;
      const offX= r*Math.cos(angleRef.current);
      const offZ= r*Math.sin(angleRef.current);
      lightRef.current.position.set(x+offX, overheadY, z+offZ);
    } else {
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

/* ========================= 8) FLOOR & DISCO BALL ========================= */
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

function DiscoBall(){
  const groupRef= useRef<THREE.Group>(null);
  const discoTex= useTexture("/textures/disco_color.jpg");

  useFrame(()=>{
    if(groupRef.current){
      groupRef.current.rotation.y += 0.05;
    }
  });

  return(
    <group ref={groupRef} position={[0,2,0]}>
      <mesh castShadow>
        <sphereGeometry args={[0.8,32,32]}/>
        <meshStandardMaterial map={discoTex} metalness={1} roughness={0}/>
      </mesh>
    </group>
  );
}

/* ========================= 9) WALLS, BAR, STAGE, DJ BOOTH ========================= */
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

/** Bar => lowered => position=[-20,-1,0], so bartenders are fully visible. */
function BarArea(){
  return(
    <group position={[-20,-1,0]}>
      <mesh receiveShadow castShadow position={[0,1,0]}>
        <boxGeometry args={[4,2,10]}/>
        <meshStandardMaterial color="#552222" metalness={0.2} roughness={0.4}/>
      </mesh>
      <mesh receiveShadow castShadow position={[0,1,0]}>
        <boxGeometry args={[4.5,0.2,11]}/>
        <meshStandardMaterial color="#774444" metalness={0.3} roughness={0.3}/>
      </mesh>
      <mesh receiveShadow castShadow position={[1.8,1,0]}>
        <boxGeometry args={[0.2,2,10]}/>
        <meshStandardMaterial color="#442222" metalness={0.2} roughness={0.4}/>
      </mesh>
    </group>
  );
}
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

/* ========================= 10) LASERS => rotating/scanning cones ========================= */
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
}){
  const numLasers=20;
  const colorOptions= ["#ff00ff","#00ffff","#ff9900","#ff0000","#00ff00","#ffff00","#ff0099"];

  const lasers= React.useMemo(()=>{
    const temp: LaserProps[]=[];
    for(let i=0; i<numLasers;i++){
      const c= colorOptions[Math.floor(Math.random()* colorOptions.length)];
      const xRand= xRange[0] + Math.random()*(xRange[1]-xRange[0]);
      const zRand= zRange[0] + Math.random()*(zRange[1]-zRange[0]);
      const speed= 0.5+ Math.random()*1.5;
      const mode= Math.random()>0.5? "rotate":"scan";
      temp.push({ color:c, x: xRand, z: zRand, speed, mode, apexY });
    }
    return temp;
  },[xRange,zRange,apexY]);

  return (
    <>
      {lasers.map((cfg,i)=>(
        <MovingLaser key={`${groupID}_${i}`} {...cfg} />
      ))}
    </>
  );
}

function MovingLaser({
  color, x, z, speed, mode, apexY=25
}: LaserProps){
  const coneRef= useRef<THREE.Mesh>(null);
  const angleRef= useRef<number>(0);

  useFrame((_,delta)=>{
    angleRef.current += speed*delta;
    if(!coneRef.current)return;

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
    const midpoint= apex.clone().add(dir.clone().multiplyScalar(0.5));

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
