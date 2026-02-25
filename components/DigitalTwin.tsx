'use client';
import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useFactory } from '@/context/FactoryContext';
import type { MachineState } from '@/context/FactoryContext';

type MachineStatus = MachineState['status'];

function statusColor(s: MachineStatus) {
  return s === 'critical' ? '#ef4444' : s === 'warning' ? '#f59e0b' : '#10b981';
}
function statusEmissive(s: MachineStatus) {
  return s === 'critical' ? '#7f1d1d' : s === 'warning' ? '#78350f' : '#064e3b';
}
function statusIntensity(s: MachineStatus) {
  return s === 'critical' ? 1.0 : s === 'warning' ? 0.55 : 0.28;
}

interface MachineMeshProps {
  position: [number, number, number];
  machine: MachineState;
  shape: 'box' | 'cylinder';
  args: [number, number, number];
}

function MachineMesh({ position, machine, shape, args }: MachineMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const col = statusColor(machine.status);
  const emis = statusEmissive(machine.status);
  const inten = statusIntensity(machine.status);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(t * 1.2 + position[0]) * 0.04;
    }
    if (glowRef.current && machine.status === 'critical') {
      const pulse = (Math.sin(t * 5) + 1) / 2;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.04 + pulse * 0.22;
    }
  });

  const geom = shape === 'box'
    ? <boxGeometry args={args} />
    : <cylinderGeometry args={[args[0], args[1], args[2], 32]} />;

  return (
    <group position={position}>
      <mesh ref={meshRef} castShadow receiveShadow>
        {geom}
        <meshStandardMaterial color={col} emissive={emis} emissiveIntensity={inten} metalness={0.65} roughness={0.25} />
      </mesh>
      <mesh ref={glowRef} scale={1.28}>
        {geom}
        <meshBasicMaterial color={col} transparent opacity={machine.status === 'critical' ? 0.12 : 0.04} side={THREE.BackSide} />
      </mesh>
      {/* status indicator orb */}
      <mesh position={[0, (args[2] / 2) + 0.18, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={machine.status === 'critical' ? 2.5 : 1.2} />
      </mesh>
      <pointLight color={col} intensity={machine.status === 'critical' ? 1.8 : machine.status === 'warning' ? 0.9 : 0.45} distance={2.5} decay={2} />
    </group>
  );
}

function Pipes() {
  return (
    <group>
      {[[-1.55, 0.05, 0], [1.55, 0.05, 0]].map((pos, i) => (
        <mesh key={i} position={pos as [number,number,number]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.045, 1.4, 8]} />
          <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.25} />
        </mesh>
      ))}
      {/* vertical steam pipe on boiler */}
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.9, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.25} />
      </mesh>
    </group>
  );
}

function ConveyorBelt() {
  const belt1Ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const mat = belt1Ref.current?.material as THREE.MeshStandardMaterial;
    if (mat?.color) {
      // subtle emissive flicker
    }
  });
  return (
    <group>
      <mesh position={[0, -0.65, 0]} receiveShadow>
        <boxGeometry args={[8.5, 0.07, 0.42]} />
        <meshStandardMaterial color="#1e3a5f" metalness={0.7} roughness={0.4} emissive="#0c1a2e" emissiveIntensity={0.3} />
      </mesh>
      {/* belt rollers */}
      {[-3.6, -1.8, 0, 1.8, 3.6].map((x, i) => (
        <mesh key={i} position={[x, -0.63, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.46, 12]} />
          <meshStandardMaterial color="#1e40af" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function SteamParticles({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null!);
  const count = 28;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 0.35;
      arr[i * 3 + 1] = Math.random() * 1.4 + 0.5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.35;
    }
    return arr;
  }, []);

  useFrame(() => {
    if (!ref.current || !active) return;
    const p = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      p[i * 3 + 1] += 0.006;
      if (p[i * 3 + 1] > 2.2) {
        p[i * 3] = (Math.random() - 0.5) * 0.35;
        p[i * 3 + 1] = 0.5;
        p[i * 3 + 2] = (Math.random() - 0.5) * 0.35;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} position={[0, 1.2, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#94a3b8" size={0.045} transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

function FloorGrid() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.72, 0]} receiveShadow>
        <planeGeometry args={[14, 7]} />
        <meshStandardMaterial color="#0d1a2e" metalness={0.2} roughness={0.9} />
      </mesh>
      {/* grid lines */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={`h${i}`} position={[-3.5 + i, -0.71, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.01, 7]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.06} />
        </mesh>
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={`v${i}`} position={[0, -0.71, -1.5 + i * 0.75]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[14, 0.01]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.06} />
        </mesh>
      ))}
    </>
  );
}

