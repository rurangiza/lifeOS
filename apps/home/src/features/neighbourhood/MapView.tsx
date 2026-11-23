import {
  LngLatBounds,
  Map as MLMap,
  Marker,
  NavigationControl,
  setWorkerUrl,
  type GeoJSONSource,
  type MapLayerMouseEvent,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import { useEffect, useRef } from "react";
import { circleRing, radiusForMinutes } from "../../lib/geo";
import type { Category, HomeLocation, LatLon, Place } from "../../lib/types";

// MapLibre looks for its worker next to its own module, which bundling moves.
// Point it at the copy Vite emits instead.
setWorkerUrl(workerUrl);

// OpenFreeMap: OpenStreetMap vector tiles with no API key or usage limit.
const STYLE_LIGHT = "https://tiles.openfreemap.org/styles/positron";
const STYLE_DARK = "https://tiles.openfreemap.org/styles/dark";
export const WALK_RINGS_MIN = [5, 10, 15];

function homeMarkerEl(): HTMLElement {
  const el = document.createElement("div");
  el.setAttribute("aria-label", "Your home. Drag to adjust.");
  el.innerHTML = `<svg width="40" height="48" viewBox="0 0 40 48" aria-hidden="true">
    <path d="M20 47c-1-6-16-16-16-29a16 16 0 0 1 32 0c0 13-15 23-16 29Z" fill="#1e2b2f" stroke="#fff" stroke-width="2"/>
    <path d="M12 20 20 13l8 7v8H12Z" fill="#f1f2ee"/><path d="M18 28v-4h4v4" fill="#b9c4a7"/></svg>`;
  el.style.cursor = "grab";
  return el;
}

function placesGeoJSON(places: Place[], colors: Record<string, string>, mine: Set<string>, selected?: string) {
  return {
    type: "FeatureCollection" as const,
    features: places.map((p) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [p.lon, p.lat] },
      properties: {
        id: p.id,
        color: colors[p.categoryId] ?? "#888",
        mine: mine.has(p.id) ? 1 : 0,
        selected: p.id === selected ? 1 : 0,
      },
    })),
  };
}

function ringsGeoJSON(home: LatLon) {
  return {
    type: "FeatureCollection" as const,
    features: WALK_RINGS_MIN.map((m) => ({
      type: "Feature" as const,
      geometry: { type: "LineString" as const, coordinates: circleRing(home, radiusForMinutes(m)) },
      properties: { minutes: m },
    })),
  };
}

export function MapView({
  home,
  places,
  categories,
  mineIds,
  selectedId,
  onSelect,
  onMoveHome,
}: {
  home: HomeLocation;
  places: Place[];
  categories: Category[];
  mineIds: Set<string>;
  selectedId?: string;
  onSelect: (id: string | undefined) => void;
  onMoveHome: (pos: LatLon) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const readyRef = useRef(false);
  const pendingRef = useRef<(() => void)[]>([]);
  const callbacks = useRef({ onSelect, onMoveHome });
  useEffect(() => {
    callbacks.current = { onSelect, onMoveHome };
  });

  // Sources exist only once the style has loaded; queue updates until then.
  function whenReady(fn: () => void) {
    if (readyRef.current) fn();
    else pendingRef.current.push(fn);
  }

  // Create the map once.
  useEffect(() => {
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const map = new MLMap({
      container: containerRef.current!,
      style: dark ? STYLE_DARK : STYLE_LIGHT,
      center: [home.lon, home.lat],
      zoom: 15,
      attributionControl: { compact: true },
    });
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    const marker = new Marker({ element: homeMarkerEl(), draggable: true, anchor: "bottom" })
      .setLngLat([home.lon, home.lat])
      .addTo(map);
    marker.on("dragend", () => {
      const p = marker.getLngLat();
      callbacks.current.onMoveHome({ lat: p.lat, lon: p.lng });
    });
    markerRef.current = marker;

    map.on("load", () => {
      map.addSource("rings", { type: "geojson", data: ringsGeoJSON(home) });
      map.addLayer({
        id: "rings",
        type: "line",
        source: "rings",
        paint: { "line-color": dark ? "#9aa6ab" : "#1e2b2f", "line-opacity": 0.35, "line-width": 1.5, "line-dasharray": [2, 2] },
      });
      map.addSource("places", { type: "geojson", data: placesGeoJSON([], {}, new Set()) });
      map.addLayer({
        id: "places",
        type: "circle",
        source: "places",
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": ["case", ["==", ["get", "selected"], 1], 10, ["==", ["get", "mine"], 1], 8, 6],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": ["case", ["==", ["get", "selected"], 1], 3, 2],
        },
      });
      map.on("click", "places", (e: MapLayerMouseEvent) => {
        const id = e.features?.[0]?.properties?.id as string | undefined;
        callbacks.current.onSelect(id);
      });
      map.on("mouseenter", "places", () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", "places", () => (map.getCanvas().style.cursor = ""));
      readyRef.current = true;
      for (const fn of pendingRef.current.splice(0)) fn();
    });

    return () => {
      readyRef.current = false;
      map.remove();
      mapRef.current = null;
    };
    // The map is created once; later prop changes are applied by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Home moved (new address or drag): move the pin and rings.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markerRef.current?.setLngLat([home.lon, home.lat]);
    whenReady(() => (map.getSource("rings") as GeoJSONSource | undefined)?.setData(ringsGeoJSON(home)));
  }, [home]);

  // Places, colours, favourites or selection changed.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const colors = Object.fromEntries(categories.map((c) => [c.id, c.color]));
    whenReady(() =>
      (map.getSource("places") as GeoJSONSource | undefined)?.setData(placesGeoJSON(places, colors, mineIds, selectedId)),
    );
  }, [places, categories, mineIds, selectedId]);

  // Frame home with the nearest few places when the set of places changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || places.length === 0) return;
    const bounds = new LngLatBounds([home.lon, home.lat], [home.lon, home.lat]);
    for (const p of places.slice(0, 12)) bounds.extend([p.lon, p.lat]);
    map.fitBounds(bounds, { padding: 56, maxZoom: 16, duration: 0 });
  }, [places, home]);

  // Bring the selected place into view.
  useEffect(() => {
    const map = mapRef.current;
    const p = places.find((x) => x.id === selectedId);
    if (map && p) map.easeTo({ center: [p.lon, p.lat], duration: 400 });
  }, [selectedId, places]);

  return <div ref={containerRef} className="h-full w-full" />;
}
