import "server-only";
import { collections } from "./db";

/**
 * Sliding-window counter stored in MongoDB, so limits hold across server instances.
 * Expired entries are removed by the TTL index on expiresAt.
 */
export async function hits(key: string): Promise<number> {
  const { rateLimits } = await collections();
  return rateLimits.countDocuments({ key, expiresAt: { $gt: new Date() } });
}

export async function record(key: string, windowSeconds: number): Promise<void> {
  const { rateLimits } = await collections();
  await rateLimits.insertOne({ key, expiresAt: new Date(Date.now() + windowSeconds * 1000) });
}

export async function reset(key: string): Promise<void> {
  const { rateLimits } = await collections();
  await rateLimits.deleteMany({ key });
}
