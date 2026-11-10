import { describe, expect, it } from "vitest";
import {
  calcularDescontoCupom,
  calcularFrete,
  calcularTotais,
  clientePodeCancelar,
  FRETE_FIXO_CENTAVOS,
  proximosStatusPossiveis,
  validarTransicao,
} from "@/models/regras/pedido";
import { ErroNegocio } from "@/models/erros";

const cupomBase = {
  codigo: "TESTE",
  tipo: "PERCENTUAL" as const,
  valor: 10,
  valorMinimoCentavos: 3000,
  validoAte: null as Date | null,
  ativo: true,
};

describe("RN02 — frete", () => {
  it("retirada na loja não cobra frete", () => {
    expect(calcularFrete("RETIRADA", 500)).toBe(0);
  });
  it("entrega abaixo de R$ 120 cobra frete fixo", () => {
    expect(calcularFrete("ENTREGA", 11999)).toBe(FRETE_FIXO_CENTAVOS);
  });
  it("entrega a partir de R$ 120 tem frete grátis", () => {
    expect(calcularFrete("ENTREGA", 12000)).toBe(0);
  });
});

describe("RN05 — cupom de desconto", () => {
  it("aplica desconto percentual arredondando para baixo", () => {
    expect(calcularDescontoCupom(cupomBase, 3333)).toBe(333);
  });
  it("aplica desconto de valor fixo", () => {
    expect(calcularDescontoCupom({ ...cupomBase, tipo: "VALOR_FIXO", valor: 500 }, 4000)).toBe(500);
  });
  it("desconto nunca ultrapassa o subtotal", () => {
    expect(calcularDescontoCupom({ ...cupomBase, tipo: "VALOR_FIXO", valor: 9000, valorMinimoCentavos: 0 }, 1000)).toBe(1000);
  });
  it("recusa cupom inexistente", () => {
    expect(() => calcularDescontoCupom(undefined, 5000)).toThrowError(ErroNegocio);
  });
  it("recusa cupom inativo", () => {
    expect(() => calcularDescontoCupom({ ...cupomBase, ativo: false }, 5000)).toThrow(/inválido/);
  });
  it("recusa cupom vencido", () => {
    const ontem = new Date(Date.now() - 86400000);
    expect(() => calcularDescontoCupom({ ...cupomBase, validoAte: ontem }, 5000)).toThrow(/vencido/);
  });
  it("recusa cupom abaixo do valor mínimo", () => {
    expect(() => calcularDescontoCupom(cupomBase, 2999)).toThrow(/a partir de/);
  });
});

describe("RN01 — totais", () => {
  it("total = subtotal − desconto + frete", () => {
    expect(calcularTotais(5000, 500, "ENTREGA")).toEqual({
      subtotalCentavos: 5000,
      descontoCentavos: 500,
      freteCentavos: FRETE_FIXO_CENTAVOS,
      totalCentavos: 4500 + FRETE_FIXO_CENTAVOS,
    });
  });
  it("frete grátis é avaliado depois do desconto", () => {
    // 125,00 − 10% = 112,50 → abaixo de 120, então paga frete
    expect(calcularTotais(12500, 1250, "ENTREGA").freteCentavos).toBe(FRETE_FIXO_CENTAVOS);
  });
});

describe("RN07 — máquina de estados do pedido", () => {
  it("pedido de entrega em preparo pode sair para entrega, mas não ficar pronto para retirada", () => {
    expect(proximosStatusPossiveis("EM_PREPARO", "ENTREGA")).toEqual(["SAIU_PARA_ENTREGA", "CANCELADO"]);
  });
  it("pedido de retirada em preparo pode ficar pronto para retirada", () => {
    expect(proximosStatusPossiveis("EM_PREPARO", "RETIRADA")).toEqual(["PRONTO_PARA_RETIRADA", "CANCELADO"]);
  });
  it("não permite pular etapas", () => {
    expect(() => validarTransicao("AGUARDANDO_PAGAMENTO", "ENTREGUE", "ENTREGA")).toThrow(ErroNegocio);
  });
  it("pedido entregue ou cancelado é estado final", () => {
    expect(proximosStatusPossiveis("ENTREGUE", "ENTREGA")).toEqual([]);
    expect(proximosStatusPossiveis("CANCELADO", "ENTREGA")).toEqual([]);
  });
  it("RN08 — cliente só cancela antes do preparo", () => {
    expect(clientePodeCancelar("AGUARDANDO_PAGAMENTO")).toBe(true);
    expect(clientePodeCancelar("PAGO")).toBe(true);
    expect(clientePodeCancelar("EM_PREPARO")).toBe(false);
  });
});
