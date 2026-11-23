import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { addFloor, addPhoto, addRoom, setPlanImage } from "./ops";
import {
  exportBackup,
  getBlob,
  importBackup,
  initialState,
  loadState,
  normalize,
  putBlob,
  saveState,
} from "./storage";

describe("state", () => {
  it("starts empty when nothing is saved", async () => {
    expect(await loadState()).toEqual(initialState());
  });

  it("saves and loads", async () => {
    const s = { ...initialState(), radiusM: 900 };
    await saveState(s);
    expect((await loadState()).radiusM).toBe(900);
  });

  it("adds categories that a newer build introduced", () => {
    const old = { ...initialState(), categories: [] };
    expect(normalize(old).categories.map((c) => c.id)).toContain("gym");
  });
});

describe("backups", () => {
  it("round-trips the state and every picture", async () => {
    const planId = await putBlob(new Blob([new Uint8Array([1, 2, 3])], { type: "image/png" }));
    const photoId = await putBlob(new Blob([new Uint8Array(70_000).fill(7)], { type: "image/jpeg" }));
    const { state: s1, floor } = addFloor(initialState(), "Attic");
    const s2 = setPlanImage(s1, floor.id, { blobId: planId, width: 100, height: 100 });
    const { state: s3, room } = addRoom(s2, floor.id, [], "Office");
    const state = addPhoto(s3, room.id, photoId);

    const text = await (await exportBackup(state)).text();
    const restored = await importBackup(text);

    expect(restored).toEqual(state);
    const photo = await getBlob(photoId);
    expect(photo?.type).toBe("image/jpeg");
    expect(new Uint8Array(await photo!.arrayBuffer())[69_999]).toBe(7);
  });

  it("refuses files that are not backups", async () => {
    await expect(importBackup('{"hello":1}')).rejects.toThrow("isn't a Home backup");
  });
});
