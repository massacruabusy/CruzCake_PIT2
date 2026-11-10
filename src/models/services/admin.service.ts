/** MODEL — Operações do painel administrativo (produtos, pedidos e indicadores). */
import { and, asc, count, desc, eq, inArray, ne, sql, sum } from "drizzle-orm";
import type { DB } from "../db/client";
import { categorias, pedidos, produtos, type StatusPedido } from "../db/schema";
import { ErroNegocio } from "../erros";
import { gerarSlug } from "../regras/texto";

export interface DadosProduto {
  nome: string;
  categoriaId: number;
  descricao: string;
  ingredientes?: string | null;
  precoCentavos: number;
  estoque: number;
  imagemUrl: string;
  ativo: boolean;
  destaque: boolean;
}

export async function listarProdutosAdmin(db: DB) {
  return db
    .select({
      id: produtos.id,
      nome: produtos.nome,
      slug: produtos.slug,
      precoCentavos: produtos.precoCentavos,
      estoque: produtos.estoque,
      ativo: produtos.ativo,
      destaque: produtos.destaque,
      imagemUrl: produtos.imagemUrl,
      categoria: categorias.nome,
    })
    .from(produtos)
    .innerJoin(categorias, eq(produtos.categoriaId, categorias.id))
    .orderBy(asc(produtos.nome));
}

export async function obterProdutoAdmin(db: DB, id: number) {
  const p = await db.query.produtos.findFirst({ where: eq(produtos.id, id) });
  if (!p) throw new ErroNegocio("NAO_ENCONTRADO", "Produto não encontrado.");
  return p;
}

async function slugUnico(db: DB, nome: string, ignorarId?: number): Promise<string> {
  const base = gerarSlug(nome) || "produto";
  let slug = base;
  for (let n = 2; ; n++) {
    const existente = await db.query.produtos.findFirst({
      where: ignorarId ? and(eq(produtos.slug, slug), ne(produtos.id, ignorarId)) : eq(produtos.slug, slug),
    });
    if (!existente) return slug;
    slug = `${base}-${n}`;
  }
}

async function garantirCategoria(db: DB, categoriaId: number) {
  const c = await db.query.categorias.findFirst({ where: eq(categorias.id, categoriaId) });
  if (!c) throw new ErroNegocio("VALIDACAO", "Categoria inválida.", { categoriaId: "Selecione uma categoria." });
}

export async function criarProduto(db: DB, dados: DadosProduto) {
  await garantirCategoria(db, dados.categoriaId);
  const slug = await slugUnico(db, dados.nome);
  const [p] = await db.insert(produtos).values({ ...dados, slug }).returning();
  return p;
}

export async function atualizarProduto(db: DB, id: number, dados: DadosProduto) {
  await obterProdutoAdmin(db, id);
  await garantirCategoria(db, dados.categoriaId);
  const slug = await slugUnico(db, dados.nome, id);
  const [p] = await db
    .update(produtos)
    .set({ ...dados, slug, atualizadoEm: new Date() })
    .where(eq(produtos.id, id))
    .returning();
  return p;
}

export async function listarPedidosAdmin(db: DB, status?: StatusPedido) {
  return db.query.pedidos.findMany({
    where: status ? eq(pedidos.status, status) : undefined,
    orderBy: desc(pedidos.criadoEm),
    with: { usuario: { columns: { nome: true, email: true } }, itens: true, pagamento: true },
    limit: 200,
  });
}

const STATUS_EM_ABERTO: StatusPedido[] = ["AGUARDANDO_PAGAMENTO", "PAGO", "EM_PREPARO", "SAIU_PARA_ENTREGA", "PRONTO_PARA_RETIRADA"];

export async function resumoPainel(db: DB) {
  const [abertos] = await db.select({ total: count() }).from(pedidos).where(inArray(pedidos.status, STATUS_EM_ABERTO));
  const [faturamento] = await db
    .select({ total: sum(pedidos.totalCentavos), quantidade: count() })
    .from(pedidos)
    .where(inArray(pedidos.status, ["PAGO", "EM_PREPARO", "SAIU_PARA_ENTREGA", "PRONTO_PARA_RETIRADA", "ENTREGUE"]));
  const estoqueBaixo = await db
    .select({ id: produtos.id, nome: produtos.nome, estoque: produtos.estoque })
    .from(produtos)
    .where(and(eq(produtos.ativo, true), sql`${produtos.estoque} <= 5`))
    .orderBy(asc(produtos.estoque));
  return {
    pedidosEmAberto: Number(abertos.total),
    pedidosPagos: Number(faturamento.quantidade),
    faturamentoCentavos: Number(faturamento.total ?? 0),
    estoqueBaixo,
  };
}
