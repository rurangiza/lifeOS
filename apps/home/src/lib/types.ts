/** A point on a floor plan, in centimetres from the plan's top-left corner. */
export interface Pt {
  x: number;
  y: number;
}

export interface LatLon {
  lat: number;
  lon: number;
}

export interface HomeLocation extends LatLon {
  label: string;
}

/**
 * One OSM tag test. `value` matches exactly, `regex` matches case-insensitively,
 * and neither means "the key exists".
 */
export interface TagFilter {
  key: string;
  value?: string;
  regex?: string;
}

export interface Category {
  id: string;
  label: string;
  color: string;
  enabled: boolean;
  /** An element belongs to the category if it matches any one filter. */
  filters: TagFilter[];
  /** What a favourite is called, such as "My park" for the Parks category. */
  mineLabel?: string;
  /** Large areas (parks, woods): distance is measured to the edge, not the centre. */
  area?: boolean;
  builtin?: boolean;
}

export interface Place extends LatLon {
  /** OSM id, such as "way/123". */
  id: string;
  categoryId: string;
  name: string;
  /** Straight-line metres from home, to the edge for area categories. */
  distanceM: number;
  address?: string;
}

export interface PlacesCache {
  fetchedAt: string;
  /** Which home, radius and categories these places were fetched for. */
  key: string;
  places: Place[];
}

export interface Floor {
  id: string;
  name: string;
  /** Blob id of the uploaded plan picture. */
  planImageId?: string;
  planImageWidth?: number;
  planImageHeight?: number;
  /** How many real centimetres one pixel of the plan picture covers. */
  cmPerPx: number;
  /** False once the user has measured a known length on the picture. */
  calibrated: boolean;
}

export interface Room {
  id: string;
  floorId: string;
  name: string;
  /** Corners in centimetres, in drawing order. */
  points: Pt[];
  /** Planned wall colour, shown as the room's fill on the plan. */
  paint?: string;
}

export const ITEM_KINDS = ["renovation", "furniture", "lighting"] as const;
export type ItemKind = (typeof ITEM_KINDS)[number];

export const ITEM_STATUSES = ["idea", "planned", "ordered", "done"] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

export interface PlanItem {
  id: string;
  roomId: string;
  title: string;
  kind: ItemKind;
  status: ItemStatus;
  costEur?: number;
  link?: string;
  notes?: string;
  createdAt: string;
}

export interface Photo {
  id: string;
  roomId: string;
  blobId: string;
  caption?: string;
  link?: string;
  createdAt: string;
}

export interface AppState {
  version: 1;
  home: HomeLocation | null;
  radiusM: number;
  categories: Category[];
  /** categoryId → place id the user marked as theirs ("my gym"). */
  mine: Record<string, string>;
  placesCache: PlacesCache | null;
  floors: Floor[];
  rooms: Room[];
  items: PlanItem[];
  photos: Photo[];
}
