import { describe, expect, it } from "vitest";
import { gerarPixSimulado, luhnValido, processarCartaoSimulado, validadeCartaoOk } from "@/models/regras/pagamento";
import { formatarCentavos, reaisParaCentavos } from "@/models/regras/dinheiro";
import { gerarSlug } from "@/models/regras/texto";

const agora = new Date("2026-06-15T12:00:00");
const cartaoOk = { numero: "4111 1111 1111 1111", nomeImpresso: "FULANO DE TAL", validade: "12/30", cvv: "123" };

describe("RN06 — pagamento simulado com cartão", () => {
  it("valida número pelo algoritmo de Luhn", () => {
    expect(luhnValido("4111111111111111")).toBe(true);
    expect(luhnValido("4111111111111112")).toBe(false);
    expect(luhnValido("123")).toBe(false);
  });
  it("valida a data de validade MM/AA", () => {
    expect(validadeCartaoOk("06/26", agora)).toBe(true);
    expect(validadeCartaoOk("05/26", agora)).toBe(false);
    expect(validadeCartaoOk("13/30", agora)).toBe(false);
    expect(validadeCartaoOk("1230", agora)).toBe(false);
  });
  it("aprova cartão válido e guarda só os 4 últimos dígitos", () => {
    const r = processarCartaoSimulado(cartaoOk, agora);
    expect(r.aprovado).toBe(true);
    expect(r.cartaoFinal).toBe("1111");
    expect(r.codigoTransacao).toMatch(/^CARD-/);
  });
  it("recusa cartão terminado em 0000 (simulação de recusa do emissor)", () => {
    // Número válido no Luhn, terminado em 0000 (documentado no manual como "cartão de recusa").
    const numeroRecusado = "4000000000020000";
    expect(luhnValido(numeroRecusado)).toBe(true);
    expect(() => processarCartaoSimulado({ ...cartaoOk, numero: numeroRecusado }, agora)).toThrow(/recusado/);
  });
  it("recusa cartão vencido", () => {
    expect(() => processarCartaoSimulado({ ...cartaoOk, validade: "01/20" }, agora)).toThrow(/vencido/);
  });
  it("recusa CVV inválido", () => {
    expect(() => processarCartaoSimulado({ ...cartaoOk, cvv: "12" }, agora)).toThrow(/CVV/);
  });
});

describe("PIX simulado", () => {
  it("gera código copia-e-cola com o valor do pedido", () => {
    const pix = gerarPixSimulado(42, 4590);
    expect(pix.pixCopiaECola).toContain("45.90");
    expect(pix.pixCopiaECola).toContain("PED000042");
    expect(pix.codigoTransacao).toMatch(/^PIX-/);
  });
});

describe("utilitários", () => {
  it("formata centavos em reais", () => {
    expect(formatarCentavos(1250).replace(/\s/g, " ")).toBe("R$ 12,50");
  });
  it("converte texto em reais para centavos", () => {
    expect(reaisParaCentavos("12,50")).toBe(1250);
    expect(reaisParaCentavos("1.234,56")).toBe(123456);
    expect(reaisParaCentavos("abc")).toBeNaN();
  });
  it("gera slug sem acentos", () => {
    expect(gerarSlug("Limão Siciliano & Merengue!")).toBe("limao-siciliano-merengue");
  });
});
