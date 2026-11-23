import { useRef, useState } from "react";
import { Button, Field, Icon, inputClass, Sheet } from "../../components/ui";
import { useBlobUrl } from "../../components/useBlobUrl";
import { downscaleImage } from "../../lib/images";
import { addPhoto, deletePhoto, updatePhoto } from "../../lib/ops";
import { deleteBlob, putBlob } from "../../lib/storage";
import { update } from "../../lib/store";
import type { Photo } from "../../lib/types";

export function Moodboard({ roomId, photos }: { roomId: string; photos: Photo[] }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const open = photos.find((p) => p.id === openId);

  async function onFiles(files: FileList) {
    setError(null);
    const list = [...files];
    setAdding(list.length);
    let failed = 0;
    for (const file of list) {
      try {
        const { blob } = await downscaleImage(file);
        const blobId = await putBlob(blob);
        update((s) => addPhoto(s, roomId, blobId));
      } catch {
        failed++;
      }
      setAdding((n) => n - 1);
    }
    if (failed) setError(`${failed} of ${list.length} files couldn't be read as pictures.`);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Inspiration</h2>
        <Button onClick={() => fileRef.current?.click()} disabled={adding > 0}>
          <Icon name="image" size={20} /> {adding > 0 ? `Adding ${adding}…` : "Add photos"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files?.length && onFiles(e.target.files)}
        />
      </div>
      {error && <p className="mb-2 text-sm text-danger">{error}</p>}
      {photos.length === 0 ? (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex min-h-36 w-full items-center justify-center rounded-2xl border-2 border-dashed border-line px-6 text-center text-ink-2 hover:border-ink-2"
        >
          Add screenshots of furniture, colours and rooms you like. Save them from Pinterest, shop pages or your camera
          roll first.
        </button>
      ) : (
        // Masonry columns keep tall and wide pictures at their own shape.
        <ul className="columns-2 gap-2 sm:columns-3">
          {photos.map((p) => (
            <Thumb key={p.id} photo={p} onOpen={() => setOpenId(p.id)} />
          ))}
        </ul>
      )}
      <Sheet open={Boolean(open)} onClose={() => setOpenId(null)} title={open?.caption || "Inspiration"}>
        {open && <PhotoDetail key={open.id} photo={open} onDone={() => setOpenId(null)} />}
      </Sheet>
    </section>
  );
}

function Thumb({ photo, onOpen }: { photo: Photo; onOpen: () => void }) {
  const url = useBlobUrl(photo.blobId);
  return (
    <li className="mb-2 break-inside-avoid">
      <button type="button" onClick={onOpen} className="block w-full overflow-hidden rounded-xl bg-paper-2">
        {url ? <img src={url} alt={photo.caption ?? ""} className="block h-auto w-full" /> : <span className="block h-32" />}
        {photo.caption && <span className="block px-2 py-1.5 text-left text-sm">{photo.caption}</span>}
      </button>
    </li>
  );
}

function PhotoDetail({ photo, onDone }: { photo: Photo; onDone: () => void }) {
  const url = useBlobUrl(photo.blobId);
  const [caption, setCaption] = useState(photo.caption ?? "");
  const [link, setLink] = useState(photo.link ?? "");
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="grid gap-4">
      {url && <img src={url} alt={photo.caption ?? ""} className="max-h-[55dvh] w-full rounded-xl object-contain" />}
      <Field label="Caption">
        <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Oak shelves above the desk" className={inputClass} />
      </Field>
      <Field label="Where it's from">
        <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" className={inputClass} />
      </Field>
      {photo.link && (
        <a href={photo.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">
          <Icon name="link" size={18} /> Open link
        </a>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="primary"
          onClick={() => {
            update((s) => updatePhoto(s, photo.id, { caption: caption.trim() || undefined, link: link.trim() || undefined }));
            onDone();
          }}
        >
          Save
        </Button>
        {confirming ? (
          <Button
            variant="danger"
            className="border border-danger"
            onClick={async () => {
              update((s) => deletePhoto(s, photo.id));
              onDone();
              await deleteBlob(photo.blobId);
            }}
          >
            Yes, remove photo
          </Button>
        ) : (
          <Button variant="danger" onClick={() => setConfirming(true)}>
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
