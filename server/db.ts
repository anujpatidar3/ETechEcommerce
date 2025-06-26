import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, categories, products, inquiries } from "./schema.js";

const connectionString = process.env.DATABASE_URL!;

// Disable prefetch as it's not supported by vercel postgres
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, {
  schema: { users, categories, products, inquiries }
});

export type DB = typeof db;