import { useSyncExternalStore } from "react";

export type Route =
  | { view: "around" }
  | { view: "flat"; floorId?: string }
  | { view: "room"; roomId: string }
  | { view: "budget" };

export function parseHash(hash: string): Route {
  const [view, id] = hash.replace(/^#\/?/, "").split("/");
  if (view === "flat") return { view: "flat", floorId: id || undefined };
  if (view === "room" && id) return { view: "room", roomId: id };
  if (view === "budget") return { view: "budget" };
  return { view: "around" };
}

export function href(route: Route): string {
  switch (route.view) {
    case "around":
      return "#/around";
    case "flat":
      return route.floorId ? `#/flat/${route.floorId}` : "#/flat";
    case "room":
      return `#/room/${route.roomId}`;
    case "budget":
      return "#/budget";
  }
}

export function navigate(route: Route, { replace = false } = {}) {
  if (replace) history.replaceState(null, "", href(route));
  else location.hash = href(route);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

function subscribe(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}

export function useHash(): string {
  return useSyncExternalStore(subscribe, () => location.hash);
}
