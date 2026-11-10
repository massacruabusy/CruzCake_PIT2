/**
 * Prepara o banco: aplica as migrações e roda o seed.
 *   npm run db:setup
 * Sem DATABASE_URL usa o PGlite local em `.data/pglite`; com DATABASE_URL usa o PostgreSQL informado.
 */
import { mkdirSync } from "node:fs";
import * as schema from "../src/models/db/schema";
import { PASTA_MIGRACOES, PASTA_PGLITE, type DB } from "../src/models/db/client";
import { semearBanco } from "./seed";

async function main() {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { Pool } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const { migrate } = await import("drizzle-orm/node-postgres/migrator");
    const pool = new Pool({ connectionString: url });
    const db = drizzle({ client: pool, schema });
    await migrate(db, { migrationsFolder: PASTA_MIGRACOES });
    await semearBanco(db as unknown as DB, { log: true });
    await pool.end();
  } else {
    mkdirSync(PASTA_PGLITE, { recursive: true });
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");
    const { migrate } = await import("drizzle-orm/pglite/migrator");
    const cliente = new PGlite(PASTA_PGLITE);
    const db = drizzle({ client: cliente, schema });
    await migrate(db, { migrationsFolder: PASTA_MIGRACOES });
    await semearBanco(db as unknown as DB, { log: true });
    await cliente.close();
  }
  console.log("Banco pronto.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
