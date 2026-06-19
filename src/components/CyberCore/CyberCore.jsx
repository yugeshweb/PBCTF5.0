import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import './CyberCore.css';

/* ─── Lerp utility ─── */
function lerp(a, b, t) {
  return a + (b - a) * t;
}

const KEYFRAMES = [
  { p: 0.0, pos: [2.2, 0, -2], scale: 0.0 },     // Hero: Hidden/Emerging from right
  { p: 0.12, pos: [2.2, 0, 0], scale: 1.2 },    // About: Shifts Right
  { p: 0.25, pos: [-2.2, 0.5, 0], scale: 0.8 }, // Timeline: Shifts Left
  { p: 0.38, pos: [0, 0, -2], scale: 2.2 },     // Categories: Background Center
  { p: 0.5, pos: [0, 0, 1.3], scale: 1.4 },     // Prizes: Zooms Close
  { p: 0.62, pos: [0, 1.2, -1], scale: 1.0 },   // Organizers: Elevated Center
  { p: 0.75, pos: [2.0, -0.5, 0], scale: 0.9 }, // Venue: Shifts Right-Down
  { p: 0.88, pos: [-2.0, 0, -0.5], scale: 1.1 },// FAQ: Shifts Left
  { p: 1.0, pos: [0, 0, -3], scale: 3.0 }       // CTA & Sponsors: Back Center Glow
];

function getInterpolatedState(p) {
  const clampedP = Math.max(0, Math.min(1, p));
  let lower = KEYFRAMES[0];
  let upper = KEYFRAMES[KEYFRAMES.length - 1];

  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (clampedP >= KEYFRAMES[i].p && clampedP <= KEYFRAMES[i + 1].p) {
      lower = KEYFRAMES[i];
      upper = KEYFRAMES[i + 1];
      break;
    }
  }

  const range = upper.p - lower.p;
  const t = range === 0 ? 0 : (clampedP - lower.p) / range;

  const pos = [
    lerp(lower.pos[0], upper.pos[0], t),
    lerp(lower.pos[1], upper.pos[1], t),
    lerp(lower.pos[2], upper.pos[2], t)
  ];

  const scale = lerp(lower.scale, upper.scale, t);

  return { pos, scale };
}

