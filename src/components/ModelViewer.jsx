import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";

function Model({
  colliderRadius = 1,
  colliderScaleX = 1,
  colliderScaleY = 1,
  colliderScaleZ = 1,
  setCursor,
  setBloomIntensity
}) {
  const { scene } = useGLTF("/informivist.glb");
  const ref = useRef();
  const velocity = useRef({ x: 0, y: 0, z: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [scale, setScale] = useState(0.175);

  // Apply material once
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshPhysicalMaterial({
          color: "#ffffff",
          metalness: 0.8,
          roughness: 0.2,
          clearcoat: 1,
          clearcoatRoughness: 0.1,
          emissive: new THREE.Color("#ffffff"),
          emissiveIntensity: 0.5,
          transparent: false,
          opacity: 1.0
        });
      }
    });
  }, [scene]);

  // Responsive scaling
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 600) {
        setScale(0.1);   // mobile
      } else if (width < 1200) {
        setScale(0.14);  // tablet
      } else {
        setScale(0.175); // desktop
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();

    ref.current.rotation.x = normalizeAngle(ref.current.rotation.x);
    ref.current.rotation.y = normalizeAngle(ref.current.rotation.y);
    ref.current.rotation.z = normalizeAngle(ref.current.rotation.z);

    if (!isDragging) {
      ref.current.rotation.x += velocity.current.x;
      ref.current.rotation.y += velocity.current.y;
      ref.current.rotation.z += velocity.current.z;

      velocity.current.x *= 0.95;
      velocity.current.y *= 0.95;
      velocity.current.z *= 0.95;
    }

    const targetX = 0;
    const targetY = 0.025 * Math.sin(t);
    const targetZ = 0.025 * Math.cos(t);

    const velocityMagnitude =
      Math.abs(velocity.current.x) +
      Math.abs(velocity.current.y) +
      Math.abs(velocity.current.z);

    const blendStrength = 0.02 + (1 - Math.min(velocityMagnitude * 20, 1)) * 0.08;

    ref.current.rotation.x += (targetX - ref.current.rotation.x) * blendStrength;
    ref.current.rotation.y += (targetY - ref.current.rotation.y) * blendStrength;
    ref.current.rotation.z += (targetZ - ref.current.rotation.z) * blendStrength;

    // Glow + bloom scaling
    const minGlow = 0.5;
    const maxGlow = 3.0;
    const minBloom = 0.0;
    const maxBloom = 1.5;
    const velocityScale = 2;

    const glowFactor = Math.min(velocityMagnitude * velocityScale, 1);
    const newEmissive = minGlow + (maxGlow - minGlow) * glowFactor;
    const newBloom = minBloom + (maxBloom - minBloom) * glowFactor;

    scene.traverse((child) => {
      if (child.isMesh && child.material.emissiveIntensity !== undefined) {
        child.material.emissiveIntensity = newEmissive;
      }
    });

    setBloomIntensity(newBloom);
  });

  const normalizeAngle = (angle) => {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
  };

  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

  const onPointerDown = (e) => {
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
    setIsDragging(true);
    setCursor("grabbing");
    velocity.current.x = 0;
    velocity.current.y = 0;
    velocity.current.z = 0;
  };

  const onPointerUp = (e) => {
    e.stopPropagation();
    e.target.releasePointerCapture(e.pointerId);
    setIsDragging(false);
    setCursor("grab");
  };

  const onPointerMove = (e) => {
    if (isDragging && ref.current) {
      const dx = e.movementY * 0.006;
      const dy = e.movementX * 0.006;

      ref.current.rotation.x += dx;
      ref.current.rotation.y += dy;

      velocity.current.x += dx;
      velocity.current.y += dy;

      velocity.current.x = clamp(velocity.current.x, -0.1, 0.1);
      velocity.current.y = clamp(velocity.current.y, -0.1, 0.1);
    }
  };

  const onPointerOver = () => {
    if (!isDragging) setCursor("grab");
  };

  const onPointerOut = () => {
    if (!isDragging) setCursor("default");
  };

  return (
    <group ref={ref} scale={scale} rotation={[0, 0, 0]}>
      <primitive object={scene} />
      <mesh
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerMove={onPointerMove}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        scale={[colliderScaleX, colliderScaleY, colliderScaleZ]}
      >
        <sphereGeometry args={[colliderRadius, 16, 16]} />
        <meshBasicMaterial color="cyan" transparent opacity={0} />
      </mesh>
    </group>
  );
}

function ModelViewer() {
  const [cursor, setCursor] = useState("default");
  const [bloomIntensity, setBloomIntensity] = useState(0.0);

  return (
    <div style={{ cursor, width: "100vw", height: "100vh", overflow: "hidden" }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
      >
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[10, 10, 10]}
          intensity={4}
          color="#ffffff"
        />

        <Model
          colliderRadius={5}
          colliderScaleX={4.5}
          colliderScaleY={1.2}
          colliderScaleZ={1.5}
          setCursor={setCursor}
          setBloomIntensity={setBloomIntensity}
        />

        <EffectComposer>
          <Bloom
            intensity={bloomIntensity}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.5}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

export default ModelViewer;