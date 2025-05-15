import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { config } from "dotenv";
import * as schema from "./schema";

config({ path: ".env.local" });

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

// Initialize drizzle with the schema for relational queries support
const db = drizzle(pool, { schema });

export default db;
