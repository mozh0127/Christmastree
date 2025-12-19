import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { TreeState } from '../types';
import { COLORS, CONFIG } from '../constants';
import { Foliage } from './Foliage';
import { InstancedOrnaments } from './Ornaments';
import { Topper } from './Topper';

interface SceneProps {
  treeState: TreeState;
}

// Helper to animate the numeric morph factor
const AnimationController = ({ 
  targetState, 
  onUpdate 
}: { 
  targetState: TreeState; 
  onUpdate: (val: number) => void 
}) => {
  const currentVal = useRef(0);
  
  useFrame((state, delta) => {
    const target = targetState === TreeState.TREE_SHAPE ? 1 : 0;
    // Smooth damp towards target
    // Using simple lerp with delta for independence from frame rate
    const speed = 2.0;
    const diff = target - currentVal.current;
    currentVal.current += diff * speed * delta;
    
    // Clamp almost reached values to avoid infinite tiny math
    if (Math.abs(target - currentVal.current) < 0.001) currentVal.current = target;
    
    onUpdate(currentVal.current);
  });
  
  return null;
};

export const Scene: React.FC<SceneProps> = ({ treeState }) => {
  const [morphFactor, setMorphFactor] = React.useState(0);

  // Common Metallic Palette for ornaments
  const metallicPalette = [COLORS.metallicRed, COLORS.metallicGreen, COLORS.metallicGold];

  return (
    <div className="w-full h-screen">
      <Canvas dpr={[1, 2]} gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping }}>
        <PerspectiveCamera makeDefault position={[0, 2, 25]} fov={45} />
        <OrbitControls 
            enablePan={false} 
            minPolarAngle={Math.PI / 4} 
            maxPolarAngle={Math.PI / 2}
            autoRotate={treeState === TreeState.TREE_SHAPE}
            // Reduced speed significantly to prevent dizziness (0.5 -> 0.15)
            autoRotateSpeed={0.15}
            maxDistance={40}
            minDistance={10}
        />

        {/* Lighting Setup */}
        {/* Increased ambient light to lift shadows and show color */}
        <ambientLight intensity={1.5} color={COLORS.emeraldDark} />
        
        {/* Main Key Light - Warm Gold */}
        <spotLight 
            position={[10, 20, 10]} 
            angle={0.5} 
            penumbra={1} 
            intensity={20} 
            color={COLORS.goldHigh} 
            castShadow 
        />
        
        {/* Fill Light - Warm White (Replaced Blue to prevent greying out reds) */}
        <pointLight position={[-10, 5, -10]} intensity={10} color="#ffeedd" />

        {/* Environment for reflections */}
        <Environment preset="city" />
        
        {/* Background Ambiance */}
        <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={1} />
        
        <Sparkles 
          count={2000}
          scale={40}
          size={6}
          speed={0.4}
          opacity={1.0}
          color={COLORS.goldHigh}
        />

        <Suspense fallback={null}>
          <group position={[0, -1, 0]}>
             <AnimationController targetState={treeState} onUpdate={setMorphFactor} />
             
             {/* The Needle/Leaf System */}
             <Foliage morphFactor={morphFactor} />

             {/* 1. Heavy: Luxury Gift Boxes - Metallic, Smaller, RGBY colors */}
             <InstancedOrnaments 
                type="BOX"
                count={CONFIG.giftCount}
                colors={metallicPalette}
                // Reduced scale to half (was 0.6-0.9)
                scaleRange={[0.3, 0.45]}
                morphFactor={morphFactor}
             />

             {/* 2. Medium: Baubles - Metallic, Smaller, RGBY colors */}
             <InstancedOrnaments 
                type="SPHERE"
                count={CONFIG.ornamentCount}
                colors={metallicPalette}
                // Reduced scale to half (was 0.25-0.45)
                scaleRange={[0.12, 0.22]}
                morphFactor={morphFactor}
             />

             {/* 3. Light: Tiny Lights / Stars */}
             <InstancedOrnaments 
                type="STAR"
                count={CONFIG.lightCount}
                colors={[COLORS.goldHigh, '#fffbea']}
                scaleRange={[0.08, 0.15]}
                morphFactor={morphFactor}
             />

             {/* The Star Topper */}
             <Topper morphFactor={morphFactor} />
          </group>
        </Suspense>

        {/* Cinematic Post Processing */}
        <EffectComposer disableNormalPass>
            <Bloom 
                luminanceThreshold={1.2} 
                mipmapBlur 
                intensity={1.0} 
                radius={0.6}
            />
            <Noise opacity={0.05} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};