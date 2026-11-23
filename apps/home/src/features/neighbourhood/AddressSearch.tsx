import { useEffect, useState } from "react";
import { Icon, inputClass } from "../../components/ui";
import { searchAddress } from "../../lib/geocode";
import type { HomeLocation } from "../../lib/types";

export function AddressSearch({ onPick, autoFocus }: { onPick: (home: HomeLocation) => void; autoFocus?: boolean }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<HomeLocation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const query = q.trim();
    if (query.length < 4) return;
    const ctrl = new AbortController();
    const timer = setTimeout(() => {
      setSearching(true);
      searchAddress(query, ctrl.signal)
        .then((r) => {
          setResults(r);
          setError(r.length ? null : "No address found. Try adding the postcode, like 1090.");
        })
        .catch((err: unknown) => {
          if (!ctrl.signal.aborted) setError(`Address search is unreachable (${String(err)}).`);
        })
        .finally(() => !ctrl.signal.aborted && setSearching(false));
    }, 350);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [q]);

  const short = q.trim().length < 4;

  return (
    <div>
      <div className="relative">
        <Icon name="search" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-2" />
        <input
          type="search"
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Street, number and postcode"
          aria-label="Your address"
          className={`${inputClass} pl-10`}
        />
      </div>
      {!short && searching && <p className="mt-2 text-sm text-ink-2">Searching…</p>}
      {!short && error && <p className="mt-2 text-sm text-danger">{error}</p>}
      {!short && results.length > 0 && (
        <ul className="mt-2 divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
          {results.map((r) => (
            <li key={`${r.lat},${r.lon}`}>
              <button
                type="button"
                onClick={() => onPick(r)}
                className="flex min-h-12 w-full items-center px-3 text-left hover:bg-paper-2"
              >
                {r.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
