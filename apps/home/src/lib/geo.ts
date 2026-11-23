import type { LatLon } from "./types";

const EARTH_RADIUS_M = 6_371_008.8;
const rad = (deg: number) => (deg * Math.PI) / 180;

export function distanceM(a: LatLon, b: LatLon): number {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

export interface Bounds {
  minlat: number;
  minlon: number;
  maxlat: number;
  maxlon: number;
}

/** Distance to the nearest point of a bounding box; 0 when inside it. */
export function distanceToBoundsM(p: LatLon, b: Bounds): number {
  const nearest = {
    lat: Math.min(Math.max(p.lat, b.minlat), b.maxlat),
    lon: Math.min(Math.max(p.lon, b.minlon), b.maxlon),
  };
  return distanceM(p, nearest);
}

/**
 * Streets rarely run straight to the door, so straight-line distance is
 * stretched by a detour factor before dividing by an easy walking pace.
 */
export const DETOUR_FACTOR = 1.3;
export const WALK_M_PER_MIN = 80;

export function walkMinutes(straightLineM: number): number {
  return Math.max(1, Math.round((straightLineM * DETOUR_FACTOR) / WALK_M_PER_MIN));
}

/** The straight-line radius reachable in `minutes` of walking. */
export function radiusForMinutes(minutes: number): number {
  return (minutes * WALK_M_PER_MIN) / DETOUR_FACTOR;
}

export function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m / 10) * 10} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

/** A closed ring of [lon, lat] pairs approximating a circle, for map overlays. */
export function circleRing(center: LatLon, radius: number, steps = 64): [number, number][] {
  const ring: [number, number][] = [];
  const latDeg = radius / 111_320;
  const lonDeg = radius / (111_320 * Math.cos(rad(center.lat)));
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * 2 * Math.PI;
    ring.push([center.lon + lonDeg * Math.cos(t), center.lat + latDeg * Math.sin(t)]);
  }
  return ring;
}
