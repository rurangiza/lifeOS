/**
 * Shrink a phone photo before storing it: a 12 MP picture is ~4 MB, and a
 * mood board only needs it sharp at screen size.
 */
export async function downscaleImage(
  file: Blob,
  maxSide = 1800,
): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  if (scale === 1 && file.size < 1_500_000) {
    bitmap.close();
    return { blob: file, width, height };
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not read this picture"))), "image/jpeg", 0.85),
  );
  return { blob, width, height };
}
