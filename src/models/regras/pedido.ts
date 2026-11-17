/**
 * Regras de negócio puras (sem banco) do pedido: frete, cupom, totais e máquina de estados.
 * Por serem funções puras, são cobertas por testes unitários em `tests/unit`.
 */
import { ErroNegocio } from "../erros";
import type { Cupom, StatusPedido, TipoEntrega, ZonaEntrega } from "../db/schema";


/** RN04 — Limite de unidades por item no carrinho (evita pedidos atípicos/fraude). */
export const QUANTIDADE_MAXIMA_POR_ITEM = 24;

type ZonaFrete = Pick<ZonaEntrega, "id" | "nome" | "cepInicial" | "cepFinal" | "valorCentavos" | "freteGratisAPartirCentavos" | "prazoHoras" | "ativo">;

/**
 * RN02 — Frete por zona de entrega cadastrada pela loja.
 * Encontra a zona ativa que cobre o CEP; havendo sobreposição, vale a faixa mais específica.
 * Retorna null quando a loja não entrega no CEP.
 */
export function encontrarZona<Z extends ZonaFrete>(zonas: Z[], cep: string): Z | null {
  const alvo = cep.replace(/\D/g, "");
  if (alvo.length !== 8) return null;
  const candidatas = zonas.filter((z) => z.ativo && z.cepInicial <= alvo && alvo <= z.cepFinal);
  candidatas.sort((a, b) => Number(a.cepFinal) - Number(a.cepInicial) - (Number(b.cepFinal) - Number(b.cepInicial)));
  return candidatas[0] ?? null;
}

/** RN02 — Valor do frete na zona: grátis quando os produtos (já com desconto) atingem o mínimo da zona. */
export function calcularFrete(zona: Pick<ZonaFrete, "valorCentavos" | "freteGratisAPartirCentavos">, baseCentavos: number): number {
  if (zona.freteGratisAPartirCentavos !== null && baseCentavos >= zona.freteGratisAPartirCentavos) return 0;
  return zona.valorCentavos;
}

/** RN05 — Validação e cálculo de desconto do cupom. Lança CUPOM_INVALIDO quando não se aplica. */
export function calcularDescontoCupom(
  cupom: Pick<Cupom, "codigo" | "tipo" | "valor" | "valorMinimoCentavos" | "validoAte" | "ativo"> | null | undefined,
  subtotalCentavos: number,
  agora: Date = new Date(),
): number {
  if (!cupom || !cupom.ativo) {
    throw new ErroNegocio("CUPOM_INVALIDO", "Cupom inválido ou inexistente.");
  }
  if (cupom.validoAte && cupom.validoAte.getTime() < agora.getTime()) {
    throw new ErroNegocio("CUPOM_INVALIDO", `O cupom ${cupom.codigo} está vencido.`);
  }
  if (subtotalCentavos < cupom.valorMinimoCentavos) {
    const minimo = (cupom.valorMinimoCentavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    throw new ErroNegocio("CUPOM_INVALIDO", `O cupom ${cupom.codigo} vale para compras a partir de ${minimo}.`);
  }
  const desconto =
    cupom.tipo === "PERCENTUAL" ? Math.floor((subtotalCentavos * cupom.valor) / 100) : cupom.valor;
  // O desconto nunca pode deixar os produtos com valor negativo.
  return Math.min(desconto, subtotalCentavos);
}

export interface Totais {
  subtotalCentavos: number;
  descontoCentavos: number;
  freteCentavos: number;
  totalCentavos: number;
}

/**
 * RN01 — total = subtotal − desconto + frete. O frete é calculado sobre o subtotal já com desconto.
 * Retirada na loja não paga frete; entrega sem zona definida (CEP ainda não informado) fica com frete 0
 * e o checkout exige o CEP antes de concluir.
 */
export function calcularTotais(
  subtotalCentavos: number,
  descontoCentavos: number,
  tipoEntrega: TipoEntrega,
  zona: Pick<ZonaFrete, "valorCentavos" | "freteGratisAPartirCentavos"> | null = null,
): Totais {
  const base = subtotalCentavos - descontoCentavos;
  const freteCentavos = tipoEntrega === "RETIRADA" || !zona ? 0 : calcularFrete(zona, base);
  return { subtotalCentavos, descontoCentavos, freteCentavos, totalCentavos: base + freteCentavos };
}

/** RN07 — Máquina de estados do pedido. */
const TRANSICOES: Record<StatusPedido, StatusPedido[]> = {
  AGUARDANDO_PAGAMENTO: ["PAGO", "CANCELADO"],
  PAGO: ["EM_PREPARO", "CANCELADO"],
  EM_PREPARO: ["SAIU_PARA_ENTREGA", "PRONTO_PARA_RETIRADA", "CANCELADO"],
  SAIU_PARA_ENTREGA: ["ENTREGUE"],
  PRONTO_PARA_RETIRADA: ["ENTREGUE"],
  ENTREGUE: [],
  CANCELADO: [],
};

export function proximosStatusPossiveis(atual: StatusPedido, tipoEntrega: TipoEntrega): StatusPedido[] {
  return TRANSICOES[atual].filter((s) => {
    if (s === "SAIU_PARA_ENTREGA") return tipoEntrega === "ENTREGA";
    if (s === "PRONTO_PARA_RETIRADA") return tipoEntrega === "RETIRADA";
    return true;
  });
}

export function validarTransicao(atual: StatusPedido, novo: StatusPedido, tipoEntrega: TipoEntrega): void {
  if (!proximosStatusPossiveis(atual, tipoEntrega).includes(novo)) {
    throw new ErroNegocio(
      "TRANSICAO_STATUS_INVALIDA",
      `Não é possível mudar o pedido de "${ROTULO_STATUS[atual]}" para "${ROTULO_STATUS[novo]}".`,
    );
  }
}

/** RN08 — O cliente só pode cancelar antes de o pedido entrar em preparo. */
export function clientePodeCancelar(status: StatusPedido): boolean {
  return status === "AGUARDANDO_PAGAMENTO" || status === "PAGO";
}

export const ROTULO_STATUS: Record<StatusPedido, string> = {
  AGUARDANDO_PAGAMENTO: "Aguardando pagamento",
  PAGO: "Pagamento aprovado",
  EM_PREPARO: "Em preparo",
  SAIU_PARA_ENTREGA: "Saiu para entrega",
  PRONTO_PARA_RETIRADA: "Pronto para retirada",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};
