import { describe, expect, it } from "vitest";
import {
  DEFAULT_CATEGORIES,
  buildQuery,
  cacheKey,
  filterToOverpass,
  matchesFilter,
  parseElements,
  parseTagInput,
  type OverpassElement,
} from "./overpass";

const home = { lat: 50.8807, lon: 4.3283 };

describe("filterToOverpass", () => {
  it("writes exact, regex and key-only filters", () => {
    expect(filterToOverpass({ key: "shop", value: "bakery" })).toBe('["shop"="bakery"]');
    expect(filterToOverpass({ key: "name", regex: "acad" })).toBe('["name"~"acad",i]');
    expect(filterToOverpass({ key: "craft" })).toBe('["craft"]');
  });

  it("escapes quotes so user input cannot break the query", () => {
    expect(filterToOverpass({ key: "name", value: 'say "hi"' })).toBe('["name"="say \\"hi\\""]');
  });
});

describe("buildQuery", () => {
  it("only asks for enabled categories, around home", () => {
    const q = buildQuery(DEFAULT_CATEGORIES, home, 1500);
    expect(q).toContain('nwr["leisure"="fitness_centre"](around:1500,50.880700,4.328300);');
    expect(q).not.toContain("bakery");
    expect(q).toContain("out tags center bb;");
  });

  it("skips filters two categories share", () => {
    const dup = [
      { ...DEFAULT_CATEGORIES[0]!, id: "a" },
      { ...DEFAULT_CATEGORIES[0]!, id: "b" },
    ];
    expect(buildQuery(dup, home, 500).match(/fitness_centre/g)).toHaveLength(1);
  });
});

describe("matchesFilter", () => {
  it("matches music academies by their French name", () => {
    const music = DEFAULT_CATEGORIES.find((c) => c.id === "music")!;
    const tags = { amenity: "school", name: "Académie de Musique de Jette" };
    expect(music.filters.some((f) => matchesFilter(tags, f))).toBe(true);
  });

  it("treats an invalid regex as no match instead of throwing", () => {
    expect(matchesFilter({ name: "x" }, { key: "name", regex: "(" })).toBe(false);
  });
});

describe("parseElements", () => {
  const elements: OverpassElement[] = [
    { type: "node", id: 1, lat: 50.8817, lon: 4.3283, tags: { shop: "supermarket", name: "Delhaize" } },
    {
      type: "way",
      id: 2,
      center: { lat: 50.89, lon: 4.31 },
      bounds: { minlat: 50.875, minlon: 4.305, maxlat: 50.895, maxlon: 4.325 },
      tags: { leisure: "park", name: "Parc Roi Baudouin" },
    },
    { type: "node", id: 3, lat: 50.88, lon: 4.33, tags: { shop: "bakery" } },
    { type: "way", id: 4, tags: { shop: "supermarket" } },
  ];
  const places = parseElements(elements, DEFAULT_CATEGORIES, home);

  it("keeps enabled categories, nearest first, and drops elements without a position", () => {
    expect(places.map((p) => p.id)).toEqual(["node/1", "way/2"]);
  });

  it("measures parks to their edge", () => {
    const park = places.find((p) => p.categoryId === "park")!;
    expect(park.distanceM).toBeLessThan(250);
  });

  it("names unnamed places by category", () => {
    const withBakery = DEFAULT_CATEGORIES.map((c) => (c.id === "bakery" ? { ...c, enabled: true } : c));
    const bakery = parseElements(elements, withBakery, home).find((p) => p.categoryId === "bakery")!;
    expect(bakery.name).toBe("Unnamed bakery");
  });
});

describe("parseTagInput", () => {
  it("reads key=value and bare keys", () => {
    expect(parseTagInput(" amenity = library ")).toEqual({ key: "amenity", value: "library" });
    expect(parseTagInput("craft")).toEqual({ key: "craft" });
  });

  it("rejects keys Overpass would not accept", () => {
    expect(parseTagInput('bad"key=x')).toBeNull();
    expect(parseTagInput("")).toBeNull();
  });
});

describe("cacheKey", () => {
  it("changes when a category is switched on, not when one is reordered", () => {
    const base = cacheKey(DEFAULT_CATEGORIES, home, 1500);
    expect(cacheKey([...DEFAULT_CATEGORIES].reverse(), home, 1500)).toBe(base);
    const more = DEFAULT_CATEGORIES.map((c) => ({ ...c, enabled: true }));
    expect(cacheKey(more, home, 1500)).not.toBe(base);
  });
});
