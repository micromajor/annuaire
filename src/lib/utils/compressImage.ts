import sharp from "sharp";

/**
 * Compresse une image avant stockage en base.
 * - SVG → conservé tel quel (déjà léger et non rasterisable par Sharp)
 * - Tout le reste → WebP qualité 80, max 1200px côté le plus long
 * Retourne { data: Buffer, mimeType: string }
 */
/** Convertit un Buffer en Uint8Array<ArrayBuffer> attendu par Prisma v7 */
function toUint8Array(buf: Buffer): Uint8Array<ArrayBuffer> {
  const ab = new ArrayBuffer(buf.byteLength);
  new Uint8Array(ab).set(buf);
  return new Uint8Array(ab);
}

export async function compressImage(
  buffer: Buffer,
  mimeType: string
): Promise<{ data: Uint8Array<ArrayBuffer>; mimeType: string }> {
  if (mimeType === "image/svg+xml") {
    return { data: toUint8Array(buffer), mimeType };
  }

  const compressed = await sharp(buffer)
    .resize(1200, 1200, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 80 })
    .toBuffer();

  return { data: toUint8Array(compressed), mimeType: "image/webp" };
}
