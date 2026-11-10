/** CONTROLLER — Vitrine e carrinho (acesso público). */
import { getDb } from "@/models/db/client";
import { listarCategorias, listarProdutosVitrine, obterProdutoPorSlug } from "@/models/services/catalogo.service";
import { precificarCarrinho } from "@/models/services/carrinho.service";
import { cotarFrete } from "@/models/services/frete.service";
import { consultarCep } from "@/models/services/cep.service";
import { ErroNegocio } from "@/models/erros";
import { cotacaoSchema, precificarSchema } from "./validacoes";
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
  const { itens, tipoEntrega, codigoCupom, cep } = validar(precificarSchema, corpo);
  return precificarCarrinho(await getDb(), itens, { tipoEntrega, codigoCupom, cep });
}

/** Cotação de frete por CEP (pública: o visitante descobre se entregamos antes de comprar). */
export async function cotacaoFrete(params: { cep?: string | null; base?: string | null }) {
  const { cep, baseCentavos } = validar(cotacaoSchema, { cep: params.cep ?? "", baseCentavos: params.base ?? 0 });
  const [cotacao, endereco] = await Promise.all([
    cotarFrete(await getDb(), cep, baseCentavos),
    consultarCep(cep).catch(() => undefined), // serviço de CEP fora do ar não impede a cotação
  ]);
  if (endereco === null) {
    throw new ErroNegocio("VALIDACAO", "CEP não encontrado. Confira os números.", { cep: "CEP inexistente." });
  }
  return { ...cotacao, endereco: endereco ?? null };
}

/** Endereço do CEP para preencher o formulário de entrega. */
export async function enderecoPorCep(cep: string) {
  let endereco;
  try {
    endereco = await consultarCep(cep);
  } catch {
    throw new ErroNegocio("OPERACAO_NAO_PERMITIDA", "Busca de CEP indisponível no momento. Preencha o endereço manualmente.");
  }
  if (!endereco) throw new ErroNegocio("NAO_ENCONTRADO", "CEP não encontrado. Confira ou preencha o endereço manualmente.");
  return endereco;
}
