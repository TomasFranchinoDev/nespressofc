/**
 * Escudo 3D (se carga en diferido, solo en dispositivos "high").
 * Se construye a partir del MISMO SVG trazado del logo: el borde es un anillo extruido,
 * la placa crema queda hundida y la N sobresale, como un escudo de metal esmaltado.
 * Rotación, escala y barrido de luz se leen de `heroState` (escrito por el scroll del Hero).
 */
import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import crestSvg from '@/assets/crest.svg?raw';
import { heroState } from '@/sections/Hero/state';

const S = 0.0042; // unidades SVG → unidades de escena (~3.4 de ancho)
const CX = 516;
const CY = 483;

function useCrestGeometry() {
  return useMemo(() => {
    const { paths } = new SVGLoader().parse(crestSvg);
    const byId = (id: string) => paths.filter((p) => {
      const node = p.userData?.node as Element | undefined;
      return node?.id === id || (node?.parentNode as Element | null)?.id === id;
    });
    const shapesOf = (id: string) => byId(id).flatMap((p) => SVGLoader.createShapes(p));

    const [outer] = shapesOf('shield-outer');
    const [inner] = shapesOf('shield-inner');
    const ring = outer.clone();
    ring.holes.push(new THREE.Path(inner.getPoints(64)));

    const extrude = (shapes: THREE.Shape | THREE.Shape[], depth: number, bevel = 6) => {
      const g = new THREE.ExtrudeGeometry(shapes, {
        depth, curveSegments: 32, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel * 0.8, bevelSegments: 5,
      });
      g.translate(-CX, -CY, 0);
      g.computeVertexNormals();
      return g;
    };

    return {
      back: extrude(outer, 10, 4),
      ring: extrude(ring, 70, 9),
      plate: extrude(inner, 36, 0),
      letter: extrude(shapesOf('n'), 78, 4),
      swoosh: extrude(shapesOf('swoosh'), 96, 5),
    };
  }, []);
}

function CrestModel() {
  const group = useRef<THREE.Group>(null);
  const sweep = useRef<THREE.PointLight>(null);
  const geo = useCrestGeometry();
  const rotY = useRef(-Math.PI * 1.1);

  useFrame(({ clock }, delta) => {
    const g = group.current;
    if (!g) return;
    const t = clock.elapsedTime;
    const { progress: p, intro, px, py } = heroState;
    const easeIntro = 1 - Math.pow(1 - intro, 3);

    // Entra girando, después la rotación la maneja el scroll (+ un poquito el puntero).
    const target = (1 - easeIntro) * -Math.PI * 1.1 + p * Math.PI * 2.2 + px * 0.35 + Math.sin(t * 0.5) * 0.08;
    rotY.current = THREE.MathUtils.damp(rotY.current, target, 6, delta);
    g.rotation.y = rotY.current;
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -py * 0.2 + Math.sin(t * 0.7) * 0.04, 5, delta);
    g.position.y = Math.sin(t * 0.9) * 0.07;
    const sc = 0.55 + easeIntro * 0.45;
    g.scale.setScalar(sc);

    // Barrido de luz cálida que cruza el escudo a medida que scrolleás.
    if (sweep.current) {
      sweep.current.position.x = -5 + ((p * 3 + t * 0.05) % 1) * 10;
      sweep.current.intensity = 18 * easeIntro;
    }
  });

  return (
    <group ref={group}>
      <group scale={[S, -S, S]} position={[0, 0, -0.2]}>
        {/* Tapa trasera: al girar se ve el dorso de una medalla, no la N espejada. */}
        <mesh geometry={geo.back} position={[0, 0, -8]}>
          <meshPhysicalMaterial color="#24160d" metalness={0.9} roughness={0.35} clearcoat={0.5} />
        </mesh>
        <mesh geometry={geo.ring}>
          <meshPhysicalMaterial color="#3b2415" metalness={0.85} roughness={0.28} clearcoat={0.7} clearcoatRoughness={0.25} />
        </mesh>
        <mesh geometry={geo.plate} position={[0, 0, 6]}>
          <meshPhysicalMaterial color="#e8d5b5" metalness={0.05} roughness={0.45} clearcoat={0.9} clearcoatRoughness={0.18} />
        </mesh>
        <mesh geometry={geo.letter}>
          <meshPhysicalMaterial color="#2a1a0e" metalness={0.75} roughness={0.26} clearcoat={1} clearcoatRoughness={0.1} />
        </mesh>
        <mesh geometry={geo.swoosh}>
          <meshPhysicalMaterial color="#35231a" metalness={0.8} roughness={0.22} clearcoat={1} clearcoatRoughness={0.08} />
        </mesh>
      </group>
      <pointLight ref={sweep} position={[-5, 1.5, 3]} color="#ffb36b" distance={12} decay={1.6} />
    </group>
  );
}

export default function Crest3D({ active }: { active: boolean }) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 8.4], fov: 30 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      aria-hidden
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} color="#fff1dc" />
      <directionalLight position={[-4, -2, -3]} intensity={1.4} color="#ff9a4d" />
      {/* Reflejos de estudio armados con Lightformers: cero descargas de HDR. */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} color="#fff4e0" position={[0, 4, 4]} scale={[10, 1.5, 1]} />
        <Lightformer form="rect" intensity={2} color="#ffb070" position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[8, 1, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#e8d5b5" position={[5, -1, 2]} rotation-y={-Math.PI / 2} scale={[8, 1, 1]} />
        <Lightformer form="ring" intensity={2.5} color="#ffffff" position={[2, 2, 6]} scale={2} />
      </Environment>
      <CrestModel />
    </Canvas>
  );
}
