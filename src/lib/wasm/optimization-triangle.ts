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

// --- Triangle clamping (mirrors the C++ clampToTriangle/projectOntoSegment) ---
// The WASM side only starts a drag when a press lands on the dot or inside
// the triangle. On mobile the tappable area needs to be the whole canvas, so
// we clamp an arbitrary point to the triangle here before handing it to
// handleMouseDown, in the same coordinate space getTriangle() returns.

function signedTriArea(
  x1: number, y1: number, x2: number, y2: number, x3: number, y3: number
): number {
  return (x1 - x3) * (y2 - y3) - (x2 - x3) * (y1 - y3);
}

function isInsideTriangle(px: number, py: number, tri: TriangleVertices): boolean {
  const d1 = signedTriArea(px, py, tri.topX, tri.topY, tri.leftX, tri.leftY);
  const d2 = signedTriArea(px, py, tri.leftX, tri.leftY, tri.rightX, tri.rightY);
  const d3 = signedTriArea(px, py, tri.rightX, tri.rightY, tri.topX, tri.topY);
  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(hasNeg && hasPos);
}

function projectOntoSegment(
  px: number, py: number, ax: number, ay: number, bx: number, by: number
): { x: number; y: number } {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSq = dx * dx + dy * dy;
  if (lengthSq < 0.001) return { x: ax, y: ay };
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSq));
  return { x: ax + t * dx, y: ay + t * dy };
}

/** Clamps a point to the nearest position inside/on the triangle. */
export function clampToTriangle(
  point: { x: number; y: number },
  tri: TriangleVertices
): { x: number; y: number } {
  if (isInsideTriangle(point.x, point.y, tri)) return point;

  const candidates = [
    projectOntoSegment(point.x, point.y, tri.topX, tri.topY, tri.leftX, tri.leftY),
    projectOntoSegment(point.x, point.y, tri.leftX, tri.leftY, tri.rightX, tri.rightY),
    projectOntoSegment(point.x, point.y, tri.rightX, tri.rightY, tri.topX, tri.topY),
  ];

  return candidates.reduce((closest, c) => {
    const dClosest = (closest.x - point.x) ** 2 + (closest.y - point.y) ** 2;
    const dC = (c.x - point.x) ** 2 + (c.y - point.y) ** 2;
    return dC < dClosest ? c : closest;
  });
}
