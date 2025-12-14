import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface TopicCardProps {
  position: [number, number, number];
  title: string;
  color: string;
  onClick?: () => void;
  delay?: number;
}

function TopicCard({ position, title, color, onClick, delay = 0 }: TopicCardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + delay) * 0.1;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3 + delay) * 0.05;
    }
  });

  const gradientColor = useMemo(() => new THREE.Color(color), [color]);

  return (
    <Float
      speed={2}
      rotationIntensity={0.3}
      floatIntensity={0.5}
      floatingRange={[-0.2, 0.2]}
    >
      <group position={position} onClick={onClick}>
        <RoundedBox
          ref={meshRef}
          args={[2.5, 1.5, 0.15]}
          radius={0.1}
          smoothness={4}
        >
          <meshStandardMaterial
            ref={materialRef}
            color={gradientColor}
            transparent
            opacity={0.85}
            metalness={0.2}
            roughness={0.3}
          />
        </RoundedBox>
        <Text
          position={[0, 0, 0.1]}
          fontSize={0.18}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.2}
          textAlign="center"
        >
          {title.length > 25 ? title.slice(0, 25) + '...' : title}
        </Text>
      </group>
    </Float>
  );
}

function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={200}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#8b5cf6"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

interface FloatingCardsSceneProps {
  articles: Array<{ title: string; pageid: number }>;
  onCardClick: (title: string) => void;
}

function Scene({ articles, onCardClick }: FloatingCardsSceneProps) {
  const colors = ['#8b5cf6', '#06b6d4', '#a855f7', '#3b82f6', '#6366f1', '#14b8a6'];
  
  const positions: [number, number, number][] = useMemo(() => [
    [-3.5, 2, -2],
    [0, 2.5, -1],
    [3.5, 1.8, -2],
    [-2.5, 0, -1],
    [2.5, -0.2, -1.5],
    [-3.8, -2, -2],
    [0.5, -2.2, -1],
    [4, -1.8, -2],
  ], []);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#8b5cf6" />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#06b6d4" />
      <spotLight position={[0, 10, 0]} intensity={0.5} angle={0.3} penumbra={1} />
      
      <ParticleField />
      
      {articles.slice(0, 8).map((article, index) => (
        <TopicCard
          key={article.pageid}
          position={positions[index % positions.length]}
          title={article.title}
          color={colors[index % colors.length]}
          delay={index * 0.5}
          onClick={() => onCardClick(article.title)}
        />
      ))}
    </>
  );
}

export default function FloatingCards({ articles, onCardClick }: FloatingCardsSceneProps) {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Scene articles={articles} onCardClick={onCardClick} />
      </Canvas>
    </div>
  );
}