function PackagingSection() {
  const ref1 = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (ref1.current) {
      ref1.current.position.y = -0.12 + Math.sin(clock.getElapsedTime() * 0.8) * 0.02;
    }
  });
  return (
    <group position={[4.0, 0, 0]}>
      <mesh ref={ref1} castShadow>
        <boxGeometry args={[0.75, 0.75, 0.65]} />
        <meshStandardMaterial color="#1e40af" metalness={0.5} roughness={0.4} emissive="#1e3a8a" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0.6, -0.2, 0]} castShadow>
        <boxGeometry args={[0.55, 0.55, 0.55]} />
        <meshStandardMaterial color="#1d4ed8" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* label */}
      <pointLight color="#3b82f6" intensity={0.3} distance={1.5} decay={2} />
    </group>
  );
}

function FactoryScene() {
  const { machines } = useFactory();
  const crusher = machines.find(m => m.id === 'crusher')!;
  const boiler = machines.find(m => m.id === 'boiler')!;
  const centrifuge = machines.find(m => m.id === 'centrifuge')!;

  return (
    <>
      <ambientLight intensity={0.25} color="#1a2a4a" />
      <directionalLight position={[6, 10, 6]} intensity={0.7} color="#ffffff" castShadow shadow-mapSize={[512, 512]} />
      <directionalLight position={[-6, 4, -4]} intensity={0.2} color="#22d3ee" />

      <FloorGrid />
      <ConveyorBelt />
      <Pipes />

      <Float speed={0.6} floatIntensity={0.18} rotationIntensity={0}>
        <MachineMesh position={[-2.5, 0.05, 0]} machine={crusher} shape="box" args={[1.05, 0.98, 0.88]} />
      </Float>

      <Float speed={0.5} floatIntensity={0.14} rotationIntensity={0}>
        <MachineMesh position={[0, 0.15, 0]} machine={boiler} shape="cylinder" args={[0.52, 0.52, 1.55]} />
      </Float>

      <Float speed={0.7} floatIntensity={0.22} rotationIntensity={0}>
        <MachineMesh position={[2.5, 0.05, 0]} machine={centrifuge} shape="cylinder" args={[0.48, 0.48, 1.1]} />
      </Float>

      <PackagingSection />
      <SteamParticles active={boiler.temp > 115} />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.6}
        maxPolarAngle={Math.PI / 2.1}
        minPolarAngle={Math.PI / 5}
      />
      <fog attach="fog" color="#0a1628" near={9} far={20} />
    </>
  );
}

export default function DigitalTwin() {
  const { machines } = useFactory();
  return (
    <div className="w-full h-full relative">
      {/* machine status legend */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 pointer-events-none">
        {machines.map(m => (
          <div key={m.id} className="flex items-center gap-1.5 bg-[#0f172a]/80 px-2 py-0.5 rounded border border-[#1e293b]">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: statusColor(m.status),
                boxShadow: `0 0 6px ${statusColor(m.status)}`,
              }}
            />
            <span className="text-[9px] text-[#94a3b8] terminal-text">{m.name.split(' ')[0].toUpperCase()}</span>
            <span className="text-[9px] terminal-text font-bold" style={{ color: statusColor(m.status) }}>
              {m.status.toUpperCase()}
            </span>
          </div>
        ))}
      </div>

      {/* process flow labels */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-around z-10 px-2 pointer-events-none">
        {['Cane Crusher', 'Steam Boiler', 'Centrifuge', 'Packaging'].map((label) => (
          <span key={label} className="text-[9px] text-[#475569] terminal-text bg-[#0f172a]/80 px-1.5 py-0.5 rounded border border-[#1e293b]/50">
            {label}
          </span>
        ))}
      </div>

      <Canvas
        shadows
        camera={{ position: [0, 3.5, 8], fov: 42 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <FactoryScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
