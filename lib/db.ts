import "server-only";
import { MongoClient, GridFSBucket, type Db, type ObjectId } from "mongodb";

export type EnquiryStatus = "new" | "contacted" | "closed";

export interface UserDoc {
  _id?: ObjectId;
  username: string;
  passwordHash: string;
  /** Bumped on password change so older sessions stop working. */
  sessionVersion: number;
  createdAt: Date;
}

export interface EnquiryDoc {
  _id?: ObjectId;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  status: EnquiryStatus;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectDoc {
  _id?: ObjectId;
  title: string;
  location: string;
  category: string;
  year: string;
  description: string;
  imageId: ObjectId;
  isPublished: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

interface RateDoc {
  key: string;
  expiresAt: Date;
}

type Cache = { client?: MongoClient; promise?: Promise<Db> };
// Reuse one client across hot reloads in development and across requests in production.
const g = globalThis as unknown as { __mongo?: Cache };
const cache: Cache = (g.__mongo ??= {});

async function connect(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Copy .env.example to .env.local.");
  const client = new MongoClient(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 5000 });
  await client.connect();
  cache.client = client;
  const db = client.db(process.env.MONGODB_DB || "mjdeveloper");
  await Promise.all([
    db.collection("users").createIndex({ username: 1 }, { unique: true }),
    db.collection("enquiries").createIndex({ createdAt: -1 }),
    db.collection("enquiries").createIndex({ status: 1, createdAt: -1 }),
    db.collection("projects").createIndex({ isPublished: 1, sortOrder: 1, createdAt: -1 }),
    db.collection("rate_limits").createIndex({ key: 1 }),
    db.collection("rate_limits").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
  ]);
  return db;
}

export function getDb(): Promise<Db> {
  if (!cache.promise) {
    cache.promise = connect().catch((err) => {
      cache.promise = undefined; // allow a retry on the next request
      throw err;
    });
  }
  return cache.promise;
}

export async function collections() {
  const db = await getDb();
  return {
    users: db.collection<UserDoc>("users"),
    enquiries: db.collection<EnquiryDoc>("enquiries"),
    projects: db.collection<ProjectDoc>("projects"),
    rateLimits: db.collection<RateDoc>("rate_limits"),
    images: new GridFSBucket(db, { bucketName: "images" }),
  };
}
