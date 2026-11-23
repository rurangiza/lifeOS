import { useRef, useState } from "react";
import { exportBackup, importBackup } from "../lib/storage";
import { getState, hydrate } from "../lib/store";
import { Button, Sheet } from "./ui";

export function BackupSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<File | null>(null);

  async function onExport() {
    setBusy(true);
    setStatus(null);
    try {
      const blob = await exportBackup(getState());
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `home-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setStatus(`Backup exported (${(blob.size / 1_000_000).toFixed(1)} MB).`);
    } catch (err) {
      setStatus(`Export failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  async function onImport(file: File) {
    setBusy(true);
    setStatus(null);
    try {
      hydrate(await importBackup(await file.text()));
      setStatus("Backup restored.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
      setPending(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Backup and restore">
      <p className="text-ink-2">
        Everything is saved in this browser only. Export a backup to move it to another device or keep a copy.
        On iPhone, add Home to your Home Screen: Safari clears data of sites you haven't opened for a week.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button variant="primary" onClick={onExport} disabled={busy}>
          Export backup
        </Button>
        <Button onClick={() => fileRef.current?.click()} disabled={busy}>
          Restore from file
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => setPending(e.target.files?.[0] ?? null)}
        />
      </div>
      {pending ? (
        <div className="mt-4 rounded-2xl border border-line p-4">
          <p>
            Replace everything here with <strong>{pending.name}</strong>? What isn't in that backup will be lost.
          </p>
          <div className="mt-3 flex gap-2">
            <Button variant="primary" onClick={() => onImport(pending)} disabled={busy}>
              Replace with backup
            </Button>
            <Button variant="quiet" onClick={() => setPending(null)}>
              Keep current data
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-[13px] text-ink-2">Restoring replaces what is here with the backup's contents.</p>
      )}
      {status && (
        <p role="status" className="mt-4 rounded-xl bg-paper-2 px-3 py-2 text-sm">
          {status}
        </p>
      )}
    </Sheet>
  );
}
