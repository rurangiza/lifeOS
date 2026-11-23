import { useMemo, useRef, useState } from "react";
import { Button, EmptyState, Field, Icon, IconButton, inputClass, Sheet } from "../../components/ui";
import { useBlobUrl } from "../../components/useBlobUrl";
import { formatArea, formatLength } from "../../lib/geometry";
import { downscaleImage } from "../../lib/images";
import { addFloor, addRoom, calibrateFloor, deleteFloor, renameFloor, setPlanImage, updateRoom } from "../../lib/ops";
import { href, navigate } from "../../lib/router";
import { deleteBlob, putBlob } from "../../lib/storage";
import { update, useAppState } from "../../lib/store";
import type { Floor, Pt, Room } from "../../lib/types";
import { RoomList } from "../rooms/RoomList";
import { PlanCanvas, type PlanMode } from "./PlanCanvas";

const FLOOR_SUGGESTIONS = ["Ground floor", "1st floor", "2nd floor", "Attic"];
const ROOM_SUGGESTIONS = ["Living room", "Kitchen", "Bedroom", "Bathroom", "Office", "Hall", "Toilet", "Storage"];
const OPACITY_STEPS = [1, 0.4, 0];

export function FlatView({ floorId }: { floorId?: string }) {
  const floors = useAppState((s) => s.floors);
  const allRooms = useAppState((s) => s.rooms);
  const [addingFloor, setAddingFloor] = useState(false);

  const floor = floors.find((f) => f.id === floorId) ?? floors[0];
  const rooms = useMemo(() => allRooms.filter((r) => r.floorId === floor?.id), [allRooms, floor?.id]);

  if (!floor) {
    return (
      <>
        <EmptyState
          title="Start with a floor"
          body="Add each floor of the flat, then upload its plan and trace the rooms on it."
          action={
            <Button variant="primary" onClick={() => setAddingFloor(true)}>
              <Icon name="plus" size={20} /> Add a floor
            </Button>
          }
        />
        <FloorNameSheet open={addingFloor} onClose={() => setAddingFloor(false)} />
      </>
    );
  }

  return (
    <div className="mx-auto flex h-full max-w-[1400px] flex-col lg:flex-row">
      <div className="flex min-h-0 flex-col lg:flex-1">
        <div className="flex items-center gap-1 overflow-x-auto px-3 py-2 sm:px-5" role="tablist" aria-label="Floors">
          {floors.map((f) => (
            <a
              key={f.id}
              role="tab"
              href={href({ view: "flat", floorId: f.id })}
              aria-selected={f.id === floor.id}
              className="shrink-0 rounded-full px-4 py-2 text-[15px] text-ink-2 aria-selected:bg-ink aria-selected:text-paper"
            >
              {f.name}
            </a>
          ))}
          <IconButton label="Add a floor" onClick={() => setAddingFloor(true)}>
            <Icon name="plus" size={20} />
          </IconButton>
        </div>
        <FloorPlan key={floor.id} floor={floor} rooms={rooms} />
      </div>
      <aside className="border-line lg:w-[380px] lg:overflow-y-auto lg:border-l">
        <RoomList rooms={rooms} />
      </aside>
      <FloorNameSheet open={addingFloor} onClose={() => setAddingFloor(false)} />
    </div>
  );
}

