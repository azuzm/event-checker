import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn(
    "DATABASE_URL not set. storage will fail if using DatabaseStorage.",
  );
}

// @ts-ignore
export const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL }) : null;
// @ts-ignore
export const db = process.env.DATABASE_URL ? drizzle(pool, { schema }) : null;
