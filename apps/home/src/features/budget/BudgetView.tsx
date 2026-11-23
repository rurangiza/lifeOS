import { Button, EmptyState } from "../../components/ui";
import { formatEur, KIND_LABEL, STATUS_LABEL, summarize } from "../../lib/budget";
import { href, navigate } from "../../lib/router";
import { useAppState } from "../../lib/store";
import { ITEM_KINDS, ITEM_STATUSES } from "../../lib/types";

export function BudgetView() {
  const items = useAppState((s) => s.items);
  const rooms = useAppState((s) => s.rooms);
  const floors = useAppState((s) => s.floors);
  const all = summarize(items);

  const perRoom = rooms
    .map((r) => ({
      room: r,
      floor: floors.find((f) => f.id === r.floorId),
      count: items.filter((i) => i.roomId === r.id).length,
      sum: summarize(items.filter((i) => i.roomId === r.id)),
    }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.sum.total - a.sum.total);

  if (items.length === 0) {
    return (
      <EmptyState
        title="Nothing planned yet"
        body="Open a room and add renovations, furniture or lighting with a rough price. The totals show up here."
        action={
          <Button variant="primary" onClick={() => navigate({ view: "flat" })}>
            Go to the flat
          </Button>
        }
      />
    );
  }

  const max = Math.max(1, ...ITEM_KINDS.map((k) => all.byKind[k]));
  const spentPct = all.total > 0 ? (all.spent / all.total) * 100 : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <p className="text-ink-2">Everything planned</p>
      <p className="font-dim text-[clamp(40px,10vw,64px)] leading-none font-semibold tabular-nums">{formatEur(all.total)}</p>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-paper-2" role="img" aria-label={`${Math.round(spentPct)}% ordered or done`}>
        <div className="h-full rounded-full bg-ink" style={{ width: `${spentPct}%` }} />
      </div>
      <p className="mt-2 text-ink-2">
        {formatEur(all.spent)} ordered or done, {formatEur(all.total - all.spent)} still to buy
        {all.unpriced > 0 && `. ${all.unpriced} ${all.unpriced === 1 ? "plan has" : "plans have"} no price yet`}.
      </p>

      <h2 className="mt-10 mb-3 text-xl font-semibold">By kind</h2>
      <ul className="grid gap-3">
        {ITEM_KINDS.map((k) => (
          <li key={k} className="grid grid-cols-[9rem_minmax(0,1fr)_auto] items-center gap-3">
            <span>{KIND_LABEL[k]}</span>
            <span className="h-2.5 overflow-hidden rounded-full bg-paper-2">
              <span className="block h-full rounded-full bg-cobalt" style={{ width: `${(all.byKind[k] / max) * 100}%` }} />
            </span>
            <span className="font-dim text-right tabular-nums">{formatEur(all.byKind[k])}</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 mb-3 text-xl font-semibold">By status</h2>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ITEM_STATUSES.map((s) => (
          <div key={s} className="rounded-2xl bg-paper-2 p-3">
            <dt className="text-sm text-ink-2">{STATUS_LABEL[s]}</dt>
            <dd className="font-dim text-xl font-semibold tabular-nums">{formatEur(all.byStatus[s])}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-10 mb-3 text-xl font-semibold">By room</h2>
      <ul className="divide-y divide-line border-y border-line">
        {perRoom.map(({ room, floor, sum }) => (
          <li key={room.id}>
            <a href={href({ view: "room", roomId: room.id })} className="flex min-h-14 items-center gap-3 py-2 hover:bg-paper-2">
              <span className="size-4 shrink-0 rounded-full border border-line" style={{ background: room.paint ?? "var(--card)" }} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{room.name}</span>
                <span className="block text-sm text-ink-2">{floor?.name}</span>
              </span>
              <span className="font-dim tabular-nums">{formatEur(sum.total)}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
