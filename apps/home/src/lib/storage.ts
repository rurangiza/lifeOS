import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { radiusForMinutes } from "./geo";
import { newId } from "./id";
import { DEFAULT_CATEGORIES } from "./overpass";
import type { AppState } from "./types";

interface HomeDB extends DBSchema {
  kv: { key: string; value: AppState };
  blobs: { key: string; value: Blob };
}

const DB_NAME = "lifeos-home";
const STATE_KEY = "state";

let dbPromise: Promise<IDBPDatabase<HomeDB>> | null = null;
function db() {
  dbPromise ??= openDB<HomeDB>(DB_NAME, 1, {
    upgrade(d) {
      d.createObjectStore("kv");
      d.createObjectStore("blobs");
    },
  });
  return dbPromise;
}

export function initialState(): AppState {
  return {
    version: 1,
    home: null,
    radiusM: Math.round(radiusForMinutes(20)),
    categories: structuredClone(DEFAULT_CATEGORIES),
    mine: {},
    placesCache: null,
    floors: [],
    rooms: [],
    items: [],
    photos: [],
  };
}

/** Fill in anything a saved state from an older build is missing. */
export function normalize(raw: Partial<AppState>): AppState {
  const base = initialState();
  const state: AppState = { ...base, ...raw, version: 1 };
  const known = new Set(state.categories.map((c) => c.id));
  for (const c of DEFAULT_CATEGORIES) if (!known.has(c.id)) state.categories.push(structuredClone(c));
  return state;
}

export async function loadState(): Promise<AppState> {
  const saved = await (await db()).get("kv", STATE_KEY);
  return saved ? normalize(saved) : initialState();
}

export async function saveState(state: AppState): Promise<void> {
  await (await db()).put("kv", state, STATE_KEY);
}

export async function putBlob(blob: Blob): Promise<string> {
  const id = newId();
  await (await db()).put("blobs", blob, id);
  return id;
}

export async function getBlob(id: string): Promise<Blob | undefined> {
  return (await db()).get("blobs", id);
}

export async function deleteBlob(id: string): Promise<void> {
  await (await db()).delete("blobs", id);
}

/** Ask the browser not to evict our data under storage pressure. */
export async function requestPersistence(): Promise<boolean> {
  try {
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}

// ----------------------------------------------------------------- backups

interface BackupFile {
  app: "lifeos-home";
  exportedAt: string;
  state: AppState;
  blobs: Record<string, { type: string; base64: string }>;
}

function toBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
}

function fromBase64(b64: string): Uint8Array<ArrayBuffer> {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export function referencedBlobIds(state: AppState): string[] {
  return [
    ...state.floors.flatMap((f) => (f.planImageId ? [f.planImageId] : [])),
    ...state.photos.map((p) => p.blobId),
  ];
}

export async function exportBackup(state: AppState): Promise<Blob> {
  const blobs: BackupFile["blobs"] = {};
  for (const id of referencedBlobIds(state)) {
    const blob = await getBlob(id);
    if (blob) blobs[id] = { type: blob.type, base64: toBase64(new Uint8Array(await blob.arrayBuffer())) };
  }
  const file: BackupFile = { app: "lifeos-home", exportedAt: new Date().toISOString(), state, blobs };
  return new Blob([JSON.stringify(file)], { type: "application/json" });
}

export async function importBackup(text: string): Promise<AppState> {
  const file = JSON.parse(text) as Partial<BackupFile>;
  if (file.app !== "lifeos-home" || !file.state) {
    throw new Error("This file isn't a Home backup.");
  }
  const d = await db();
  const tx = d.transaction("blobs", "readwrite");
  for (const [id, { type, base64 }] of Object.entries(file.blobs ?? {})) {
    await tx.store.put(new Blob([fromBase64(base64)], { type }), id);
  }
  await tx.done;
  const state = normalize(file.state);
  await saveState(state);
  return state;
}
