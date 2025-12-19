import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS, CONFIG } from '../constants';

interface TopperProps {
  morphFactor: number;
}

export const Topper: React.FC<TopperProps> = ({ morphFactor }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Create a proper 5-pointed star shape
  const starGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 1.2;
    const innerRadius = 0.6;
    
    for (let i = 0; i < points * 2; i++) {
      const r = (i % 2 === 0) ? outerRadius : innerRadius;
      // Start from top (-PI/2 adjustment depends on coord system, standard circle starts at 3 o'clock)
      const a = (i / (points * 2)) * Math.PI * 2 + Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    const extrudeSettings = {
      depth: 0.4,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 3,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center(); // Center the geometry so it rotates nicely
    return geometry;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const t = morphFactor;
    const startY = CONFIG.treeHeight + 10;
    const endY = CONFIG.treeHeight / 2 + 0.8; // Sit slightly higher
    
    groupRef.current.position.y = THREE.MathUtils.lerp(startY, endY, t);
    
    // Scale up effect - Reduced max scale from 0.8 to 0.5 for a smaller look
    const scale = THREE.MathUtils.lerp(0, 0.5, t);
    groupRef.current.scale.setScalar(scale);

    // Continuous rotation
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.8;
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={starGeometry}>
        <meshStandardMaterial 
            color={COLORS.goldHigh} 
            emissive={COLORS.goldMid}
            emissiveIntensity={0.8}
            roughness={0.1}
            metalness={1.0}
            toneMapped={true}
            envMapIntensity={2.0}
        />
      </mesh>
      {/* Central glow for the star - reduced intensity slightly for the smaller size */}
      <pointLight distance={15} intensity={4} color={COLORS.goldHigh} decay={2} />
    </group>
  );
};