/**
 * Regras de negócio puras (sem banco) do pedido: frete, cupom, totais e máquina de estados.
 * Por serem funções puras, são cobertas por testes unitários em `tests/unit`.
 */
import { ErroNegocio } from "../erros";
import type { Cupom, StatusPedido, TipoEntrega } from "../db/schema";

/** RN02 — Frete fixo para entrega; grátis a partir de um valor mínimo; retirada não paga frete. */
export const FRETE_FIXO_CENTAVOS = 990;
export const FRETE_GRATIS_A_PARTIR_CENTAVOS = 12000;

/** RN04 — Limite de unidades por item no carrinho (evita pedidos atípicos/fraude). */
export const QUANTIDADE_MAXIMA_POR_ITEM = 24;

export function calcularFrete(tipoEntrega: TipoEntrega, subtotalCentavos: number): number {
  if (tipoEntrega === "RETIRADA") return 0;
  return subtotalCentavos >= FRETE_GRATIS_A_PARTIR_CENTAVOS ? 0 : FRETE_FIXO_CENTAVOS;
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

/** RN01 — total = subtotal − desconto + frete. O frete é calculado sobre o subtotal já com desconto. */
export function calcularTotais(subtotalCentavos: number, descontoCentavos: number, tipoEntrega: TipoEntrega): Totais {
  const base = subtotalCentavos - descontoCentavos;
  const freteCentavos = calcularFrete(tipoEntrega, base);
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
