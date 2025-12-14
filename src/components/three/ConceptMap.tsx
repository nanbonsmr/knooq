import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { WikiSearchResult } from '@/lib/wikipedia';

interface NodeProps {
  position: [number, number, number];
  title: string;
  isCenter?: boolean;
  onClick: () => void;
  color: string;
}

function Node({ position, title, isCenter, onClick, color }: NodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      if (hovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  const nodeColor = useMemo(() => new THREE.Color(color), [color]);
  const size = isCenter ? 0.6 : 0.4;

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <dodecahedronGeometry args={[size, 0]} />
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      
      {/* Glow effect */}
      <mesh scale={1.3}>
        <dodecahedronGeometry args={[size, 0]} />
        <meshBasicMaterial
          color={nodeColor}
          transparent
          opacity={hovered ? 0.3 : 0.1}
        />
      </mesh>

      {/* Label */}
      <Html
        position={[0, size + 0.3, 0]}
        center
        distanceFactor={8}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div
          className={`px-2 py-1 rounded-lg text-center whitespace-nowrap transition-all ${
            hovered ? 'bg-primary/90 scale-110' : 'bg-background/80'
          }`}
          style={{
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            maxWidth: '120px',
          }}
        >
          <span className={`text-xs font-medium ${hovered ? 'text-white' : 'text-foreground'}`}>
            {title.length > 20 ? title.slice(0, 18) + '...' : title}
          </span>
        </div>
      </Html>
    </group>
  );
}

interface ConnectionProps {
  start: [number, number, number];
  end: [number, number, number];
}

function Connection({ start, end }: ConnectionProps) {
  const points = useMemo(() => [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end),
  ], [start, end]);

  return (
    <Line
      points={points}
      color="#8b5cf6"
      lineWidth={1}
      transparent
      opacity={0.4}
    />
  );
}

function ParticleRing() {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(100 * 3);
    for (let i = 0; i < 100; i++) {
      const angle = (i / 100) * Math.PI * 2;
      const radius = 4 + Math.random() * 0.5;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={100}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#06b6d4"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

interface SceneProps {
  centerArticle: string;
  relatedArticles: WikiSearchResult[];
  onNodeClick: (title: string) => void;
}

function Scene({ centerArticle, relatedArticles, onNodeClick }: SceneProps) {
  const { camera } = useThree();
  const colors = ['#8b5cf6', '#06b6d4', '#a855f7', '#3b82f6', '#6366f1', '#14b8a6', '#ec4899', '#f59e0b'];

  // Position nodes in a circle around center
  const nodePositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const count = relatedArticles.length;
    const radius = 2.5;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 0.5;
      positions.push([x, y, z]);
    }
    return positions;
  }, [relatedArticles.length]);

  // Auto-rotate camera
  useFrame((state) => {
    camera.position.x = Math.sin(state.clock.elapsedTime * 0.1) * 6;
    camera.position.z = Math.cos(state.clock.elapsedTime * 0.1) * 6;
    camera.lookAt(0, 0, 0);
  });

  const centerPos: [number, number, number] = [0, 0, 0];

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#8b5cf6" />
      <pointLight position={[-5, -5, -5]} intensity={0.4} color="#06b6d4" />

      <ParticleRing />

      {/* Center node */}
      <Node
        position={centerPos}
        title={centerArticle}
        isCenter
        onClick={() => {}}
        color="#8b5cf6"
      />

      {/* Related nodes */}
      {relatedArticles.map((article, index) => (
        <Node
          key={article.pageid}
          position={nodePositions[index]}
          title={article.title}
          onClick={() => onNodeClick(article.title)}
          color={colors[index % colors.length]}
        />
      ))}

      {/* Connections */}
      {nodePositions.map((pos, index) => (
        <Connection
          key={index}
          start={centerPos}
          end={pos}
        />
      ))}
    </>
  );
}

interface ConceptMapProps {
  centerArticle: string;
  relatedArticles: WikiSearchResult[];
  onNodeClick: (title: string) => void;
}

export default function ConceptMap({ centerArticle, relatedArticles, onNodeClick }: ConceptMapProps) {
  if (relatedArticles.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No related topics found</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 2, 6], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Scene
          centerArticle={centerArticle}
          relatedArticles={relatedArticles}
          onNodeClick={onNodeClick}
        />
      </Canvas>
    </div>
  );
}
