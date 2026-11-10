/** Garante que um banco já em produção com a v1 recebe os dados novos da v2 ao rodar o setup. */
import { expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { criarDbEmMemoria } from "@/models/db/client";
import { categorias, zonasEntrega } from "@/models/db/schema";
import { semearBanco } from "../../database/seed";

it("banco já em uso (v1) recebe as zonas de entrega e a nova ordem de categorias, sem duplicar", async () => {
  const db = await criarDbEmMemoria();
  await db.insert(categorias).values({ nome: "Caixas e kits", slug: "caixas-e-kits", ordem: 4 });
  await semearBanco(db);
  await semearBanco(db);
  expect(await db.select().from(zonasEntrega)).toHaveLength(3);
  const [kits] = await db.select().from(categorias).where(eq(categorias.slug, "caixas-e-kits"));
  expect(kits.ordem).toBe(2);
});
