import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, COLORS } from '../constants';
import { generateTreePosition, generateScatterPosition } from '../utils/math';

// Custom Shader for the Foliage
const FoliageMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uMorph: { value: 0 },
    uColorHigh: { value: new THREE.Color(COLORS.goldHigh) },
    // Deep Green Base
    uColorBase: { value: new THREE.Color('#1a5e3a') }, 
  },
  vertexShader: `
    uniform float uTime;
    uniform float uMorph;
    attribute vec3 aTreePos;
    attribute vec3 aScatterPos;
    attribute float aRandom;
    
    varying float vAlpha;
    varying float vSparkle;

    float easeInOutCubic(float x) {
      return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
    }

    void main() {
      float t = easeInOutCubic(uMorph);
      vec3 pos = mix(aScatterPos, aTreePos, t);
      
      float breatheIntensity = mix(0.2, 0.05, t); 
      float breathe = sin(uTime * 1.2 + aRandom * 10.0) * breatheIntensity;
      pos += breathe * normalize(pos);

      float swirlStrength = (1.0 - t) * t * 5.0; 
      float swirlAngle = swirlStrength * (aRandom - 0.5) * 2.0;
      float c = cos(swirlAngle);
      float s = sin(swirlAngle);
      mat2 rot = mat2(c, -s, s, c);
      pos.xz = rot * pos.xz;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      
      // INCREASED SIZE: Keep large size for volume
      float sizeRandom = 90.0 * aRandom + 40.0;
      gl_PointSize = sizeRandom * (1.0 / -mvPosition.z);
      
      vSparkle = sin(uTime * 2.0 + aRandom * 25.0);
      vAlpha = 0.8 + 0.2 * vSparkle;

      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uColorHigh;
    uniform vec3 uColorBase;
    varying float vAlpha;
    varying float vSparkle;

    void main() {
      vec2 center = gl_PointCoord - 0.5;
      float dist = length(center);
      if (dist > 0.5) discard;

      // Core opacity (keeps the center green visible)
      float core = smoothstep(0.5, 0.2, dist);
      
      // Rim Factor: sharply defined at the edge
      float rimFactor = smoothstep(0.35, 0.5, dist);
      
      // 1. Start with Base Green
      vec3 finalColor = uColorBase;
      
      // 2. GLOW LOGIC:
      // To create a "glow", we multiply the gold color by a high intensity value (e.g., 5.0).
      // This pushes the color values above 1.0, which triggers the Bloom effect in post-processing.
      vec3 glowColor = uColorHigh * 4.0; 
      
      // Mix the edge towards this super bright glow color
      // rimFactor * 0.9 makes the very edge almost pure glowing light
      finalColor = mix(finalColor, glowColor, rimFactor * 0.95);
      
      // 3. Sparkle Effect
      // Also make sparkles emit light (glow)
      float sparkleMix = smoothstep(0.0, 1.0, vSparkle) * 0.3;
      finalColor = mix(finalColor, glowColor, sparkleMix);

      gl_FragColor = vec4(finalColor, vAlpha * core);
      
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `
};

interface FoliageProps {
  morphFactor: number;
}

export const Foliage: React.FC<FoliageProps> = ({ morphFactor }) => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  
  const { positions, treePositions, scatterPositions, randoms } = useMemo(() => {
    const count = CONFIG.particleCount;
    const positions = new Float32Array(count * 3);
    const treePositions = new Float32Array(count * 3);
    const scatterPositions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const ratio = i / count;
      const biasedRatio = Math.pow(ratio, 0.8);
      const [tx, ty, tz] = generateTreePosition(biasedRatio);
      
      const jitter = 0.7;
      treePositions[i * 3] = tx + (Math.random() - 0.5) * jitter;
      treePositions[i * 3 + 1] = ty + (Math.random() - 0.5) * jitter;
      treePositions[i * 3 + 2] = tz + (Math.random() - 0.5) * jitter;

      const [sx, sy, sz] = generateScatterPosition();
      scatterPositions[i * 3] = sx;
      scatterPositions[i * 3 + 1] = sy;
      scatterPositions[i * 3 + 2] = sz;

      positions[i * 3] = sx;
      positions[i * 3 + 1] = sy;
      positions[i * 3 + 2] = sz;

      randoms[i] = Math.random();
    }

    return { positions, treePositions, scatterPositions, randoms };
  }, []);

  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      shaderRef.current.uniforms.uMorph.value = morphFactor;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePos"
          count={treePositions.length / 3}
          array={treePositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={scatterPositions.length / 3}
          array={scatterPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={randoms.length}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderRef}
        attach="material"
        args={[FoliageMaterial]}
        transparent={true}
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  );
};