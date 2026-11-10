import { describe, expect, it } from "vitest";
import {
  calcularDescontoCupom,
  calcularFrete,
  calcularTotais,
  clientePodeCancelar,
  encontrarZona,
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

const zonaBase = { ativo: true, freteGratisAPartirCentavos: 12000 as number | null, prazoHoras: 2 };
const ZONAS = [
  { ...zonaBase, id: 1, nome: "Centro", cepInicial: "01000000", cepFinal: "05999999", valorCentavos: 990 },
  { ...zonaBase, id: 2, nome: "Leste", cepInicial: "08000000", cepFinal: "08499999", valorCentavos: 1490, freteGratisAPartirCentavos: 18000 },
  { ...zonaBase, id: 3, nome: "Grande SP", cepInicial: "06000000", cepFinal: "09999999", valorCentavos: 1990, freteGratisAPartirCentavos: null },
  { ...zonaBase, id: 4, nome: "Inativa", cepInicial: "20000000", cepFinal: "20999999", valorCentavos: 500, ativo: false },
];
const FRETE_CENTRO = 990;

describe("RN02 — frete por zona de entrega", () => {
  it("encontra a zona que cobre o CEP (com ou sem hífen)", () => {
    expect(encontrarZona(ZONAS, "01310-100")?.nome).toBe("Centro");
  });
  it("com zonas sobrepostas vale a faixa mais específica", () => {
    expect(encontrarZona(ZONAS, "08010000")?.nome).toBe("Leste");
    expect(encontrarZona(ZONAS, "09010000")?.nome).toBe("Grande SP");
  });
  it("CEP fora das zonas ou em zona inativa não tem entrega", () => {
    expect(encontrarZona(ZONAS, "20040002")).toBeNull();
    expect(encontrarZona(ZONAS, "123")).toBeNull();
  });
  it("cobra o valor da zona abaixo do mínimo e zera a partir dele", () => {
    expect(calcularFrete(ZONAS[0], 11999)).toBe(990);
    expect(calcularFrete(ZONAS[0], 12000)).toBe(0);
  });
  it("zona sem frete grátis sempre cobra", () => {
    expect(calcularFrete(ZONAS[2], 999999)).toBe(1990);
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
    expect(calcularTotais(5000, 500, "ENTREGA", ZONAS[0])).toEqual({
      subtotalCentavos: 5000,
      descontoCentavos: 500,
      freteCentavos: FRETE_CENTRO,
      totalCentavos: 4500 + FRETE_CENTRO,
    });
  });
  it("frete grátis é avaliado depois do desconto", () => {
    // 125,00 − 10% = 112,50 → abaixo de 120, então paga frete
    expect(calcularTotais(12500, 1250, "ENTREGA", ZONAS[0]).freteCentavos).toBe(FRETE_CENTRO);
  });
  it("retirada na loja e entrega ainda sem CEP não somam frete", () => {
    expect(calcularTotais(5000, 0, "RETIRADA", ZONAS[0]).freteCentavos).toBe(0);
    expect(calcularTotais(5000, 0, "ENTREGA", null).freteCentavos).toBe(0);
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
