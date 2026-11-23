import { useMemo, useState } from "react";
import { Button, EmptyState, Field, Icon, inputClass, Sheet } from "../../components/ui";
import { formatEur, KIND_LABEL, STATUS_LABEL, summarize } from "../../lib/budget";
import { formatArea } from "../../lib/geometry";
import { deleteRoom, PAINTS, updateRoom } from "../../lib/ops";
import { href, navigate } from "../../lib/router";
import { deleteBlob } from "../../lib/storage";
import { update, useAppState } from "../../lib/store";
import { ITEM_KINDS, type ItemKind, type PlanItem, type Room } from "../../lib/types";
import { ItemSheet } from "./ItemSheet";
import { Moodboard } from "./Moodboard";
import { RoomShape } from "./RoomShape";

const STATUS_STYLE: Record<PlanItem["status"], string> = {
  idea: "border border-dashed border-ink-2 text-ink-2",
  planned: "border border-ink text-ink",
  ordered: "bg-cobalt-wash text-ink",
  done: "bg-ink text-paper",
};

export function RoomView({ roomId }: { roomId: string }) {
  const room = useAppState((s) => s.rooms.find((r) => r.id === roomId));
  const floor = useAppState((s) => s.floors.find((f) => f.id === room?.floorId));
  const allItems = useAppState((s) => s.items);
  const allPhotos = useAppState((s) => s.photos);
  const items = useMemo(() => allItems.filter((i) => i.roomId === roomId), [allItems, roomId]);
  const photos = useMemo(() => allPhotos.filter((p) => p.roomId === roomId), [allPhotos, roomId]);
  const [editing, setEditing] = useState<{ item?: PlanItem; kind?: ItemKind } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (!room) {
    return (
      <EmptyState
        title="This room no longer exists"
        body="It may have been deleted, or the link comes from another device."
        action={
          <Button variant="primary" onClick={() => navigate({ view: "flat" })}>
            Back to the flat
          </Button>
        }
      />
    );
  }

  const budget = summarize(items);

  return (
    <div className="mx-auto max-w-5xl px-4 pt-4 pb-12 sm:px-6">
      <a href={href({ view: "flat", floorId: room.floorId })} className="-ml-2 inline-flex min-h-11 items-center gap-1 px-2 text-ink-2 hover:text-ink">
        <Icon name="back" size={20} /> {floor?.name ?? "Flat"}
      </a>

      <div className="mt-2 grid gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] md:items-start">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-[32px] leading-[1.05] font-semibold text-balance sm:text-[44px]">{room.name}</h1>
              <p className="mt-1 font-dim text-lg text-ink-2">{formatArea(room.points)}</p>
            </div>
            <Button variant="quiet" onClick={() => setSettingsOpen(true)}>
              Rename
            </Button>
          </div>
          <div className="mt-4 rounded-3xl bg-paper-2 p-3">
            <RoomShape points={room.points} paint={room.paint} />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Wall colour</h2>
          <p className="mb-3 text-sm text-ink-2">Shown on the floor plan.</p>
          <div className="grid grid-cols-4 gap-2">
            {PAINTS.map((p) => (
              <button
                key={p.hex}
                type="button"
                aria-pressed={room.paint === p.hex}
                onClick={() => update((s) => updateRoom(s, room.id, { paint: room.paint === p.hex ? undefined : p.hex }))}
                className="overflow-hidden rounded-xl border border-line bg-card text-left aria-pressed:ring-2 aria-pressed:ring-cobalt"
              >
                <span className="block h-12" style={{ background: p.hex }} />
                <span className="block truncate px-2 py-1 text-[13px]">{p.name}</span>
              </button>
            ))}
          </div>
          <label className="mt-3 flex min-h-11 items-center gap-3 text-[15px]">
            <input
              type="color"
              value={room.paint ?? "#e9e6dc"}
              onChange={(e) => update((s) => updateRoom(s, room.id, { paint: e.target.value }))}
              className="size-11 cursor-pointer rounded-lg border border-line bg-transparent"
            />
            Pick any other colour
          </label>

          <div className="mt-6 rounded-2xl border border-line p-4">
            <p className="text-sm text-ink-2">Planned for this room</p>
            <p className="font-dim text-[32px] leading-tight font-semibold">{formatEur(budget.total)}</p>
            <p className="text-sm text-ink-2">
              {formatEur(budget.spent)} ordered or done
              {budget.unpriced > 0 && `, ${budget.unpriced} without a price`}
            </p>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Plans</h2>
          <Button variant="primary" onClick={() => setEditing({})}>
            <Icon name="plus" size={20} /> Add a plan
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {ITEM_KINDS.map((kind) => {
            const list = items.filter((i) => i.kind === kind);
            return (
              <div key={kind} className="rounded-2xl bg-paper-2 p-3">
                <div className="mb-2 flex items-baseline justify-between px-1">
                  <h3 className="font-semibold">{KIND_LABEL[kind]}</h3>
                  {budget.byKind[kind] > 0 && <span className="font-dim text-ink-2">{formatEur(budget.byKind[kind])}</span>}
                </div>
                {list.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => setEditing({ kind })}
                    className="min-h-11 w-full rounded-xl px-2 text-left text-ink-2 hover:bg-card"
                  >
                    + Add {kind === "renovation" ? "a renovation" : kind === "lighting" ? "lighting" : "furniture or decor"}
                  </button>
                ) : (
                  <ul className="grid gap-1.5">
                    {list.map((i) => (
                      <li key={i.id}>
                        <button
                          type="button"
                          onClick={() => setEditing({ item: i })}
                          className="flex min-h-12 w-full items-center gap-2 rounded-xl bg-card px-3 py-2 text-left"
                        >
                          <span className="min-w-0 flex-1">
                            <span className={`block ${i.status === "done" ? "text-ink-2 line-through" : ""}`}>{i.title}</span>
                            {i.costEur !== undefined && <span className="block font-dim text-sm text-ink-2">{formatEur(i.costEur)}</span>}
                          </span>
                          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[13px] ${STATUS_STYLE[i.status]}`}>
                            {STATUS_LABEL[i.status]}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-10">
        <Moodboard roomId={room.id} photos={photos} />
      </div>

      <ItemSheet
        roomId={room.id}
        item={editing?.item}
        defaultKind={editing?.kind}
        open={editing !== null}
        onClose={() => setEditing(null)}
      />
      <RoomSettingsSheet room={room} open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function RoomSettingsSheet({ room, open, onClose }: { room: Room; open: boolean; onClose: () => void }) {
  const [name, setName] = useState(room.name);
  const [confirming, setConfirming] = useState(false);

  async function remove() {
    let orphans: string[] = [];
    update((s) => {
      const r = deleteRoom(s, room.id);
      orphans = r.orphanBlobs;
      return r.state;
    });
    onClose();
    navigate({ view: "flat", floorId: room.floorId }, { replace: true });
    await Promise.all(orphans.map(deleteBlob));
  }

  return (
    <Sheet open={open} onClose={onClose} title="Room settings">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) update((s) => updateRoom(s, room.id, { name: name.trim() }));
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
      <p className="mt-4 text-sm text-ink-2">To change the shape, select the room on the floor plan and use Edit shape.</p>
      <div className="mt-8 border-t border-line pt-4">
        {confirming ? (
          <>
            <p>Delete {room.name} with its plans and photos? This can't be undone.</p>
            <div className="mt-3 flex gap-2">
              <Button variant="danger" className="border border-danger" onClick={remove}>
                Delete room
              </Button>
              <Button variant="quiet" onClick={() => setConfirming(false)}>
                Keep it
              </Button>
            </div>
          </>
        ) : (
          <Button variant="danger" onClick={() => setConfirming(true)}>
            <Icon name="trash" size={20} /> Delete this room
          </Button>
        )}
      </div>
    </Sheet>
  );
}
