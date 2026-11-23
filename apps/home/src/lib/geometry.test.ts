import { describe, expect, it } from "vitest";
import {
  centroid,
  formatArea,
  pointInPolygon,
  polygonAreaCm2,
  scalePoints,
  snapOrthogonal,
  snapToGrid,
} from "./geometry";

// A 4.30 m × 3.90 m bedroom, and an L-shaped living room.
const bedroom = [
  { x: 0, y: 0 },
  { x: 430, y: 0 },
  { x: 430, y: 390 },
  { x: 0, y: 390 },
];
const lShape = [
  { x: 0, y: 0 },
  { x: 600, y: 0 },
  { x: 600, y: 300 },
  { x: 300, y: 300 },
  { x: 300, y: 500 },
  { x: 0, y: 500 },
];

describe("polygonAreaCm2", () => {
  it("computes rectangles and L shapes", () => {
    expect(polygonAreaCm2(bedroom)).toBe(430 * 390);
    expect(polygonAreaCm2(lShape)).toBe(600 * 300 + 300 * 200);
  });

  it("does not care about winding order", () => {
    expect(polygonAreaCm2([...bedroom].reverse())).toBe(430 * 390);
  });
});

it("formats area in square metres", () => {
  expect(formatArea(bedroom)).toBe("16.8 m²");
});

describe("centroid", () => {
  it("is the middle of a rectangle", () => {
    expect(centroid(bedroom)).toEqual({ x: 215, y: 195 });
  });
});

describe("pointInPolygon", () => {
  it("handles the notch of an L shape", () => {
    expect(pointInPolygon({ x: 100, y: 400 }, lShape)).toBe(true);
    expect(pointInPolygon({ x: 450, y: 400 }, lShape)).toBe(false);
  });
});

describe("snapOrthogonal", () => {
  const prev = { x: 0, y: 0 };

  it("straightens nearly horizontal and vertical walls", () => {
    expect(snapOrthogonal(prev, { x: 400, y: 20 })).toEqual({ x: 400, y: 0 });
    expect(snapOrthogonal(prev, { x: -15, y: 300 })).toEqual({ x: 0, y: 300 });
  });

  it("leaves real diagonals alone", () => {
    expect(snapOrthogonal(prev, { x: 300, y: 300 })).toEqual({ x: 300, y: 300 });
  });
});

it("snaps to a grid", () => {
  expect(snapToGrid({ x: 104, y: 96 }, 10)).toEqual({ x: 100, y: 100 });
});

it("scales points", () => {
  expect(scalePoints([{ x: 10, y: 20 }], 2)).toEqual([{ x: 20, y: 40 }]);
});
