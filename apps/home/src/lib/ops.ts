/**
 * Pure state transitions. Components call them through `update()`, and the
 * tests call them directly.
 */
import { scalePoints } from "./geometry";
import { newId } from "./id";
import type { AppState, Category, Floor, HomeLocation, PlanItem, Photo, Pt, Room } from "./types";

export function setHome(s: AppState, home: HomeLocation): AppState {
  // Places were measured from the old address, so they no longer apply.
  return { ...s, home, placesCache: null, mine: {} };
}

/** Nudge the pin without losing favourites; distances are refetched. */
export function moveHomePin(s: AppState, pos: { lat: number; lon: number }): AppState {
  if (!s.home) return s;
  return { ...s, home: { ...s.home, ...pos }, placesCache: null };
}

export function setCategoryEnabled(s: AppState, id: string, enabled: boolean): AppState {
  return { ...s, categories: s.categories.map((c) => (c.id === id ? { ...c, enabled } : c)) };
}

export function addCategory(s: AppState, cat: Omit<Category, "id">): AppState {
  return { ...s, categories: [...s.categories, { ...cat, id: newId() }] };
}

export function removeCategory(s: AppState, id: string): AppState {
  const mine = { ...s.mine };
  delete mine[id];
  return { ...s, categories: s.categories.filter((c) => c.id !== id), mine };
}

export function toggleMine(s: AppState, categoryId: string, placeId: string): AppState {
  const mine = { ...s.mine };
  if (mine[categoryId] === placeId) delete mine[categoryId];
  else mine[categoryId] = placeId;
  return { ...s, mine };
}

// ------------------------------------------------------------------ floors

/** Default scale for an uncalibrated picture: assume it spans a 12 m flat. */
export const ASSUMED_PLAN_WIDTH_CM = 1200;

export function addFloor(s: AppState, name: string): { state: AppState; floor: Floor } {
  const floor: Floor = { id: newId(), name, cmPerPx: 1, calibrated: false };
  return { state: { ...s, floors: [...s.floors, floor] }, floor };
}

export function renameFloor(s: AppState, id: string, name: string): AppState {
  return { ...s, floors: s.floors.map((f) => (f.id === id ? { ...f, name } : f)) };
}

/** Removes the floor with its rooms, their items and photos. Returns blob ids to delete. */
export function deleteFloor(s: AppState, id: string): { state: AppState; orphanBlobs: string[] } {
  const floor = s.floors.find((f) => f.id === id);
  const roomIds = new Set(s.rooms.filter((r) => r.floorId === id).map((r) => r.id));
  const photos = s.photos.filter((p) => roomIds.has(p.roomId));
  return {
    state: {
      ...s,
      floors: s.floors.filter((f) => f.id !== id),
      rooms: s.rooms.filter((r) => !roomIds.has(r.id)),
      items: s.items.filter((i) => !roomIds.has(i.roomId)),
      photos: s.photos.filter((p) => !roomIds.has(p.roomId)),
    },
    orphanBlobs: [...(floor?.planImageId ? [floor.planImageId] : []), ...photos.map((p) => p.blobId)],
  };
}

export function setPlanImage(
  s: AppState,
  floorId: string,
  image: { blobId: string; width: number; height: number },
): AppState {
  return {
    ...s,
    floors: s.floors.map((f) =>
      f.id === floorId
        ? {
            ...f,
            planImageId: image.blobId,
            planImageWidth: image.width,
            planImageHeight: image.height,
            cmPerPx: f.calibrated ? f.cmPerPx : ASSUMED_PLAN_WIDTH_CM / image.width,
          }
        : f,
    ),
  };
}

/**
 * The user measured a line on the plan: `drawnCm` is its length at the current
 * scale and `realCm` what it really is. Rooms already traced on this floor are
 * scaled with the picture so they stay on top of the walls they were drawn on.
 */
export function calibrateFloor(s: AppState, floorId: string, drawnCm: number, realCm: number): AppState {
  if (drawnCm <= 0 || realCm <= 0) return s;
  const factor = realCm / drawnCm;
  return {
    ...s,
    floors: s.floors.map((f) => (f.id === floorId ? { ...f, cmPerPx: f.cmPerPx * factor, calibrated: true } : f)),
    rooms: s.rooms.map((r) => (r.floorId === floorId ? { ...r, points: scalePoints(r.points, factor) } : r)),
  };
}

// ------------------------------------------------------------------- rooms

export const PAINTS = [
  { name: "Limewash", hex: "#e9e6dc" },
  { name: "Sage", hex: "#b9c4a7" },
  { name: "Dusty blue", hex: "#a9bccb" },
  { name: "Clay", hex: "#d4ab94" },
  { name: "Ochre", hex: "#dcb866" },
  { name: "Blush", hex: "#e5c4bb" },
  { name: "Forest", hex: "#56705b" },
  { name: "Charcoal", hex: "#4b5154" },
] as const;

export function addRoom(s: AppState, floorId: string, points: Pt[], name: string): { state: AppState; room: Room } {
  const room: Room = { id: newId(), floorId, name, points };
  return { state: { ...s, rooms: [...s.rooms, room] }, room };
}

export function updateRoom(s: AppState, id: string, patch: Partial<Omit<Room, "id">>): AppState {
  return { ...s, rooms: s.rooms.map((r) => (r.id === id ? { ...r, ...patch } : r)) };
}

export function deleteRoom(s: AppState, id: string): { state: AppState; orphanBlobs: string[] } {
  return {
    state: {
      ...s,
      rooms: s.rooms.filter((r) => r.id !== id),
      items: s.items.filter((i) => i.roomId !== id),
      photos: s.photos.filter((p) => p.roomId !== id),
    },
    orphanBlobs: s.photos.filter((p) => p.roomId === id).map((p) => p.blobId),
  };
}

// ------------------------------------------------------------ items/photos

export function addItem(s: AppState, item: Omit<PlanItem, "id" | "createdAt">): AppState {
  return { ...s, items: [...s.items, { ...item, id: newId(), createdAt: new Date().toISOString() }] };
}

export function updateItem(s: AppState, id: string, patch: Partial<Omit<PlanItem, "id">>): AppState {
  return { ...s, items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) };
}

export function deleteItem(s: AppState, id: string): AppState {
  return { ...s, items: s.items.filter((i) => i.id !== id) };
}

export function addPhoto(s: AppState, roomId: string, blobId: string): AppState {
  const photo: Photo = { id: newId(), roomId, blobId, createdAt: new Date().toISOString() };
  return { ...s, photos: [...s.photos, photo] };
}

export function updatePhoto(s: AppState, id: string, patch: Partial<Pick<Photo, "caption" | "link">>): AppState {
  return { ...s, photos: s.photos.map((p) => (p.id === id ? { ...p, ...patch } : p)) };
}

export function deletePhoto(s: AppState, id: string): AppState {
  return { ...s, photos: s.photos.filter((p) => p.id !== id) };
}
