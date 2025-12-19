export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export interface DualPosition {
  treePos: [number, number, number];
  scatterPos: [number, number, number];
  rotation: [number, number, number]; // Random rotation
  scale: number;
}

export interface OrnamentData extends DualPosition {
  id: number;
  color: string;
  speed: number; // For floating animation
  weight: number; // Physics weight: heavier items float less
}