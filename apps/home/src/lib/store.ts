import { useSyncExternalStore } from "react";
import { initialState, saveState } from "./storage";
import type { AppState } from "./types";

type Listener = () => void;

let state: AppState = initialState();
let loaded = false;
const listeners = new Set<Listener>();
let saveTimer: ReturnType<typeof setTimeout> | undefined;
let saveError: string | null = null;

function emit() {
  for (const l of listeners) l();
}

let loadError: string | null = null;

export function hydrate(next: AppState) {
  state = next;
  loaded = true;
  emit();
}

export function failLoad(message: string) {
  loadError = message;
  emit();
}

export function useLoadError(): string | null {
  return useSyncExternalStore(subscribe, () => loadError);
}

export function getState(): AppState {
  return state;
}

/** Apply an update and save it shortly after; rapid edits share one write. */
export function update(fn: (s: AppState) => AppState) {
  state = fn(state);
  emit();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveState(state).then(
      () => {
        if (saveError) {
          saveError = null;
          emit();
        }
      },
      (err: unknown) => {
        saveError = err instanceof Error ? err.message : "Saving failed";
        emit();
      },
    );
  }, 250);
}

function subscribe(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useAppState<T>(select: (s: AppState) => T): T {
  return useSyncExternalStore(subscribe, () => select(state));
}

export function useLoaded(): boolean {
  return useSyncExternalStore(subscribe, () => loaded);
}

export function useSaveError(): string | null {
  return useSyncExternalStore(subscribe, () => saveError);
}
