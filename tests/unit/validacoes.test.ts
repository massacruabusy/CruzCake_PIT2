import { describe, expect, it } from "vitest";
import { cadastroSchema, checkoutSchema, enderecoSchema } from "@/controllers/validacoes";

describe("Validação de entrada (Controller)", () => {
  const cadastroOk = {
    nome: "Ana Souza",
    email: "ana@email.com",
    telefone: "(11) 91234-5678",
    senha: "Senha1234",
    confirmacaoSenha: "Senha1234",
  };

  it("aceita cadastro válido", () => {
    expect(cadastroSchema.safeParse(cadastroOk).success).toBe(true);
  });
  it("RN10 — exige senha com letras e números", () => {
    const r = cadastroSchema.safeParse({ ...cadastroOk, senha: "somenteletras", confirmacaoSenha: "somenteletras" });
    expect(r.success).toBe(false);
    expect(r.error!.issues[0].message).toMatch(/número/);
  });
  it("aponta confirmação de senha diferente no campo correto", () => {
    const r = cadastroSchema.safeParse({ ...cadastroOk, confirmacaoSenha: "Outra1234" });
    expect(r.error!.issues[0].path).toEqual(["confirmacaoSenha"]);
  });
  it("normaliza CEP e UF do endereço", () => {
    const r = enderecoSchema.parse({
      cep: "01310-100",
      logradouro: "Av. Paulista",
      numero: "1000",
      bairro: "Bela Vista",
      cidade: "São Paulo",
      uf: "sp",
    });
    expect(r.cep).toBe("01310100");
    expect(r.uf).toBe("SP");
  });
  it("checkout com entrega exige endereço e cartão exige dados", () => {
    const r = checkoutSchema.safeParse({
      itens: [{ produtoId: 1, quantidade: 1 }],
      tipoEntrega: "ENTREGA",
      metodoPagamento: "CARTAO",
    });
    expect(r.success).toBe(false);
    expect(r.error!.issues.map((i) => i.path[0])).toEqual(["endereco", "cartao"]);
  });
  it("recusa carrinho vazio e quantidade acima do limite", () => {
    expect(checkoutSchema.safeParse({ itens: [], tipoEntrega: "RETIRADA", metodoPagamento: "PIX" }).success).toBe(false);
    expect(
      checkoutSchema.safeParse({ itens: [{ produtoId: 1, quantidade: 99 }], tipoEntrega: "RETIRADA", metodoPagamento: "PIX" })
        .success,
    ).toBe(false);
  });
});
