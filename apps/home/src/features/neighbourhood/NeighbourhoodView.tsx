import { useEffect, useMemo, useState } from "react";
import { Button, Icon, IconButton } from "../../components/ui";
import { formatDistance, radiusForMinutes, walkMinutes } from "../../lib/geo";
import { moveHomePin, setHome, toggleMine } from "../../lib/ops";
import { cacheKey, fetchPlaces, mineLabel } from "../../lib/overpass";
import { update, useAppState } from "../../lib/store";
import type { Category, Place } from "../../lib/types";
import { AddressSearch } from "./AddressSearch";
import { CategorySheet } from "./CategorySheet";
import { MapView, WALK_RINGS_MIN } from "./MapView";

const RADIUS_CHOICES = [10, 20, 30].map((min) => ({ min, m: Math.round(radiusForMinutes(min)) }));

export default function NeighbourhoodView() {
  const home = useAppState((s) => s.home);
  const categories = useAppState((s) => s.categories);
  const radiusM = useAppState((s) => s.radiusM);
  const cache = useAppState((s) => s.placesCache);
  const mine = useAppState((s) => s.mine);

  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null);
  const [selectedId, setSelectedId] = useState<string>();
  const [changingAddress, setChangingAddress] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const key = home ? cacheKey(categories, home, radiusM) : null;
  const needsFetch = key !== null && cache?.key !== key;
  const loading = needsFetch && failure?.key !== key;

  useEffect(() => {
    if (!home || !key || !needsFetch) return;
    const ctrl = new AbortController();
    fetchPlaces(categories, home, radiusM, ctrl.signal).then(
      (places) => update((s) => ({ ...s, placesCache: { fetchedAt: new Date().toISOString(), key, places } })),
      (err: unknown) => {
        if (!ctrl.signal.aborted) setFailure({ key, message: err instanceof Error ? err.message : String(err) });
      },
    );
    return () => ctrl.abort();
    // `key` already captures every input that matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, needsFetch]);

  const enabled = useMemo(() => categories.filter((c) => c.enabled), [categories]);
  const places = useMemo(() => {
    const on = new Set(enabled.map((c) => c.id));
    return (cache?.places ?? []).filter((p) => on.has(p.categoryId));
  }, [cache, enabled]);
  const mineIds = useMemo(() => new Set(Object.values(mine)), [mine]);
  const selected = places.find((p) => p.id === selectedId);

  if (!home || changingAddress) {
    return (
      <div className="mx-auto max-w-xl px-5 py-10 sm:py-16">
        <h1 className="text-[32px] leading-tight font-semibold text-balance sm:text-[44px]">
          {home ? "Move your home pin" : "Where's your flat?"}
        </h1>
        <p className="mt-2 mb-6 max-w-[52ch] text-ink-2">
          Search your address to see the gyms, shops, parks and music schools within walking distance.
        </p>
        <AddressSearch
          autoFocus
          onPick={(h) => {
            update((s) => setHome(s, h));
            setChangingAddress(false);
          }}
        />
        {home && (
          <Button variant="quiet" className="mt-4" onClick={() => setChangingAddress(false)}>
            Keep {home.label}
          </Button>
        )}
      </div>
    );
  }

  const refresh = () => {
    setFailure(null);
    update((s) => ({ ...s, placesCache: null }));
  };

  return (
    <div className="flex h-full flex-col sm:flex-row-reverse">
      <div className="relative h-[44dvh] shrink-0 border-b border-line sm:h-full sm:flex-1 sm:border-b-0">
        <MapView
          home={home}
          places={places}
          categories={categories}
          mineIds={mineIds}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onMoveHome={(pos) => update((s) => moveHomePin(s, pos))}
        />
        {selected && (
          <PlaceCard
            place={selected}
            category={categories.find((c) => c.id === selected.categoryId)}
            isMine={mine[selected.categoryId] === selected.id}
            onClose={() => setSelectedId(undefined)}
          />
        )}
      </div>

      <aside className="min-h-0 flex-1 overflow-y-auto sm:w-[400px] sm:flex-none sm:border-r sm:border-line">
        <div className="px-5 pt-5 pb-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl leading-tight font-semibold">{home.label}</h1>
              <p className="text-sm text-ink-2">Rings on the map: {WALK_RINGS_MIN.join(", ")} min walk</p>
            </div>
            <Button variant="quiet" className="-mr-2 shrink-0" onClick={() => setChangingAddress(true)}>
              Change
            </Button>
          </div>

          {loading && <p className="mt-6 text-ink-2">Looking around your street…</p>}
          {failure?.key === key && (
            <div role="alert" className="mt-6 rounded-2xl border border-line p-4">
              <p>OpenStreetMap didn't answer ({failure.message}).</p>
              <Button className="mt-3" onClick={refresh}>
                Try again
              </Button>
            </div>
          )}

          <ul className="mt-5 divide-y divide-line border-y border-line">
            {enabled.map((cat) => (
              <CategoryRow
                key={cat.id}
                category={cat}
                places={places.filter((p) => p.categoryId === cat.id)}
                mineId={mine[cat.id]}
                radiusM={radiusM}
                loading={loading}
                expanded={expanded === cat.id}
                onToggle={() => setExpanded(expanded === cat.id ? null : cat.id)}
                onSelect={setSelectedId}
              />
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button onClick={() => setCategoriesOpen(true)}>
              <Icon name="plus" size={20} /> Choose places
            </Button>
            <label className="flex items-center gap-2 text-sm text-ink-2">
              Search within
              <select
                value={radiusM}
                onChange={(e) => update((s) => ({ ...s, radiusM: Number(e.target.value) }))}
                className="min-h-11 rounded-full border border-line bg-paper px-3 text-ink"
              >
                {RADIUS_CHOICES.map((r) => (
                  <option key={r.min} value={r.m}>
                    {r.min} min walk
                  </option>
                ))}
                {!RADIUS_CHOICES.some((r) => r.m === radiusM) && <option value={radiusM}>{formatDistance(radiusM)}</option>}
              </select>
            </label>
            <IconButton label="Refresh places" onClick={refresh} disabled={loading}>
              <Icon name="refresh" size={20} />
            </IconButton>
          </div>
          <p className="mt-4 text-[13px] text-ink-2">
            Walking times are estimates from straight-line distance. Place data © OpenStreetMap contributors.
            {cache && ` Updated ${new Date(cache.fetchedAt).toLocaleDateString("en-BE")}.`}
          </p>
        </div>
      </aside>

      <CategorySheet open={categoriesOpen} onClose={() => setCategoriesOpen(false)} />
    </div>
  );
}

function Minutes({ m }: { m: number }) {
  return (
    <span className="font-dim text-[26px] leading-none font-semibold tabular-nums">
      {walkMinutes(m)}
      <span className="ml-0.5 text-[15px] font-medium text-ink-2">min</span>
    </span>
  );
}

function CategoryRow({
  category,
  places,
  mineId,
  radiusM,
  loading,
  expanded,
  onToggle,
  onSelect,
}: {
  category: Category;
  places: Place[];
  mineId?: string;
  radiusM: number;
  loading: boolean;
  expanded: boolean;
  onToggle: () => void;
  onSelect: (id: string) => void;
}) {
  const mine = places.find((p) => p.id === mineId);
  const lead = mine ?? places[0];
  const others = places.filter((p) => p.id !== lead?.id).slice(0, 5);

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex min-h-16 w-full items-center gap-3 py-3 text-left"
      >
        <span className="size-3 shrink-0 rounded-full" style={{ background: category.color }} />
        <span className="min-w-0 flex-1">
          <span className="block font-medium">
            {mine ? mineLabel(category) : category.label}
          </span>
          <span className="block truncate text-sm text-ink-2">
            {lead ? lead.name : loading ? "…" : `None within ${walkMinutes(radiusM)} min`}
          </span>
        </span>
        {lead && <Minutes m={lead.distanceM} />}
      </button>
      {expanded && lead && (
        <ul className="mb-3 ml-6 space-y-1">
          {[lead, ...others].map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onSelect(p.id)}
                className="flex min-h-11 w-full items-center gap-2 rounded-lg px-2 text-left hover:bg-paper-2"
              >
                <span className="min-w-0 flex-1 truncate">
                  {p.id === mineId && <Icon name="star" size={16} className="mr-1 inline fill-current align-[-2px]" />}
                  {p.name}
                </span>
                <span className="font-dim text-ink-2 tabular-nums">{formatDistance(p.distanceM)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function PlaceCard({
  place,
  category,
  isMine,
  onClose,
}: {
  place: Place;
  category?: Category;
  isMine: boolean;
  onClose: () => void;
}) {
  const gmaps = `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`;
  return (
    <div className="absolute inset-x-3 bottom-3 z-10 rounded-2xl bg-card p-4 shadow-[0_6px_24px_rgb(0_0_0/0.18)] sm:right-auto sm:w-[340px]">
      <div className="flex items-start gap-3">
        <span className="mt-1.5 size-3 shrink-0 rounded-full" style={{ background: category?.color }} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{place.name}</p>
          <p className="text-sm text-ink-2">
            {category?.label}
            {place.address && `, ${place.address}`}
          </p>
        </div>
        <Minutes m={place.distanceM} />
        <IconButton label="Close" className="-mt-2 -mr-2" onClick={onClose}>
          <Icon name="close" size={20} />
        </IconButton>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant={isMine ? "primary" : "outline"}
          aria-pressed={isMine}
          onClick={() => update((s) => toggleMine(s, place.categoryId, place.id))}
        >
          <Icon name="star" size={18} className={isMine ? "fill-current" : ""} />
          {isMine && category ? mineLabel(category) : "Make it mine"}
        </Button>
        <a href={gmaps} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center px-3 text-[15px] underline">
          Open in Google Maps
        </a>
      </div>
    </div>
  );
}
