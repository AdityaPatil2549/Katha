import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { getParticleBudget } from '@/utils/performance';
import { useSettingsStore } from '@/store';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function useResolvedTheme() {
  const theme = useSettingsStore((s) => s.theme);
  const [prefersDark, setPrefersDark] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : true
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setPrefersDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return theme === 'auto' ? (prefersDark ? 'dark' : 'light') : theme;
}

function useReducedMotionPreference() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

function ParticleField({ count = 3000, isLight = false }: { count?: number; isLight?: boolean }) {
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
        opacity={isLight ? 0.35 : 0.85}
        color={isLight ? '#C5A059' : '#D4AF37'}
        size={isLight ? 0.045 : 0.05}
        sizeAttenuation={true}
        depthWrite={false}
        blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
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
  const resolvedTheme = useResolvedTheme();
  const reducedMotion = useReducedMotionPreference();
  const disableCosmos = useSettingsStore((s) => s.disableCosmos);
  const isLight = resolvedTheme === 'light';
  const fogColor = isLight ? '#FAF9F6' : '#121316';

  if (reducedMotion || disableCosmos) {
    return (
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: 'var(--color-bg-base)' }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: 'var(--color-bg-base)' }}
      aria-hidden="true"
    >
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }} dpr={[1, 1.5]}>
        {/* 3-Layer Lighting Model */}
        <ambientLight intensity={isLight ? 0.55 : 0.2} color={isLight ? '#F2EFE9' : '#121316'} />
        
        {/* Key Light */}
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={isLight ? 0.6 : 1.5} 
          color={isLight ? '#C5A059' : '#DFBA73'}
        />
        
        {/* Rim Light */}
        <pointLight 
          position={[-10, -10, -10]} 
          intensity={isLight ? 0.6 : 2} 
          color={isLight ? '#9B7830' : '#E5C158'} 
          distance={50}
        />
        
        {/* Atmospheric Fog */}
        <fog attach="fog" args={[fogColor, 10, 40]} />

        {/* The Particle Field */}
        <ParticleField count={getParticleBudget()} isLight={isLight} />
        
        {/* Mouse Parallax */}
        <CameraRig />
      </Canvas>
    </div>
  );
}
