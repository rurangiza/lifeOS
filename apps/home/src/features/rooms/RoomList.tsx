import { useMemo } from "react";
import { useBlobUrl } from "../../components/useBlobUrl";
import { formatEur, summarize } from "../../lib/budget";
import { cm2ToM2, formatArea, polygonAreaCm2 } from "../../lib/geometry";
import { href } from "../../lib/router";
import { useAppState } from "../../lib/store";
import type { PlanItem, Room } from "../../lib/types";

export function RoomList({ rooms }: { rooms: Room[] }) {
  const items = useAppState((s) => s.items);
  const photos = useAppState((s) => s.photos);
  const total = rooms.reduce((sum, r) => sum + cm2ToM2(polygonAreaCm2(r.points)), 0);

  return (
    <section className="px-3 py-5 sm:px-5">
      <div className="mb-3 flex items-baseline justify-between gap-3 px-1">
        <h2 className="text-xl font-semibold">Rooms</h2>
        {rooms.length > 0 && <span className="font-dim text-ink-2">{total.toFixed(1)} m²</span>}
      </div>
      {rooms.length === 0 ? (
        <p className="px-1 text-ink-2">
          No rooms yet. Use Draw a room and tap the corners of each room on the plan; you can start without a plan
          picture and draw on the grid.
        </p>
      ) : (
        <ul className="grid gap-2">
          {rooms.map((r) => (
            <RoomCard
              key={r.id}
              room={r}
              items={items}
              coverBlobId={photos.find((p) => p.roomId === r.id)?.blobId}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function RoomCard({ room, items, coverBlobId }: { room: Room; items: PlanItem[]; coverBlobId?: string }) {
  const cover = useBlobUrl(coverBlobId);
  const mine = useMemo(() => items.filter((i) => i.roomId === room.id), [items, room.id]);
  const budget = summarize(mine);
  const open = mine.filter((i) => i.status !== "done").length;

  return (
    <li>
      <a
        href={href({ view: "room", roomId: room.id })}
        className="flex min-h-20 items-stretch gap-3 overflow-hidden rounded-2xl border border-line bg-card hover:border-ink-2"
      >
        {/* The room's paint colour, as a paint chip. Unpainted rooms show hatching. */}
        <span
          className="w-14 shrink-0 border-r border-line"
          style={
            room.paint
              ? { background: room.paint }
              : { background: "repeating-linear-gradient(135deg, var(--paper-2) 0 6px, var(--card) 6px 12px)" }
          }
        />
        <span className="min-w-0 flex-1 py-3">
          <span className="block truncate font-semibold">{room.name}</span>
          <span className="block text-sm text-ink-2">
            <span className="font-dim">{formatArea(room.points)}</span>
            {mine.length > 0 && `, ${open} to do`}
            {budget.total > 0 && `, ${formatEur(budget.total)}`}
          </span>
        </span>
        {cover && <img src={cover} alt="" className="w-20 shrink-0 object-cover" />}
      </a>
    </li>
  );
}
