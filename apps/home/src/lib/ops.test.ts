import { describe, expect, it } from "vitest";
import {
  addFloor,
  addItem,
  addPhoto,
  addRoom,
  calibrateFloor,
  deleteFloor,
  deleteRoom,
  moveHomePin,
  setHome,
  setPlanImage,
  toggleMine,
} from "./ops";
import { initialState } from "./storage";

const square = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];

function flatWithRoom() {
  const { state: s1, floor } = addFloor(initialState(), "2nd floor");
  const s2 = setPlanImage(s1, floor.id, { blobId: "plan", width: 2400, height: 1800 });
  const { state: s3, room } = addRoom(s2, floor.id, square, "Bedroom");
  const s4 = addPhoto(addItem(s3, { roomId: room.id, title: "Bed", kind: "furniture", status: "idea" }), room.id, "pic");
  return { state: s4, floor, room };
}

describe("setPlanImage", () => {
  it("assumes the picture spans a 12 m flat until calibrated", () => {
    const { state, floor } = flatWithRoom();
    expect(state.floors.find((f) => f.id === floor.id)!.cmPerPx).toBe(0.5);
  });
});

describe("calibrateFloor", () => {
  it("rescales the floor and the rooms traced on it", () => {
    const { state, floor, room } = flatWithRoom();
    // The user measured a wall drawn as 285 cm that is really 570 cm.
    const next = calibrateFloor(state, floor.id, 285, 570);
    const f = next.floors.find((x) => x.id === floor.id)!;
    expect(f.cmPerPx).toBe(1);
    expect(f.calibrated).toBe(true);
    expect(next.rooms.find((r) => r.id === room.id)!.points[2]).toEqual({ x: 200, y: 200 });
  });

  it("ignores impossible lengths", () => {
    const { state, floor } = flatWithRoom();
    expect(calibrateFloor(state, floor.id, 0, 570)).toBe(state);
  });
});

describe("deleting", () => {
  it("removes a room with its items and photos and reports the photo blobs", () => {
    const { state, room } = flatWithRoom();
    const { state: next, orphanBlobs } = deleteRoom(state, room.id);
    expect(next.rooms).toHaveLength(0);
    expect(next.items).toHaveLength(0);
    expect(next.photos).toHaveLength(0);
    expect(orphanBlobs).toEqual(["pic"]);
  });

  it("removes a floor with everything on it, plan picture included", () => {
    const { state, floor } = flatWithRoom();
    const { state: next, orphanBlobs } = deleteFloor(state, floor.id);
    expect(next.floors).toHaveLength(0);
    expect(next.rooms).toHaveLength(0);
    expect(orphanBlobs.sort()).toEqual(["pic", "plan"]);
  });
});

describe("home and favourites", () => {
  it("toggles a favourite place per category", () => {
    const s = toggleMine(initialState(), "gym", "node/1");
    expect(s.mine.gym).toBe("node/1");
    expect(toggleMine(s, "gym", "node/1").mine.gym).toBeUndefined();
  });

  it("clears places and favourites when moving home", () => {
    const s = { ...toggleMine(initialState(), "gym", "node/1"), placesCache: { fetchedAt: "", key: "k", places: [] } };
    const next = setHome(s, { lat: 50.88, lon: 4.33, label: "Jette" });
    expect(next.placesCache).toBeNull();
    expect(next.mine).toEqual({});
  });
});

describe("moveHomePin", () => {
  it("keeps favourites but drops places measured from the old pin", () => {
    const s0 = setHome(initialState(), { lat: 50.88, lon: 4.33, label: "Jette" });
    const s1 = { ...toggleMine(s0, "gym", "node/1"), placesCache: { fetchedAt: "", key: "k", places: [] } };
    const s2 = moveHomePin(s1, { lat: 50.881, lon: 4.331 });
    expect(s2.home).toEqual({ lat: 50.881, lon: 4.331, label: "Jette" });
    expect(s2.mine.gym).toBe("node/1");
    expect(s2.placesCache).toBeNull();
  });
});
