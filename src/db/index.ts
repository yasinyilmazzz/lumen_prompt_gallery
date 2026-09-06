import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

const isSupabase = databaseUrl.includes("supabase");
const usesPgBouncer =
  databaseUrl.includes("pgbouncer=true") || databaseUrl.includes(":6543");

function createPool() {
  // Supabase session pooler caps shared clients (~15). Serverless must reuse one
  // small pool per instance and prefer the transaction pooler (port 6543).
  const maxConnections = Number(
    process.env.DATABASE_POOL_MAX ?? (usesPgBouncer || isSupabase ? 1 : 10)
  );

  return new Pool({
    connectionString: databaseUrl,
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
    max: maxConnections,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
  });
}

export const pool = globalForDb.__arenaNextJsPostgresqlPool ?? createPool();

if (!globalForDb.__arenaNextJsPostgresqlPool) {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