function FloorPlan({ floor, rooms }: { floor: Floor; rooms: Room[] }) {
  const imageUrl = useBlobUrl(floor.planImageId);
  const [mode, setMode] = useState<PlanMode>("view");
  const [selectedId, setSelectedId] = useState<string>();
  const [opacityStep, setOpacityStep] = useState(0);
  const [pendingRoom, setPendingRoom] = useState<Pt[] | null>(null);
  const [measured, setMeasured] = useState<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const selected = rooms.find((r) => r.id === selectedId);

  async function onUpload(file: File) {
    setUploadError(null);
    try {
      const { blob, width, height } = await downscaleImage(file, 3200);
      const blobId = await putBlob(blob);
      const old = floor.planImageId;
      update((s) => setPlanImage(s, floor.id, { blobId, width, height }));
      if (old) await deleteBlob(old);
    } catch (err) {
      setUploadError(`That file couldn't be read as a picture (${err instanceof Error ? err.message : String(err)}).`);
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const hasImage = Boolean(floor.planImageId);

  return (
    <>
      <div className="flex flex-wrap items-center gap-1 px-3 pb-2 sm:px-5">
        <Button variant={mode === "draw" ? "primary" : "outline"} onClick={() => setMode(mode === "draw" ? "view" : "draw")}>
          <Icon name="pen" size={20} /> Draw a room
        </Button>
        {hasImage && (
          <Button variant={mode === "measure" ? "primary" : "quiet"} onClick={() => setMode(mode === "measure" ? "view" : "measure")}>
            <Icon name="ruler" size={20} /> Set scale
          </Button>
        )}
        {hasImage ? (
          <IconButton
            label={`Plan photo ${["shown", "faded", "hidden"][opacityStep]}. Tap to change.`}
            onClick={() => setOpacityStep((opacityStep + 1) % OPACITY_STEPS.length)}
            className={opacityStep === 2 ? "text-ink-2" : ""}
          >
            <Icon name="image" size={20} className={opacityStep === 1 ? "opacity-50" : ""} />
          </IconButton>
        ) : (
          <Button variant="quiet" onClick={() => fileRef.current?.click()}>
            <Icon name="image" size={20} /> Upload plan
          </Button>
        )}
        <IconButton label={`${floor.name} settings`} className="ml-auto" onClick={() => setSettingsOpen(true)}>
          <Icon name="settings" size={20} />
        </IconButton>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
        />
      </div>

      {uploadError && <p className="mx-3 mb-2 text-sm text-danger sm:mx-5">{uploadError}</p>}
      {hasImage && !floor.calibrated && mode === "view" && (
        <button
          type="button"
          onClick={() => setMode("measure")}
          className="mx-3 mb-2 rounded-xl bg-cobalt-wash px-3 py-2 text-left text-[15px] sm:mx-5"
        >
          Sizes are a guess until you set the scale: tap here, then tap both ends of a wall whose length you know.
        </button>
      )}

      <div className="relative h-[58dvh] min-h-[360px] border-y border-line lg:h-auto lg:flex-1">
        <PlanCanvas
          // Setting the scale resizes the whole drawing; start again from a fitted view.
          key={floor.cmPerPx}
          floor={floor}
          rooms={rooms}
          imageUrl={imageUrl}
          imageOpacity={OPACITY_STEPS[opacityStep]!}
          mode={mode}
          selectedRoomId={selectedId}
          onSelectRoom={setSelectedId}
          onFinishRoom={(pts) => setPendingRoom(pts)}
          onMeasured={(cm) => setMeasured(cm)}
          onMoveVertex={(roomId, i, p) =>
            update((s) => {
              const room = s.rooms.find((r) => r.id === roomId);
              if (!room) return s;
              return updateRoom(s, roomId, { points: room.points.map((q, j) => (j === i ? p : q)) });
            })
          }
          onCancelMode={() => setMode("view")}
        />
        {selected && mode === "view" && (
          <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-2xl bg-card p-2 pl-4 shadow-[0_6px_24px_rgb(0_0_0/0.16)] sm:right-auto sm:min-w-[360px]">
            <span className="size-4 shrink-0 rounded-full border border-line" style={{ background: selected.paint ?? "var(--card)" }} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{selected.name}</p>
              <p className="font-dim text-sm text-ink-2">{formatArea(selected.points)}</p>
            </div>
            <Button variant="quiet" onClick={() => setMode("edit")}>
              Edit shape
            </Button>
            <Button variant="primary" onClick={() => navigate({ view: "room", roomId: selected.id })}>
              Open
            </Button>
          </div>
        )}
      </div>

      <RoomNameSheet
        open={pendingRoom !== null}
        onClose={() => setPendingRoom(null)}
        onSave={(name) => {
          const pts = pendingRoom!;
          let id = "";
          update((s) => {
            const r = addRoom(s, floor.id, pts, name);
            id = r.room.id;
            return r.state;
          });
          setPendingRoom(null);
          setMode("view");
          setSelectedId(id);
        }}
      />
      <MeasureSheet
        drawnCm={measured}
        calibrated={floor.calibrated}
        onClose={() => setMeasured(null)}
        onSave={(realCm) => {
          update((s) => calibrateFloor(s, floor.id, measured!, realCm));
          setMeasured(null);
          setMode("view");
        }}
      />
      <FloorSettingsSheet
        floor={floor}
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onReplacePlan={() => {
          setSettingsOpen(false);
          fileRef.current?.click();
        }}
      />
    </>
  );
}

function FloorNameSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const taken = new Set(useAppState((s) => s.floors).map((f) => f.name));
  function save(n: string) {
    const trimmed = n.trim();
    if (!trimmed) return;
    let id = "";
    update((s) => {
      const r = addFloor(s, trimmed);
      id = r.floor.id;
      return r.state;
    });
    setName("");
    onClose();
    navigate({ view: "flat", floorId: id });
  }
  return (
    <Sheet open={open} onClose={onClose} title="Add a floor">
      <div className="mb-3 flex flex-wrap gap-2">
        {FLOOR_SUGGESTIONS.filter((s) => !taken.has(s)).map((s) => (
          <Button key={s} onClick={() => save(s)}>
            {s}
          </Button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save(name);
        }}
        className="flex gap-2"
      >
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Or type a name" className={inputClass} aria-label="Floor name" />
        <Button variant="primary" type="submit" disabled={!name.trim()}>
          Add
        </Button>
      </form>
    </Sheet>
  );
}

function RoomNameSheet({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (name: string) => void }) {
  const [name, setName] = useState("");
  const save = (n: string) => {
    if (!n.trim()) return;
    onSave(n.trim());
    setName("");
  };
  return (
    <Sheet open={open} onClose={onClose} title="Name this room">
      <div className="mb-3 flex flex-wrap gap-2">
        {ROOM_SUGGESTIONS.map((s) => (
          <Button key={s} onClick={() => save(s)}>
            {s}
          </Button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save(name);
        }}
        className="flex gap-2"
      >
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Or type a name" className={inputClass} aria-label="Room name" />
        <Button variant="primary" type="submit" disabled={!name.trim()}>
          Save room
        </Button>
      </form>
    </Sheet>
  );
}

function MeasureSheet({
  drawnCm,
  calibrated,
  onClose,
  onSave,
}: {
  drawnCm: number | null;
  calibrated: boolean;
  onClose: () => void;
  onSave: (realCm: number) => void;
}) {
  const [value, setValue] = useState("");
  const cm = Number(value.replace(",", "."));
  const valid = Number.isFinite(cm) && cm > 0;
  return (
    <Sheet open={drawnCm !== null} onClose={onClose} title="How long is that wall?">
      <p className="mb-4 text-ink-2">
        At the {calibrated ? "current" : "guessed"} scale the line measures{" "}
        <span className="font-dim font-semibold text-ink">{drawnCm !== null && formatLength(drawnCm)}</span>. Enter its
        real length and every room on this floor is resized to match.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) {
            onSave(cm);
            setValue("");
          }
        }}
        className="flex items-end gap-2"
      >
        <Field label="Real length in centimetres">
          <input
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="570"
            className={inputClass}
            autoFocus
          />
        </Field>
        <Button variant="primary" type="submit" disabled={!valid}>
          Set scale
        </Button>
      </form>
    </Sheet>
  );
}

