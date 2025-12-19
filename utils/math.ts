import * as THREE from 'three';
import { CONFIG } from '../constants';

export const generateTreePosition = (ratio: number): [number, number, number] => {
  // Cone shape logic
  // ratio goes from 0 (bottom) to 1 (top)
  const y = (ratio * CONFIG.treeHeight) - (CONFIG.treeHeight / 2);
  const radiusAtHeight = CONFIG.treeRadius * (1 - ratio);
  const angle = ratio * 25 * Math.PI; // Spiral
  const x = Math.cos(angle) * radiusAtHeight;
  const z = Math.sin(angle) * radiusAtHeight;
  return [x, y, z];
};

export const generateScatterPosition = (): [number, number, number] => {
  const r = CONFIG.scatterRadius;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos((Math.random() * 2) - 1);
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);
  return [x, y, z];
};

export const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;