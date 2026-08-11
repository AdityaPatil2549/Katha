import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { getParticleBudget } from '@/utils/performance';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function ParticleField({ count = 3000 }) {
  const points = useRef<THREE.Points>(null!);
  
  // Create random positions for particles
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Spread them across a large volume
      p[i * 3] = (Math.random() - 0.5) * 50;     // x
      p[i * 3 + 1] = (Math.random() - 0.5) * 50; // y
      p[i * 3 + 2] = (Math.random() - 0.5) * 50; // z
    }
    return p;
  }, [count]);

  useFrame((state, delta) => {
    if (points.current) {
      // Antigravity slow drift
      points.current.rotation.y += delta * 0.02;
      points.current.rotation.x += delta * 0.01;
      
      // Simulate breathing effect
      points.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.5;
    }
  });

  return (
    <Points ref={points} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#8A2BE2" // Violet accent
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function CameraRig() {
  const { camera } = useThree();
  
  useEffect(() => {
    // ScrollTrigger camera path
    const ctx = gsap.context(() => {
      gsap.to(camera.position, {
        z: 5,     // Fly forward
        y: -2,    // Dip down slightly
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 1, // Smooth scrubbing
        }
      });
    });
    return () => ctx.revert();
  }, [camera]);
  
  useFrame((state) => {
    // Subtle mouse parallax effect added on top of scroll position
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, (state.pointer.x * 2), 0.05);
    camera.lookAt(0, 0, 0);
  });
  
  return null;
}

export function KathaCosmos() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: 'var(--color-bg-base)' }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }} dpr={[1, 2]}>
        {/* 3-Layer Lighting Model */}
        {/* 1. Ambient Light (Void baseline) */}
        <ambientLight intensity={0.2} color="#0A0A0F" />
        
        {/* 2. Key Light (Violet) */}
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1.5} 
          color="#8A2BE2"
        />
        
        {/* 3. Rim Light (Cyan) */}
        <pointLight 
          position={[-10, -10, -10]} 
          intensity={2} 
          color="#00F2FE" 
          distance={50}
        />
        
        {/* Deep Space Fog */}
        <fog attach="fog" args={['#000000', 10, 40]} />

        {/* The Particle Field */}
        <ParticleField count={getParticleBudget()} />
        
        {/* Mouse Parallax */}
        <CameraRig />
      </Canvas>
    </div>
  );
}
