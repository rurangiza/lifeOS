import { distanceM, distanceToBoundsM, type Bounds } from "./geo";
import type { Category, LatLon, Place, TagFilter } from "./types";

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "gym",
    mineLabel: "My gym",
    label: "Gym",
    color: "#e0533d",
    enabled: true,
    builtin: true,
    filters: [{ key: "leisure", value: "fitness_centre" }, { key: "sport", value: "fitness" }],
  },
  {
    id: "groceries",
    mineLabel: "My supermarket",
    label: "Groceries",
    color: "#d99a0b",
    enabled: true,
    builtin: true,
    filters: [
      { key: "shop", value: "supermarket" },
      { key: "shop", value: "convenience" },
      { key: "shop", value: "greengrocer" },
    ],
  },
  {
    id: "park",
    mineLabel: "My park",
    label: "Parks",
    color: "#3e8e4f",
    enabled: true,
    builtin: true,
    area: true,
    filters: [{ key: "leisure", value: "park" }, { key: "leisure", value: "nature_reserve" }],
  },
  {
    id: "music",
    mineLabel: "My music academy",
    label: "Music academy",
    color: "#8c3f86",
    enabled: true,
    builtin: true,
    // Belgian music academies are often tagged as plain schools, so the name
    // is checked too, in French and Dutch.
    filters: [
      { key: "amenity", value: "music_school" },
      { key: "name", regex: "acad[ée]mie.*musique|muziekacademie|academie voor muziek" },
    ],
  },
  {
    id: "bakery",
    mineLabel: "My bakery",
    label: "Bakery",
    color: "#a8692a",
    enabled: false,
    builtin: true,
    filters: [{ key: "shop", value: "bakery" }],
  },
  {
    id: "pharmacy",
    mineLabel: "My pharmacy",
    label: "Pharmacy",
    color: "#13938a",
    enabled: false,
    builtin: true,
    filters: [{ key: "amenity", value: "pharmacy" }],
  },
  {
    id: "transit",
    mineLabel: "My stop",
    label: "Tram, metro & train",
    color: "#3557e0",
    enabled: false,
    builtin: true,
    filters: [
      { key: "railway", value: "station" },
      { key: "railway", value: "halt" },
      { key: "railway", value: "tram_stop" },
      { key: "station", value: "subway" },
    ],
  },
];

export function mineLabel(c: Pick<Category, "label" | "mineLabel">): string {
  return c.mineLabel ?? `My ${c.label.toLowerCase()}`;
}

const quote = (s: string) => `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

export function filterToOverpass(f: TagFilter): string {
  if (f.regex !== undefined) return `[${quote(f.key)}~${quote(f.regex)},i]`;
  if (f.value !== undefined) return `[${quote(f.key)}=${quote(f.value)}]`;
  return `[${quote(f.key)}]`;
}

export function buildQuery(categories: Category[], home: LatLon, radiusM: number): string {
  const around = `(around:${Math.round(radiusM)},${home.lat.toFixed(6)},${home.lon.toFixed(6)})`;
  const lines = categories
    .filter((c) => c.enabled)
    .flatMap((c) => c.filters.map((f) => `  nwr${filterToOverpass(f)}${around};`));
  // `center bb` gives a point to pin plus a box to measure big parks against.
  return `[out:json][timeout:25];\n(\n${[...new Set(lines)].join("\n")}\n);\nout tags center bb;`;
}

export function matchesFilter(tags: Record<string, string>, f: TagFilter): boolean {
  const v = tags[f.key];
  if (v === undefined) return false;
  if (f.regex !== undefined) {
    try {
      return new RegExp(f.regex, "i").test(v);
    } catch {
      return false;
    }
  }
  return f.value === undefined || v === f.value;
}

export interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: LatLon;
  bounds?: Bounds;
  tags?: Record<string, string>;
}

function addressOf(tags: Record<string, string>): string | undefined {
  const street = tags["addr:street"];
  if (!street) return undefined;
  return [street, tags["addr:housenumber"]].filter(Boolean).join(" ");
}

/** Turn an Overpass response into places, nearest first, one entry per category match. */
export function parseElements(
  elements: OverpassElement[],
  categories: Category[],
  home: LatLon,
): Place[] {
  const places: Place[] = [];
  for (const el of elements) {
    const tags = el.tags ?? {};
    const pos = el.lat !== undefined && el.lon !== undefined ? { lat: el.lat, lon: el.lon } : el.center;
    if (!pos) continue;
    for (const cat of categories) {
      if (!cat.enabled || !cat.filters.some((f) => matchesFilter(tags, f))) continue;
      const d = cat.area && el.bounds ? distanceToBoundsM(home, el.bounds) : distanceM(home, pos);
      places.push({
        id: `${el.type}/${el.id}`,
        categoryId: cat.id,
        name: tags.name ?? tags.brand ?? `Unnamed ${cat.label.toLowerCase()}`,
        lat: pos.lat,
        lon: pos.lon,
        distanceM: d,
        address: addressOf(tags),
      });
    }
  }
  return places.sort((a, b) => a.distanceM - b.distanceM);
}

/** Changes whenever a refetch is needed: new home, radius, or category set. */
export function cacheKey(categories: Category[], home: LatLon, radiusM: number): string {
  const cats = categories
    .filter((c) => c.enabled)
    .map((c) => `${c.id}:${JSON.stringify(c.filters)}:${c.area ? 1 : 0}`)
    .sort();
  return JSON.stringify([home.lat.toFixed(6), home.lon.toFixed(6), Math.round(radiusM), cats]);
}

export const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

export async function fetchPlaces(
  categories: Category[],
  home: LatLon,
  radiusM: number,
  signal?: AbortSignal,
): Promise<Place[]> {
  const query = buildQuery(categories, home, radiusM);
  let lastError: unknown;
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        body: new URLSearchParams({ data: query }),
        signal,
      });
      if (!res.ok) throw new Error(`Overpass answered ${res.status}`);
      const json = (await res.json()) as { elements: OverpassElement[] };
      return parseElements(json.elements, categories, home);
    } catch (err) {
      if (signal?.aborted) throw err;
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Could not reach OpenStreetMap");
}

/** Parse "amenity=library" or "craft" into a filter, for categories the user adds. */
export function parseTagInput(input: string): TagFilter | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const [key, ...rest] = trimmed.split("=");
  const k = key!.trim();
  if (!/^[a-z0-9_:]+$/i.test(k)) return null;
  const value = rest.join("=").trim();
  return value ? { key: k, value } : { key: k };
}
