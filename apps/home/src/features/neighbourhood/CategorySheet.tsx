import { useState } from "react";
import { Button, Field, Icon, IconButton, inputClass, Sheet } from "../../components/ui";
import { addCategory, removeCategory, setCategoryEnabled } from "../../lib/ops";
import { parseTagInput } from "../../lib/overpass";
import { update, useAppState } from "../../lib/store";

const CUSTOM_COLORS = ["#2b7a9b", "#c2410c", "#6d5bd0", "#0f766e", "#be185d", "#4d7c0f"];

export function CategorySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const categories = useAppState((s) => s.categories);
  const [label, setLabel] = useState("");
  const [tag, setTag] = useState("");
  const [color, setColor] = useState(CUSTOM_COLORS[0]!);
  const filter = parseTagInput(tag);
  const canAdd = label.trim().length > 0 && filter !== null;

  function add() {
    if (!filter) return;
    update((s) => addCategory(s, { label: label.trim(), color, enabled: true, filters: [filter] }));
    setLabel("");
    setTag("");
  }

  return (
    <Sheet open={open} onClose={onClose} title="What matters nearby">
      <ul className="divide-y divide-line">
        {categories.map((c) => (
          <li key={c.id} className="flex min-h-12 items-center gap-3">
            <span className="size-3 shrink-0 rounded-full" style={{ background: c.color }} />
            <label className="flex flex-1 cursor-pointer items-center justify-between gap-3 py-2">
              <span>{c.label}</span>
              <input
                type="checkbox"
                checked={c.enabled}
                onChange={(e) => update((s) => setCategoryEnabled(s, c.id, e.target.checked))}
                className="size-5 accent-[var(--cobalt)]"
              />
            </label>
            {!c.builtin && (
              <IconButton label={`Remove ${c.label}`} onClick={() => update((s) => removeCategory(s, c.id))}>
                <Icon name="trash" size={20} />
              </IconButton>
            )}
          </li>
        ))}
      </ul>

      <h3 className="mt-6 font-semibold">Add your own</h3>
      <div className="mt-3 grid gap-3">
        <Field label="Name">
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Library" className={inputClass} />
        </Field>
        <Field
          label="OpenStreetMap tag"
          hint="key=value, as on wiki.openstreetmap.org/wiki/Map_features. For example amenity=library, shop=books, leisure=swimming_pool."
        >
          <input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="amenity=library"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className={inputClass}
          />
        </Field>
        <div>
          <span className="mb-1 block text-sm text-ink-2">Pin colour</span>
          <div className="flex gap-2">
            {CUSTOM_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Colour ${c}`}
                aria-pressed={color === c}
                onClick={() => setColor(c)}
                className="size-11 rounded-full border-4 border-card aria-pressed:ring-2 aria-pressed:ring-ink"
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
        <div>
          <Button variant="primary" onClick={add} disabled={!canAdd}>
            <Icon name="plus" size={20} /> Add to the map
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
