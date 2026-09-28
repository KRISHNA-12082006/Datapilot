"use client";

import * as React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Line, Sparkles } from "@react-three/drei";
import * as THREE from "three";

type NodeKind = "prompt" | "ai" | "source" | "dataset";

interface NodeDef {
  id: string;
  kind: NodeKind;
  position: [number, number, number];
  size: number;
  color: string;
}

const NODES: NodeDef[] = [
  { id: "prompt", kind: "prompt", position: [-5.6, 0.6, 0], size: 0.34, color: "#8fb8ff" },
  { id: "ai", kind: "ai", position: [-1.8, 0, 0.4], size: 0.72, color: "#8b7bff" },
  { id: "src-1", kind: "source", position: [1.2, 1.9, -0.6], size: 0.26, color: "#2cd696" },
  { id: "src-2", kind: "source", position: [1.6, 0.5, 0.9], size: 0.26, color: "#2cd696" },
  { id: "src-3", kind: "source", position: [1.0, -1.1, 0.2], size: 0.26, color: "#2cd696" },
  { id: "src-4", kind: "source", position: [1.9, -0.4, -1.0], size: 0.26, color: "#2cd696" },
  { id: "src-5", kind: "source", position: [1.3, 1.0, 1.6], size: 0.26, color: "#2cd696" },
  { id: "dataset", kind: "dataset", position: [5.4, 0.2, 0], size: 0.5, color: "#17b6d4" },
];

const EDGES: [string, string][] = [
  ["prompt", "ai"],
  ["ai", "src-1"],
  ["ai", "src-2"],
  ["ai", "src-3"],
  ["ai", "src-4"],
  ["ai", "src-5"],
  ["src-1", "dataset"],
  ["src-2", "dataset"],
  ["src-3", "dataset"],
  ["src-4", "dataset"],
  ["src-5", "dataset"],
];

function findNode(id: string) {
  return NODES.find((n) => n.id === id)!;
}

function Node({ node }: { node: NodeDef }) {
  const ref = React.useRef<THREE.Mesh>(null);
  const isAI = node.kind === "ai";

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    const pulse = isAI ? 1 + Math.sin(t * 1.4) * 0.06 : 1 + Math.sin(t * 2 + node.position[0]) * 0.04;
    ref.current.scale.setScalar(pulse);
    if (isAI) ref.current.rotation.y = t * 0.25;
  });

  return (
    <Float speed={isAI ? 0.6 : 1.2} rotationIntensity={0.15} floatIntensity={isAI ? 0.4 : 0.9}>
      <mesh ref={ref} position={node.position}>
        {isAI ? (
          <icosahedronGeometry args={[node.size, 1]} />
        ) : (
          <sphereGeometry args={[node.size, 24, 24]} />
        )}
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={isAI ? 1.1 : 0.6}
          roughness={0.25}
          metalness={0.3}
          wireframe={isAI}
        />
      </mesh>
      {!isAI && (
        <mesh position={node.position}>
          <sphereGeometry args={[node.size * 1.7, 12, 12]} />
          <meshBasicMaterial color={node.color} transparent opacity={0.06} />
        </mesh>
      )}
    </Float>
  );
}

function Edge({ a, b }: { a: string; b: string }) {
  const from = findNode(a).position;
  const to = findNode(b).position;
  const points = React.useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const mid = start.clone().lerp(end, 0.5).add(new THREE.Vector3(0, 0.3, 0));
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    return curve.getPoints(24);
  }, [from, to]);

  return <Line points={points} color="#3a3f6b" transparent opacity={0.55} lineWidth={1} />;
}

function FlowParticle({ a, b, delay }: { a: string; b: string; delay: number }) {
  const ref = React.useRef<THREE.Mesh>(null);
  const from = React.useMemo(() => new THREE.Vector3(...findNode(a).position), [a]);
  const to = React.useMemo(() => new THREE.Vector3(...findNode(b).position), [b]);
  const mid = React.useMemo(() => from.clone().lerp(to, 0.5).add(new THREE.Vector3(0, 0.3, 0)), [from, to]);
  const curve = React.useMemo(() => new THREE.QuadraticBezierCurve3(from, mid, to), [from, mid, to]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = ((state.clock.getElapsedTime() * 0.25 + delay) % 1 + 1) % 1;
    const p = curve.getPoint(t);
    ref.current.position.copy(p);
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = Math.sin(t * Math.PI);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.045, 8, 8]} />
      <meshBasicMaterial color="#c9c3ff" transparent opacity={0.9} />
    </mesh>
  );
}

function PointerRig({ children }: { children: React.ReactNode }) {
  const group = React.useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const pointer = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    const handler = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", handler);
    return () => window.removeEventListener("pointermove", handler);
  }, []);

  useFrame(() => {
    if (!group.current) return;
    const targetY = pointer.current.x * 0.28;
    const targetX = -pointer.current.y * 0.14;
    group.current.rotation.y += (targetY - group.current.rotation.y) * 0.03;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.03;
  });

  React.useEffect(() => {
    void viewport;
  }, [viewport]);

  return <group ref={group}>{children}</group>;
}

export function DataNetworkScene({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [0, 0.6, 9.2], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[-4, 3, 4]} intensity={40} color="#8b7bff" />
        <pointLight position={[5, -2, 3]} intensity={30} color="#17b6d4" />

        <PointerRig>
          <Sparkles count={50} scale={[12, 6, 6]} size={1.4} speed={0.25} color="#6d5bfa" opacity={0.35} />
          {EDGES.map(([a, b]) => (
            <Edge key={`${a}-${b}`} a={a} b={b} />
          ))}
          {EDGES.map(([a, b], i) => (
            <FlowParticle key={`p-${a}-${b}`} a={a} b={b} delay={i / EDGES.length} />
          ))}
          {NODES.map((n) => (
            <Node key={n.id} node={n} />
          ))}
        </PointerRig>
      </Canvas>
    </div>
  );
}
