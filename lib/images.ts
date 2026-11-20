import "server-only";
import { Readable } from "node:stream";
import type { ObjectId } from "mongodb";
import { collections } from "./db";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Detects JPEG, PNG or WebP from the file's first bytes rather than trusting the browser. */
function sniff(buf: Uint8Array): string | null {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) return "image/webp";
  return null;
}

export class ImageError extends Error {}

export async function saveImage(file: File): Promise<ObjectId> {
  if (file.size === 0) throw new ImageError("Please choose a photo.");
  if (file.size > MAX_IMAGE_BYTES) throw new ImageError("The photo must be 5 MB or smaller.");
  const buf = new Uint8Array(await file.arrayBuffer());
  const contentType = sniff(buf);
  if (!contentType) throw new ImageError("Only JPG, PNG or WebP photos are allowed.");
  const { images } = await collections();
  const upload = images.openUploadStream(file.name.slice(0, 100) || "photo", { metadata: { contentType } });
  await new Promise<void>((resolve, reject) => {
    Readable.from(Buffer.from(buf)).pipe(upload).on("finish", () => resolve()).on("error", reject);
  });
  return upload.id as ObjectId;
}

export async function deleteImage(id: ObjectId): Promise<void> {
  const { images } = await collections();
  try {
    await images.delete(id);
  } catch {
    // already gone
  }
}