/* ─── Edge Glow Material ─── */
function createEdgeGlowMaterial(color, opacity) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    uniforms: {
      glowColor: { value: new THREE.Color(color) },
      intensity: { value: 1.5 },
      opacity: { value: opacity },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mvPos.xyz);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      uniform float intensity;
      uniform float opacity;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        float fresnel = pow(1.0 - abs(dot(vNormal, vViewDir)), 3.0);
        gl_FragColor = vec4(glowColor * fresnel * intensity, fresnel * opacity);
      }
    `,
  });
}

/* ─── Wireframe Layer ─── */
function WireframeLayer({ geometry, color, opacity, scale = 1, rotationOffset = [0, 0, 0] }) {
  const meshRef = useRef();
  const edgesGeo = useMemo(() => new THREE.EdgesGeometry(geometry, 15), [geometry]);

  return (
    <group scale={scale} rotation={rotationOffset}>
      {/* Solid face - very subtle */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          color="#080808"
          transparent
          opacity={opacity * 0.3}
          metalness={0.9}
          roughness={0.1}
          flatShading
        />
      </mesh>
      {/* Wireframe edges */}
      <lineSegments geometry={edgesGeo}>
        <lineBasicMaterial color={color} transparent opacity={opacity} linewidth={1} />
      </lineSegments>
    </group>
  );
}

/* ─── Core Energy Sphere ─── */
function EnergySphere({ progress, color }) {
  const meshRef = useRef();
  const glowRef = useRef();
  const geo = useMemo(() => new THREE.IcosahedronGeometry(0.3, 2), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const pulse = 1 + Math.sin(t * 3) * 0.08 * progress;
    meshRef.current.scale.setScalar(pulse * (0.3 + progress * 0.7));
    meshRef.current.material.emissiveIntensity = 0.5 + progress * 2;
    if (glowRef.current) {
      glowRef.current.scale.setScalar(pulse * (0.3 + progress * 0.7) * 1.4);
      glowRef.current.material.uniforms.opacity.value = progress * 0.8;
    }
  });

  const glowMat = useMemo(() => createEdgeGlowMaterial(color, 0), [color]);

  return (
    <group>
      <mesh ref={meshRef} geometry={geo}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          transparent
          opacity={0.9}
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>
      <mesh ref={glowRef} geometry={geo} material={glowMat} scale={1.4} />
    </group>
  );
}

/* ─── Main Cyber Core Object ─── */
function CyberCoreObject({ scrollProgress }) {
  const groupRef = useRef();
  const outerRef = useRef();
  const midRef = useRef();
  const innerRef = useRef();

  // Smooth progress for buttery transitions
  const smoothProgress = useRef(0);
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseSmooth = useRef({ x: 0, y: 0 });

  const { viewport } = useThree();
  const isMobile = viewport.width < 8;

  // Geometries - low poly
  const outerGeo = useMemo(() => new THREE.IcosahedronGeometry(1.6, 1), []);
  const midGeo = useMemo(() => new THREE.OctahedronGeometry(1.1, 0), []);
  const innerGeo = useMemo(() => new THREE.TetrahedronGeometry(0.7, 0), []);

  // Mouse tracking for parallax (desktop only)
  useEffect(() => {
    if (isMobile) return;
    const handleMouse = (e) => {
      mouseTarget.current.x = (e.clientX / window.innerWidth - 0.5) * 0.5;
      mouseTarget.current.y = (e.clientY / window.innerHeight - 0.5) * 0.5;
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [isMobile]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const clampedDelta = Math.min(delta, 0.05);

    // Smooth scroll progress
    smoothProgress.current = lerp(smoothProgress.current, scrollProgress.current, clampedDelta * 3);
    const p = smoothProgress.current;

    // Smooth mouse parallax
    mouseSmooth.current.x = lerp(mouseSmooth.current.x, mouseTarget.current.x, clampedDelta * 2);
    mouseSmooth.current.y = lerp(mouseSmooth.current.y, mouseTarget.current.y, clampedDelta * 2);

    // Group translation and scale based on scroll keyframes
    const { pos, scale } = getInterpolatedState(p);
    let targetX = pos[0];
    let targetY = pos[1];
    let targetZ = pos[2];
    let targetS = scale;

    if (isMobile) {
      targetX = 0;
      targetS *= 0.55; // Fit behind panels
    }

    // Apply parallax and idle float on top of target position
    groupRef.current.position.x = targetX + mouseSmooth.current.x * 0.3;
    groupRef.current.position.y = targetY + mouseSmooth.current.y * -0.3 + Math.sin(t * 0.5) * 0.08;
    groupRef.current.position.z = targetZ;

    groupRef.current.scale.setScalar(targetS);

    // Outer shell
    if (outerRef.current) {
      outerRef.current.rotation.y = t * 0.15 + p * Math.PI * 2;
      outerRef.current.rotation.x = Math.sin(t * 0.1) * 0.2 + p * 0.5;

      // Expand on scroll
      const outerScale = 1 + p * 0.3;
      outerRef.current.scale.setScalar(outerScale);

      // Fade outer as it "decrypts"
      const outerOpacity = 1 - p * 0.6;
      outerRef.current.children.forEach((child) => {
        if (child.material && child.material.opacity !== undefined) {
          child.material.opacity = outerOpacity;
        }
      });
    }

    // Mid layer
    if (midRef.current) {
      midRef.current.rotation.y = -t * 0.2 + p * Math.PI * 3;
      midRef.current.rotation.z = t * 0.12;

      const midScale = 0.8 + p * 0.4;
      midRef.current.scale.setScalar(midScale);

      const midOpacity = 0.3 + p * 0.5;
      midRef.current.children.forEach((child) => {
        if (child.material && child.material.opacity !== undefined) {
          child.material.opacity = Math.min(midOpacity, 0.9);
        }
      });
    }

    // Inner layer
    if (innerRef.current) {
      innerRef.current.rotation.y = t * 0.3 + p * Math.PI * 4;
      innerRef.current.rotation.x = -t * 0.15;

      const innerScale = 0.5 + p * 0.5;
      innerRef.current.scale.setScalar(innerScale);
    }
  });

  // Color transitions: green -> gold
  const outerColor = useMemo(() => '#00FF88', []);
  const midColor = useMemo(() => '#00CC6A', []);

  // Compute core color based on scroll
  const CoreWithProgress = () => {
    const colorRef = useRef(new THREE.Color('#00FF88'));
    const greenColor = useMemo(() => new THREE.Color('#00FF88'), []);
    const chartreuseColor = useMemo(() => new THREE.Color('#8CFF00'), []);

    useFrame(() => {
      const p = smoothProgress.current;
      colorRef.current.copy(greenColor).lerp(chartreuseColor, Math.pow(p, 2));
    });

    return <EnergySphere progress={smoothProgress.current} color={colorRef.current} />;
  };

  return (
    <group ref={groupRef}>
      {/* Outer wireframe shell */}
      <group ref={outerRef}>
        <WireframeLayer geometry={outerGeo} color={outerColor} opacity={0.7} />
      </group>

      {/* Mid wireframe layer */}
      <group ref={midRef}>
        <WireframeLayer geometry={midGeo} color={midColor} opacity={0.4} />
      </group>

      {/* Inner wireframe layer */}
      <group ref={innerRef}>
        <WireframeLayer geometry={innerGeo} color="#00AA55" opacity={0.3} />
      </group>

      {/* Energy core */}
      <CoreWithProgress />

      {/* Ambient glow shell */}
      <mesh scale={2.2}>
        <icosahedronGeometry args={[1, 1]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          uniforms={{
            glowColor: { value: new THREE.Color('#00FF88') },
            intensity: { value: 0.6 },
            opacity: { value: 0.12 },
          }}
          vertexShader={`
            varying vec3 vNormal;
            varying vec3 vViewDir;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
              vViewDir = normalize(-mvPos.xyz);
              gl_Position = projectionMatrix * mvPos;
            }
          `}
          fragmentShader={`
            uniform vec3 glowColor;
            uniform float intensity;
            uniform float opacity;
            varying vec3 vNormal;
            varying vec3 vViewDir;
            void main() {
              float fresnel = pow(1.0 - abs(dot(vNormal, vViewDir)), 4.0);
              gl_FragColor = vec4(glowColor * fresnel * intensity, fresnel * opacity);
            }
          `}
        />
      </mesh>
    </group>
  );
}

/* ─── Scene Setup ─── */
function Scene({ scrollProgress }) {
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[5, 5, 5]} intensity={0.4} color="#00FF88" />
      <pointLight position={[-5, -3, 3]} intensity={0.2} color="#8CFF00" />

      <group position={[0, 0, 0]}>
        <CyberCoreObject scrollProgress={scrollProgress} />
      </group>
    </>
  );
}

/* ─── Exported Canvas Wrapper ─── */
export default function CyberCore({ scrollProgress }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div className={`cyber-core-container ${isMobile ? 'cyber-core-container--mobile' : ''}`}>
      <Canvas
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <Scene scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}
