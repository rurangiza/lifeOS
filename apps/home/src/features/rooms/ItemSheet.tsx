import { useState } from "react";
import { Button, Field, inputClass, Sheet } from "../../components/ui";
import { KIND_LABEL, STATUS_LABEL } from "../../lib/budget";
import { addItem, deleteItem, updateItem } from "../../lib/ops";
import { update } from "../../lib/store";
import { ITEM_KINDS, ITEM_STATUSES, type ItemKind, type ItemStatus, type PlanItem } from "../../lib/types";

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  names,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  names: Record<T, string>;
}) {
  return (
    <fieldset>
      <legend className="mb-1 text-sm text-ink-2">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={value === o}
            onClick={() => onChange(o)}
            className="min-h-11 rounded-full border border-line px-4 text-[15px] aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper"
          >
            {names[o]}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** Add a plan to a room, or edit one when `item` is given. */
export function ItemSheet({
  roomId,
  item,
  defaultKind = "furniture",
  open,
  onClose,
}: {
  roomId: string;
  item?: PlanItem;
  defaultKind?: ItemKind;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title={item ? "Edit plan" : "Add a plan"}>
      <ItemForm key={item?.id ?? "new"} roomId={roomId} item={item} defaultKind={defaultKind} onDone={onClose} />
    </Sheet>
  );
}

function ItemForm({
  roomId,
  item,
  defaultKind,
  onDone,
}: {
  roomId: string;
  item?: PlanItem;
  defaultKind: ItemKind;
  onDone: () => void;
}) {
  const [title, setTitle] = useState(item?.title ?? "");
  const [kind, setKind] = useState<ItemKind>(item?.kind ?? defaultKind);
  const [status, setStatus] = useState<ItemStatus>(item?.status ?? "idea");
  const [cost, setCost] = useState(item?.costEur?.toString() ?? "");
  const [link, setLink] = useState(item?.link ?? "");
  const [notes, setNotes] = useState(item?.notes ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const costNum = cost.trim() === "" ? undefined : Number(cost.replace(/\s/g, "").replace(",", "."));
  const costValid = costNum === undefined || (Number.isFinite(costNum) && costNum >= 0);
  const valid = title.trim().length > 0 && costValid;

  function save() {
    if (!valid) return;
    const fields = {
      title: title.trim(),
      kind,
      status,
      costEur: costNum,
      link: link.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    update((s) => (item ? updateItem(s, item.id, fields) : addItem(s, { roomId, ...fields })));
    onDone();
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <Field label="What">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={kind === "renovation" ? "Open up the kitchen wall" : kind === "lighting" ? "Pendant over the table" : "Linen sofa"}
          className={inputClass}
          autoFocus={!item}
        />
      </Field>
      <Segmented label="Kind" options={ITEM_KINDS} value={kind} onChange={setKind} names={KIND_LABEL} />
      <Segmented label="Status" options={ITEM_STATUSES} value={status} onChange={setStatus} names={STATUS_LABEL} />
      <Field label="Cost in euros" hint={costValid ? "Leave empty if you don't know yet." : "Enter a number, like 450."}>
        <input inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="450" className={inputClass} />
      </Field>
      <Field label="Link">
        <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" className={inputClass} />
      </Field>
      <Field label="Notes">
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputClass} />
      </Field>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary" type="submit" disabled={!valid}>
          {item ? "Save changes" : "Add plan"}
        </Button>
        {item &&
          (confirmDelete ? (
            <Button
              variant="danger"
              className="border border-danger"
              onClick={() => {
                update((s) => deleteItem(s, item.id));
                onDone();
              }}
            >
              Yes, delete it
            </Button>
          ) : (
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              Delete
            </Button>
          ))}
      </div>
    </form>
  );
}
