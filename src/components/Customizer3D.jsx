import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float } from '@react-three/drei';

const RibbonPetal = ({ color, ...props }) => {
  return (
    <mesh {...props}>
      <coneGeometry args={[0.6, 2, 32]} />
      <meshPhysicalMaterial color={color} roughness={0.1} metalness={0.1} clearcoat={1} transmission={0.1} />
    </mesh>
  );
};

const Customizer3D = ({ colors }) => {
  // Simple heuristic to extract main color from text input
  let baseColor = "#d94060"; // default lume red
  const colorStr = (colors || "").toLowerCase();
  if (colorStr.includes('pink') || colorStr.includes('blush')) baseColor = "#f472b6";
  else if (colorStr.includes('gold') || colorStr.includes('yellow')) baseColor = "#facc15";
  else if (colorStr.includes('white') || colorStr.includes('cream')) baseColor = "#ffffff";
  else if (colorStr.includes('purple') || colorStr.includes('lavender')) baseColor = "#c084fc";
  else if (colorStr.includes('blue')) baseColor = "#60a5fa";
  else if (colorStr.includes('black')) baseColor = "#333333";

  return (
    <div style={{ width: '100%', height: '350px', borderRadius: '16px', background: 'radial-gradient(circle at center, #fdfbfb, #ebedee)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.6)', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05)', marginBottom: '32px' }}>
      <Canvas camera={{ position: [0, 2, 6], fov: 40 }} dpr={[1, 2]}>
        <ambientLight intensity={0.6} />
        <spotLight position={[5, 10, 5]} angle={0.2} penumbra={1} intensity={1.5} />
        <spotLight position={[-5, 5, -5]} angle={0.2} penumbra={1} intensity={0.5} color="#fca5a5" />
        
        <Float speed={2.5} rotationIntensity={0.6} floatIntensity={1.2}>
          <group position={[0, -0.5, 0]}>
            <RibbonPetal color={baseColor} position={[0, 0.5, 0]} rotation={[0, 0, 0]} scale={[0.8, 0.8, 0.8]}/>
            <RibbonPetal color={baseColor} position={[0, 0, 0.5]} rotation={[0.4, 0, 0]} />
            <RibbonPetal color={baseColor} position={[0, 0, -0.5]} rotation={[-0.4, 0, 0]} />
            <RibbonPetal color={baseColor} position={[0.5, 0, 0]} rotation={[0, 0, -0.4]} />
            <RibbonPetal color={baseColor} position={[-0.5, 0, 0]} rotation={[0, 0, 0.4]} />
            <RibbonPetal color={baseColor} position={[0.35, -0.2, 0.35]} rotation={[0.4, 0, -0.4]} />
            <RibbonPetal color={baseColor} position={[-0.35, -0.2, 0.35]} rotation={[0.4, 0, 0.4]} />
            <RibbonPetal color={baseColor} position={[0.35, -0.2, -0.35]} rotation={[-0.4, 0, -0.4]} />
            <RibbonPetal color={baseColor} position={[-0.35, -0.2, -0.35]} rotation={[-0.4, 0, 0.4]} />
          </group>
        </Float>

        <ContactShadows position={[0, -2, 0]} opacity={0.6} scale={10} blur={2.5} far={4} color="#000000" />
        <OrbitControls makeDefault enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1.5} maxPolarAngle={Math.PI / 2 + 0.1}/>
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
};

export default Customizer3D;
