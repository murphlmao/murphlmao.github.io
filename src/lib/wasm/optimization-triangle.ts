/**
 * Optimization Triangle WASM module interface
 * Provides type-safe wrapper for the C++ optimization triangle visualization
 */

import type { EmscriptenModule } from './loader';

export interface TriangleVertices {
  topX: number;
  topY: number;
  leftX: number;
  leftY: number;
  rightX: number;
  rightY: number;
}

export interface TriangleValues {
  performance: number;
  velocity: number;
  adaptability: number;
}

export interface OptimizationTriangleModule {
  init: () => void;
  handleMouseDown: (x: number, y: number) => void;
  handleMouseMove: (x: number, y: number) => void;
  handleMouseUp: () => void;
  getDotX: () => number;
  getDotY: () => number;
  getTriangle: () => TriangleVertices;
  getValues: () => TriangleValues;
}

/**
 * Creates a typed wrapper around the Emscripten module
 */
export function createOptimizationTriangle(module: EmscriptenModule): OptimizationTriangleModule {
  const ccall = module.ccall.bind(module);

  return {
    init: () => ccall('init', null, [], []),

    handleMouseDown: (x: number, y: number) =>
      ccall('handleMouseDown', null, ['number', 'number'], [x, y]),

    handleMouseMove: (x: number, y: number) =>
      ccall('handleMouseMove', null, ['number', 'number'], [x, y]),

    handleMouseUp: () => ccall('handleMouseUp', null, [], []),

    getDotX: () => ccall('getDotX', 'number', [], []) as number,

    getDotY: () => ccall('getDotY', 'number', [], []) as number,

    getTriangle: () => ({
      topX: ccall('getTriangleTopX', 'number', [], []) as number,
      topY: ccall('getTriangleTopY', 'number', [], []) as number,
      leftX: ccall('getTriangleLeftX', 'number', [], []) as number,
      leftY: ccall('getTriangleLeftY', 'number', [], []) as number,
      rightX: ccall('getTriangleRightX', 'number', [], []) as number,
      rightY: ccall('getTriangleRightY', 'number', [], []) as number,
    }),

    getValues: () => ({
      performance: ccall('getPerformance', 'number', [], []) as number,
      velocity: ccall('getVelocity', 'number', [], []) as number,
      adaptability: ccall('getAdaptability', 'number', [], []) as number,
    }),
  };
}

export interface PriorityInfo {
  primary: string;
  secondary: string;
  description: string;
}

/**
 * Calculates priority info from triangle values
 */
export function getPriorityInfo(values: TriangleValues): PriorityInfo {
  const sorted = [
    { name: 'Performance', val: values.performance },
    { name: 'Velocity', val: values.velocity },
    { name: 'Adaptability', val: values.adaptability },
  ].sort((a, b) => b.val - a.val);

  // Check if roughly balanced (all within ~15% of each other)
  const spread = sorted[0].val - sorted[2].val;
  const isBalanced = spread < 0.15;

  if (isBalanced) {
    return {
      primary: 'Balanced',
      secondary: 'All concerns weighted equally',
      description: "The sweet spot. You're avoiding premature optimization while staying adaptable and shipping consistently. This balance is sustainable for most projects.",
    };
  }

  const descriptions: Record<string, string> = {
    'Performance-Velocity': "Optimizing for speed and efficiency. You're building for today's constraints—just make sure they're the right constraints.",
    'Performance-Adaptability': "Balancing performance with future-proofing. You're building robust systems that can evolve.",
    'Velocity-Performance': "Shipping fast with optimization. You're moving quickly with purpose, but watch for technical debt.",
    'Velocity-Adaptability': "Prioritizing speed and flexibility. Great for early-stage iteration, but don't forget to measure.",
    'Adaptability-Performance': "Building flexible, efficient systems. You're architecting for the long term.",
    'Adaptability-Velocity': "Shipping flexible code quickly. You're staying agile—just don't over-abstract too early.",
  };

  const key = `${sorted[0].name}-${sorted[1].name}`;

  return {
    primary: sorted[0].name,
    secondary: `then ${sorted[1].name}, then ${sorted[2].name}`,
    description: descriptions[key] || "Finding your balance.",
  };
}
