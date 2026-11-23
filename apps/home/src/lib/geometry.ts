import type { Pt } from "./types";

export function polygonAreaCm2(points: Pt[]): number {
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i]!;
    const b = points[(i + 1) % points.length]!;
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum) / 2;
}

export const cm2ToM2 = (cm2: number) => cm2 / 10_000;

export function formatArea(points: Pt[]): string {
  return `${cm2ToM2(polygonAreaCm2(points)).toFixed(1)} m²`;
}

export function formatLength(cm: number): string {
  return `${(cm / 100).toFixed(2)} m`;
}

export function dist(a: Pt, b: Pt): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** Area-weighted centroid, falling back to the vertex average for degenerate shapes. */
export function centroid(points: Pt[]): Pt {
  let a = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < points.length; i++) {
    const p = points[i]!;
    const q = points[(i + 1) % points.length]!;
    const cross = p.x * q.y - q.x * p.y;
    a += cross;
    cx += (p.x + q.x) * cross;
    cy += (p.y + q.y) * cross;
  }
  if (Math.abs(a) < 1e-9) {
    const n = points.length || 1;
    return {
      x: points.reduce((s, p) => s + p.x, 0) / n,
      y: points.reduce((s, p) => s + p.y, 0) / n,
    };
  }
  return { x: cx / (3 * a), y: cy / (3 * a) };
}

export function pointInPolygon(p: Pt, points: Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[i]!;
    const b = points[j]!;
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Walls in a flat are nearly always square to each other. If the segment from
 * `prev` to `p` is within `toleranceDeg` of horizontal or vertical, straighten it.
 */
export function snapOrthogonal(prev: Pt, p: Pt, toleranceDeg = 8): Pt {
  const dx = p.x - prev.x;
  const dy = p.y - prev.y;
  const angle = Math.abs((Math.atan2(dy, dx) * 180) / Math.PI);
  const fromHorizontal = Math.min(angle, 180 - angle);
  if (fromHorizontal <= toleranceDeg) return { x: p.x, y: prev.y };
  if (Math.abs(90 - angle) <= toleranceDeg) return { x: prev.x, y: p.y };
  return p;
}

export function snapToGrid(p: Pt, stepCm: number): Pt {
  return { x: Math.round(p.x / stepCm) * stepCm, y: Math.round(p.y / stepCm) * stepCm };
}

export function scalePoints(points: Pt[], factor: number): Pt[] {
  return points.map((p) => ({ x: p.x * factor, y: p.y * factor }));
}

export function boundsOf(points: Pt[]): { minX: number; minY: number; maxX: number; maxY: number } {
  return {
    minX: Math.min(...points.map((p) => p.x)),
    minY: Math.min(...points.map((p) => p.y)),
    maxX: Math.max(...points.map((p) => p.x)),
    maxY: Math.max(...points.map((p) => p.y)),
  };
}
