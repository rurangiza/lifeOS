import type { HomeLocation } from "./types";

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
    city?: string;
    district?: string;
    country?: string;
  };
}

export function photonLabel(p: PhotonFeature["properties"]): string {
  const street = [p.street ?? p.name, p.housenumber].filter(Boolean).join(" ");
  const place = [p.postcode, p.district ?? p.city].filter(Boolean).join(" ");
  return [street, place].filter(Boolean).join(", ") || "Unnamed place";
}

/**
 * Photon is OpenStreetMap's open geocoder and allows search-as-you-type,
 * unlike Nominatim. Results are biased towards Brussels.
 */
export async function searchAddress(q: string, signal?: AbortSignal): Promise<HomeLocation[]> {
  const params = new URLSearchParams({ q, limit: "5", lat: "50.85", lon: "4.35" });
  const res = await fetch(`https://photon.komoot.io/api/?${params}`, { signal });
  if (!res.ok) throw new Error(`Address search answered ${res.status}`);
  const json = (await res.json()) as { features: PhotonFeature[] };
  return json.features.map((f) => ({
    lat: f.geometry.coordinates[1],
    lon: f.geometry.coordinates[0],
    label: photonLabel(f.properties),
  }));
}
