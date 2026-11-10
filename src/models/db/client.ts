/**
 * MODEL — Conexão com o banco.
 *
 * - Produção: PostgreSQL real via `DATABASE_URL` (ex.: Neon, Supabase, RDS).
 * - Desenvolvimento/testes: PGlite (PostgreSQL compilado para WASM), persistido em `.data/pglite`,
 *   para que o projeto rode sem instalar nenhum servidor de banco.
 * Os dois caminhos usam o mesmo dialeto (PostgreSQL) e as mesmas migrações.
 */
import path from "node:path";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";

export type DB = PgDatabase<PgQueryResultHKT, typeof schema>;

const globalParaDb = globalThis as unknown as { __cupcakesDb?: Promise<DB> };

export const PASTA_MIGRACOES = path.join(process.cwd(), "database", "migrations");
export const PASTA_PGLITE = path.join(process.cwd(), ".data", "pglite");

async function criarConexao(): Promise<DB> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { Pool } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const pool = new Pool({ connectionString: url, max: 5 });
    return drizzle({ client: pool, schema }) as unknown as DB;
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const cliente = new PGlite(PASTA_PGLITE);
  return drizzle({ client: cliente, schema }) as unknown as DB;
}

/** Retorna a conexão única da aplicação (reaproveitada entre recarregamentos em dev). */
export function getDb(): Promise<DB> {
  if (!globalParaDb.__cupcakesDb) {
    globalParaDb.__cupcakesDb = criarConexao();
  }
  return globalParaDb.__cupcakesDb;
}

/** Banco em memória com as migrações aplicadas — usado nos testes de integração. */
export async function criarDbEmMemoria(): Promise<DB> {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const cliente = new PGlite();
  const db = drizzle({ client: cliente, schema });
  await migrate(db, { migrationsFolder: PASTA_MIGRACOES });
  return db as unknown as DB;
}
