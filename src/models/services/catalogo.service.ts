/** MODEL — Vitrine: categorias e produtos visíveis ao cliente. */
import { and, asc, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import type { DB } from "../db/client";
import { categorias, produtos } from "../db/schema";
import { ErroNegocio } from "../erros";

export async function listarCategorias(db: DB) {
  return db.select().from(categorias).orderBy(asc(categorias.ordem), asc(categorias.nome));
}

export interface FiltroVitrine {
  categoriaSlug?: string;
  busca?: string;
}

/** RN09 — Apenas produtos ativos aparecem na vitrine; destaques primeiro. */
export async function listarProdutosVitrine(db: DB, filtro: FiltroVitrine = {}) {
  const condicoes: SQL[] = [eq(produtos.ativo, true)];
  if (filtro.categoriaSlug) condicoes.push(eq(categorias.slug, filtro.categoriaSlug));
  if (filtro.busca?.trim()) {
    const termo = `%${filtro.busca.trim()}%`;
    condicoes.push(or(ilike(produtos.nome, termo), ilike(produtos.descricao, termo))!);
  }
  return db
    .select({
      id: produtos.id,
      nome: produtos.nome,
      slug: produtos.slug,
      descricao: produtos.descricao,
      precoCentavos: produtos.precoCentavos,
      estoque: produtos.estoque,
      imagemUrl: produtos.imagemUrl,
      destaque: produtos.destaque,
      categoria: categorias.nome,
      categoriaSlug: categorias.slug,
    })
    .from(produtos)
    .innerJoin(categorias, eq(produtos.categoriaId, categorias.id))
    .where(and(...condicoes))
    .orderBy(desc(produtos.destaque), asc(produtos.nome));
}

export type ProdutoVitrine = Awaited<ReturnType<typeof listarProdutosVitrine>>[number];

export async function obterProdutoPorSlug(db: DB, slug: string) {
  const produto = await db.query.produtos.findFirst({
    where: and(eq(produtos.slug, slug), eq(produtos.ativo, true)),
    with: { categoria: true },
  });
  if (!produto) throw new ErroNegocio("NAO_ENCONTRADO", "Produto não encontrado ou indisponível.");
  return produto;
}
