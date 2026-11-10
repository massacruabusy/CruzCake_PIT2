/** CONTROLLER — Vitrine e carrinho (acesso público). */
import { getDb } from "@/models/db/client";
import { listarCategorias, listarProdutosVitrine, obterProdutoPorSlug } from "@/models/services/catalogo.service";
import { precificarCarrinho } from "@/models/services/carrinho.service";
import { precificarSchema } from "./validacoes";
import { validar } from "./http";

export async function vitrine(params: { categoria?: string; busca?: string }) {
  const db = await getDb();
  const [categorias, produtos] = await Promise.all([
    listarCategorias(db),
    listarProdutosVitrine(db, { categoriaSlug: params.categoria, busca: params.busca?.slice(0, 60) }),
  ]);
  return { categorias, produtos };
}

export async function detalheProduto(slug: string) {
  return obterProdutoPorSlug(await getDb(), slug);
}

export async function precificar(corpo: unknown) {
  const { itens, tipoEntrega, codigoCupom } = validar(precificarSchema, corpo);
  return precificarCarrinho(await getDb(), itens, { tipoEntrega, codigoCupom });
}
