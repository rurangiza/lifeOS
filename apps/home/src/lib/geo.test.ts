import { describe, expect, it } from "vitest";
import { circleRing, distanceM, distanceToBoundsM, formatDistance, radiusForMinutes, walkMinutes } from "./geo";

// Jette station and the Atomium, about 2.0 km apart.
const jette = { lat: 50.8807, lon: 4.3283 };
const atomium = { lat: 50.8949, lon: 4.3415 };

describe("distanceM", () => {
  it("matches the known distance between two Brussels landmarks", () => {
    expect(distanceM(jette, atomium)).toBeGreaterThan(1750);
    expect(distanceM(jette, atomium)).toBeLessThan(1950);
  });

  it("is zero for the same point", () => {
    expect(distanceM(jette, jette)).toBe(0);
  });
});

describe("distanceToBoundsM", () => {
  const box = { minlat: 50.88, minlon: 4.33, maxlat: 50.89, maxlon: 4.34 };

  it("is zero inside the box", () => {
    expect(distanceToBoundsM({ lat: 50.885, lon: 4.335 }, box)).toBe(0);
  });

  it("measures to the nearest edge, not the centre", () => {
    const p = { lat: 50.885, lon: 4.32 };
    expect(distanceToBoundsM(p, box)).toBeCloseTo(distanceM(p, { lat: 50.885, lon: 4.33 }), 6);
  });
});

describe("walkMinutes", () => {
  it("never says zero minutes", () => {
    expect(walkMinutes(5)).toBe(1);
  });

  it("is the inverse of radiusForMinutes", () => {
    expect(walkMinutes(radiusForMinutes(10))).toBe(10);
  });
});

describe("formatDistance", () => {
  it("rounds metres and switches to km", () => {
    expect(formatDistance(347)).toBe("350 m");
    expect(formatDistance(1530)).toBe("1.5 km");
  });
});

describe("circleRing", () => {
  it("closes the ring and keeps every point at the radius", () => {
    const ring = circleRing(jette, 800, 16);
    expect(ring[0]).toEqual(ring[ring.length - 1]);
    for (const [lon, lat] of ring) expect(distanceM(jette, { lat, lon })).toBeCloseTo(800, -1);
  });
});
