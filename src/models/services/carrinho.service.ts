/**
 * MODEL — Precificação do carrinho.
 * O carrinho fica no navegador, mas preço, estoque e cupom SEMPRE são recalculados no servidor
 * (o cliente nunca define o valor que vai pagar).
 */
import { eq, inArray } from "drizzle-orm";
import type { DB } from "../db/client";
import { cupons, produtos, type Cupom, type TipoEntrega } from "../db/schema";
import { ErroNegocio } from "../erros";
import { calcularDescontoCupom, calcularTotais, QUANTIDADE_MAXIMA_POR_ITEM, type Totais } from "../regras/pedido";

export interface ItemCarrinhoEntrada {
  produtoId: number;
  quantidade: number;
}

export interface ItemPrecificado {
  produtoId: number;
  nome: string;
  slug: string;
  imagemUrl: string;
  precoUnitarioCentavos: number;
  quantidade: number;
  subtotalCentavos: number;
  estoqueDisponivel: number;
}

export interface ProblemaCarrinho {
  produtoId: number;
  codigo: "PRODUTO_INDISPONIVEL" | "ESTOQUE_INSUFICIENTE" | "QUANTIDADE_INVALIDA";
  mensagem: string;
}

export interface CarrinhoPrecificado extends Totais {
  itens: ItemPrecificado[];
  problemas: ProblemaCarrinho[];
  cupom: { id: number; codigo: string } | null;
  erroCupom: string | null;
}

/** Junta linhas repetidas do mesmo produto. */
function consolidar(itens: ItemCarrinhoEntrada[]): ItemCarrinhoEntrada[] {
  const mapa = new Map<number, number>();
  for (const i of itens) mapa.set(i.produtoId, (mapa.get(i.produtoId) ?? 0) + i.quantidade);
  return [...mapa.entries()].map(([produtoId, quantidade]) => ({ produtoId, quantidade }));
}

export async function buscarCupomPorCodigo(db: DB, codigo: string): Promise<Cupom | undefined> {
  return db.query.cupons.findFirst({ where: eq(cupons.codigo, codigo.trim().toUpperCase()) });
}

/**
 * Precifica o carrinho. No modo `estrito` (finalização da compra) qualquer problema vira erro;
 * no modo normal (tela do carrinho) os problemas são devolvidos para o front exibir.
 */
export async function precificarCarrinho(
  db: DB,
  entrada: ItemCarrinhoEntrada[],
  opcoes: { tipoEntrega?: TipoEntrega; codigoCupom?: string | null; estrito?: boolean } = {},
): Promise<CarrinhoPrecificado> {
  const tipoEntrega = opcoes.tipoEntrega ?? "ENTREGA";
  const itensEntrada = consolidar(entrada.filter((i) => i.quantidade !== 0));

  if (opcoes.estrito && itensEntrada.length === 0) {
    throw new ErroNegocio("CARRINHO_VAZIO", "Seu carrinho está vazio.");
  }

  const ids = itensEntrada.map((i) => i.produtoId);
  const encontrados = ids.length ? await db.select().from(produtos).where(inArray(produtos.id, ids)) : [];
  const porId = new Map(encontrados.map((p) => [p.id, p]));

  const itens: ItemPrecificado[] = [];
  const problemas: ProblemaCarrinho[] = [];

  for (const entradaItem of itensEntrada) {
    const p = porId.get(entradaItem.produtoId);
    if (!p || !p.ativo) {
      problemas.push({
        produtoId: entradaItem.produtoId,
        codigo: "PRODUTO_INDISPONIVEL",
        mensagem: `${p?.nome ?? "Um produto"} não está mais disponível e foi removido do carrinho.`,
      });
      continue;
    }
    if (!Number.isInteger(entradaItem.quantidade) || entradaItem.quantidade < 1 || entradaItem.quantidade > QUANTIDADE_MAXIMA_POR_ITEM) {
      problemas.push({
        produtoId: p.id,
        codigo: "QUANTIDADE_INVALIDA",
        mensagem: `A quantidade de ${p.nome} deve ser entre 1 e ${QUANTIDADE_MAXIMA_POR_ITEM}.`,
      });
      continue;
    }
    if (entradaItem.quantidade > p.estoque) {
      problemas.push({
        produtoId: p.id,
        codigo: "ESTOQUE_INSUFICIENTE",
        mensagem:
          p.estoque === 0
            ? `${p.nome} esgotou.`
            : `Temos apenas ${p.estoque} unidade(s) de ${p.nome} disponíveis.`,
      });
    }
    itens.push({
      produtoId: p.id,
      nome: p.nome,
      slug: p.slug,
      imagemUrl: p.imagemUrl,
      precoUnitarioCentavos: p.precoCentavos,
      quantidade: entradaItem.quantidade,
      subtotalCentavos: p.precoCentavos * entradaItem.quantidade,
      estoqueDisponivel: p.estoque,
    });
  }

  if (opcoes.estrito && problemas.length > 0) {
    const primeiro = problemas[0];
    throw new ErroNegocio(primeiro.codigo, primeiro.mensagem);
  }

  const subtotal = itens.reduce((soma, i) => soma + i.subtotalCentavos, 0);

  let descontoCentavos = 0;
  let cupom: CarrinhoPrecificado["cupom"] = null;
  let erroCupom: string | null = null;
  if (opcoes.codigoCupom?.trim()) {
    const registro = await buscarCupomPorCodigo(db, opcoes.codigoCupom);
    try {
      descontoCentavos = calcularDescontoCupom(registro, subtotal);
      cupom = { id: registro!.id, codigo: registro!.codigo };
    } catch (e) {
      if (opcoes.estrito) throw e;
      erroCupom = e instanceof Error ? e.message : "Cupom inválido.";
    }
  }

  return { itens, problemas, cupom, erroCupom, ...calcularTotais(subtotal, descontoCentavos, tipoEntrega) };
}