function FloorSettingsSheet({
  floor,
  open,
  onClose,
  onReplacePlan,
}: {
  floor: Floor;
  open: boolean;
  onClose: () => void;
  onReplacePlan: () => void;
}) {
  const [name, setName] = useState(floor.name);
  const [confirming, setConfirming] = useState(false);
  const roomCount = useAppState((s) => s.rooms).filter((r) => r.floorId === floor.id).length;

  async function remove() {
    let orphans: string[] = [];
    update((s) => {
      const r = deleteFloor(s, floor.id);
      orphans = r.orphanBlobs;
      return r.state;
    });
    onClose();
    navigate({ view: "flat" }, { replace: true });
    await Promise.all(orphans.map(deleteBlob));
  }

  return (
    <Sheet open={open} onClose={onClose} title="Floor settings">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) update((s) => renameFloor(s, floor.id, name.trim()));
          onClose();
        }}
        className="flex items-end gap-2"
      >
        <Field label="Name">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </Field>
        <Button variant="primary" type="submit">
          Rename
        </Button>
      </form>
      <div className="mt-6">
        <Button onClick={onReplacePlan}>
          <Icon name="image" size={20} /> {floor.planImageId ? "Replace the plan picture" : "Upload a plan picture"}
        </Button>
        {floor.planImageId && (
          <p className="mt-2 text-[13px] text-ink-2">
            Rooms stay where they are. If the new picture has a different size, set the scale again.
          </p>
        )}
      </div>
      <div className="mt-8 border-t border-line pt-4">
        {confirming ? (
          <>
            <p>
              Delete {floor.name}, its plan and {roomCount === 1 ? "its room" : `its ${roomCount} rooms`} with their plans
              and photos? This can't be undone.
            </p>
            <div className="mt-3 flex gap-2">
              <Button variant="danger" className="border border-danger" onClick={remove}>
                Delete floor
              </Button>
              <Button variant="quiet" onClick={() => setConfirming(false)}>
                Keep it
              </Button>
            </div>
          </>
        ) : (
          <Button variant="danger" onClick={() => setConfirming(true)}>
            <Icon name="trash" size={20} /> Delete this floor
          </Button>
        )}
      </div>
    </Sheet>
  );
}
