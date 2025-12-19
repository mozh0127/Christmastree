import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, COLORS } from '../constants';
import { OrnamentData } from '../types';
import { generateTreePosition, generateScatterPosition, randomRange } from '../utils/math';

interface InstancedOrnamentsProps {
  type: 'SPHERE' | 'BOX' | 'STAR';
  count: number;
  colors: string[];
  scaleRange: [number, number];
  morphFactor: number;
}

export const InstancedOrnaments: React.FC<InstancedOrnamentsProps> = ({ 
  type, 
  count, 
  colors, 
  scaleRange,
  morphFactor 
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const data: OrnamentData[] = useMemo(() => {
    const items: OrnamentData[] = [];
    // Adjust weights
    const baseWeight = type === 'BOX' ? 2.5 : type === 'SPHERE' ? 1.0 : 0.3;

    for (let i = 0; i < count; i++) {
      const ratio = Math.random(); 
      const adjustedRatio = type === 'BOX' ? Math.pow(ratio, 1.5) : ratio; 

      const [tx, ty, tz] = generateTreePosition(adjustedRatio);
      const radiusPush = type === 'STAR' ? 0.9 + Math.random() * 0.2 : 1.1;
      const treePos: [number, number, number] = [
          tx * radiusPush + (Math.random() - 0.5) * 0.5, 
          ty + (Math.random() - 0.5) * 0.5, 
          tz * radiusPush + (Math.random() - 0.5) * 0.5
      ];

      const scatterPos = generateScatterPosition();
      
      items.push({
        id: i,
        treePos,
        scatterPos,
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
        scale: randomRange(scaleRange[0], scaleRange[1]),
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: randomRange(0.5, 1.5),
        weight: baseWeight + (Math.random() * 0.5)
      });
    }
    return items;
  }, [count, colors, scaleRange, type]);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    
    data.forEach((item, i) => {
      meshRef.current!.setColorAt(i, new THREE.Color(item.color));
    });
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [data]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const t = morphFactor; 
    const easedT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; 
    const time = state.clock.elapsedTime;

    data.forEach((item, i) => {
      const x = THREE.MathUtils.lerp(item.scatterPos[0], item.treePos[0], easedT);
      const y = THREE.MathUtils.lerp(item.scatterPos[1], item.treePos[1], easedT);
      const z = THREE.MathUtils.lerp(item.scatterPos[2], item.treePos[2], easedT);

      const scatterInfluence = 1.0 - easedT;
      const floatAmplitude = (1.5 / item.weight) * scatterInfluence; 
      const floatSpeed = item.speed * (1.0 / Math.sqrt(item.weight));

      const floatX = Math.sin(time * floatSpeed + item.id) * floatAmplitude;
      const floatY = Math.cos(time * floatSpeed * 0.8 + item.id) * floatAmplitude;
      const floatZ = Math.sin(time * floatSpeed * 0.5 + item.id) * floatAmplitude * 0.5;

      dummy.position.set(x + floatX, y + floatY, z + floatZ);

      const rotSpeed = floatSpeed * 0.5;
      dummy.rotation.set(
        item.rotation[0] + time * rotSpeed,
        item.rotation[1] + time * rotSpeed,
        item.rotation[2]
      );

      const breathe = type === 'STAR' ? Math.sin(time * 5 + item.id) * 0.2 : 0;
      dummy.scale.setScalar(item.scale * (0.8 + 0.2 * easedT) + breathe);

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Material Config Update
  const isStar = type === 'STAR';
  
  // Use MeshPhysicalMaterial params
  // Reduced metalness for colored ornaments allows the base color to shine through (candy/car paint look)
  const roughness = isStar ? 0.0 : 0.1; 
  const metalness = isStar ? 1.0 : 0.5; 
  
  const emissive = isStar ? COLORS.goldHigh : '#000000';
  const emissiveIntensity = isStar ? 4.0 : 0.0;

  // Reduced envMap intensity slightly since we are relying more on diffuse color now
  const envMapInt = isStar ? 1.0 : 2.0;

  // Clearcoat gives that "lacquered bauble" look (glass over metal)
  const clearcoat = isStar ? 0.0 : 1.0;
  const clearcoatRoughness = 0.0;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      {type === 'SPHERE' && <sphereGeometry args={[1, 64, 64]} />}
      {type === 'BOX' && <boxGeometry args={[1, 1, 1]} />} 
      {type === 'STAR' && <octahedronGeometry args={[1, 0]} />} 
      
      <meshPhysicalMaterial 
        roughness={roughness} 
        metalness={metalness}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        envMapIntensity={envMapInt}
        clearcoat={clearcoat}
        clearcoatRoughness={clearcoatRoughness}
        reflectivity={1.0}
        toneMapped={true} 
      />
    </instancedMesh>
  );
};