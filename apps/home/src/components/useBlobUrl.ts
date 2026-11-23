import { useEffect, useState } from "react";
import { getBlob } from "../lib/storage";

/** An object URL for a stored picture, revoked when the component lets go of it. */
export function useBlobUrl(blobId: string | undefined): string | undefined {
  const [entry, setEntry] = useState<{ id: string; url: string } | null>(null);

  useEffect(() => {
    if (!blobId) return;
    let url: string | undefined;
    let cancelled = false;
    getBlob(blobId).then((blob) => {
      if (cancelled || !blob) return;
      url = URL.createObjectURL(blob);
      setEntry({ id: blobId, url });
    });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [blobId]);

  return entry && entry.id === blobId ? entry.url : undefined;
}
