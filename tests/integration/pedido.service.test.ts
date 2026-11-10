/**
 * Testes de integração: serviços do Model rodando contra um PostgreSQL real em memória (PGlite),
 * com as mesmas migrações usadas em produção.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { criarDbEmMemoria, type DB } from "@/models/db/client";
import { produtos, usuarios } from "@/models/db/schema";
import { semearBanco } from "../../database/seed";
import { autenticar, cadastrarUsuario } from "@/models/services/auth.service";
import { listarProdutosVitrine, obterProdutoPorSlug } from "@/models/services/catalogo.service";
import { precificarCarrinho } from "@/models/services/carrinho.service";
import {
  cancelarPedidoCliente,
  confirmarPagamentoPix,
  criarPedido,
  mudarStatusPedido,
  obterPedido,
  type DadosCheckout,
} from "@/models/services/pedido.service";
import { criarProduto, resumoPainel } from "@/models/services/admin.service";
import { FRETE_FIXO_CENTAVOS } from "@/models/regras/pedido";

let db: DB;
let clienteId: number;

async function produto(slug: string) {
  const p = await db.query.produtos.findFirst({ where: eq(produtos.slug, slug) });
  if (!p) throw new Error(`produto ${slug} não existe no seed`);
  return p;
}

const endereco = {
  cep: "01310100",
  logradouro: "Avenida Paulista",
  numero: "1000",
  bairro: "Bela Vista",
  cidade: "São Paulo",
  uf: "SP",
};

const cartaoOk = { numero: "4111111111111111", nomeImpresso: "CLIENTE TESTE", validade: "12/35", cvv: "123" };

beforeEach(async () => {
  db = await criarDbEmMemoria();
  await semearBanco(db);
  const u = await db.query.usuarios.findFirst({ where: eq(usuarios.email, "cliente@docenuvem.com.br") });
  clienteId = u!.id;
});

describe("Autenticação", () => {
  it("cadastra usuário com senha criptografada e permite login", async () => {
    const u = await cadastrarUsuario(db, { nome: "Maria Silva", email: "Maria@Email.com", senha: "Senha1234" });
    expect(u.email).toBe("maria@email.com");
    expect(u.papel).toBe("CLIENTE");
    const salvo = await db.query.usuarios.findFirst({ where: eq(usuarios.id, u.id) });
    expect(salvo!.senhaHash).not.toContain("Senha1234");
    await expect(autenticar(db, "maria@email.com", "Senha1234")).resolves.toMatchObject({ id: u.id });
  });
  it("impede e-mail duplicado", async () => {
    await expect(
      cadastrarUsuario(db, { nome: "Outro", email: "cliente@docenuvem.com.br", senha: "Senha1234" }),
    ).rejects.toMatchObject({ codigo: "EMAIL_JA_CADASTRADO" });
  });
  it("recusa senha errada com mensagem genérica", async () => {
    await expect(autenticar(db, "cliente@docenuvem.com.br", "errada123")).rejects.toMatchObject({
      codigo: "CREDENCIAIS_INVALIDAS",
    });
  });
});

describe("Vitrine", () => {
  it("lista apenas produtos ativos, com destaques primeiro", async () => {
    const lista = await listarProdutosVitrine(db);
    expect(lista.find((p) => p.slug === "cafe-com-avela")).toBeUndefined();
    expect(lista[0].destaque).toBe(true);
  });
  it("filtra por categoria e por busca", async () => {
    const veganos = await listarProdutosVitrine(db, { categoriaSlug: "veganos-sem-gluten" });
    expect(veganos.every((p) => p.categoriaSlug === "veganos-sem-gluten")).toBe(true);
    const busca = await listarProdutosVitrine(db, { busca: "pistache" });
    expect(busca.map((p) => p.slug)).toEqual(["pistache-siciliano"]);
  });
  it("produto inativo não abre a página de detalhe", async () => {
    await expect(obterProdutoPorSlug(db, "cafe-com-avela")).rejects.toMatchObject({ codigo: "NAO_ENCONTRADO" });
  });
});

describe("Carrinho", () => {
  it("recalcula preços no servidor e aplica cupom", async () => {
    const red = await produto("red-velvet");
    const c = await precificarCarrinho(db, [{ produtoId: red.id, quantidade: 3 }], { codigoCupom: "bemvindo10" });
    expect(c.subtotalCentavos).toBe(3600);
    expect(c.descontoCentavos).toBe(360);
    expect(c.freteCentavos).toBe(FRETE_FIXO_CENTAVOS);
    expect(c.totalCentavos).toBe(3600 - 360 + FRETE_FIXO_CENTAVOS);
  });
  it("aponta produto esgotado e quantidade acima do estoque", async () => {
    const esgotado = await produto("coco-maracuja-sem-gluten");
    const pouco = await produto("frutas-vermelhas");
    const c = await precificarCarrinho(db, [
      { produtoId: esgotado.id, quantidade: 1 },
      { produtoId: pouco.id, quantidade: 10 },
    ]);
    expect(c.problemas.map((p) => p.codigo)).toEqual(["ESTOQUE_INSUFICIENTE", "ESTOQUE_INSUFICIENTE"]);
  });
  it("informa cupom vencido sem quebrar o carrinho", async () => {
    const red = await produto("red-velvet");
    const c = await precificarCarrinho(db, [{ produtoId: red.id, quantidade: 1 }], { codigoCupom: "NATAL2025" });
    expect(c.descontoCentavos).toBe(0);
    expect(c.erroCupom).toMatch(/vencido/);
  });
});

describe("Checkout e ciclo do pedido", () => {
  async function checkoutBase(extra: Partial<DadosCheckout> = {}): Promise<DadosCheckout> {
    const choc = await produto("chocolate-belga");
    return {
      itens: [{ produtoId: choc.id, quantidade: 2 }],
      tipoEntrega: "ENTREGA",
      endereco,
      metodoPagamento: "CARTAO",
      cartao: cartaoOk,
      ...extra,
    };
  }

  it("pedido com cartão aprovado nasce PAGO, baixa estoque e registra histórico", async () => {
    const antes = (await produto("chocolate-belga")).estoque;
    const pedido = await criarPedido(db, clienteId, await checkoutBase());
    expect(pedido.status).toBe("PAGO");
    expect((await produto("chocolate-belga")).estoque).toBe(antes - 2);
    const det = await obterPedido(db, pedido.id, { id: clienteId, papel: "CLIENTE" });
    expect(det.pagamento?.status).toBe("APROVADO");
    expect(det.pagamento?.cartaoFinal).toBe("1111");
    expect(det.historico.map((h) => h.status)).toEqual(["AGUARDANDO_PAGAMENTO", "PAGO"]);
  });

  it("cartão recusado não cria pedido nem baixa estoque (rollback)", async () => {
    const antes = (await produto("chocolate-belga")).estoque;
    await expect(
      criarPedido(db, clienteId, await checkoutBase({ cartao: { ...cartaoOk, numero: "4000000000020000" } })),
    ).rejects.toMatchObject({ codigo: "PAGAMENTO_RECUSADO" });
    expect((await produto("chocolate-belga")).estoque).toBe(antes);
    expect(await db.query.pedidos.findMany()).toHaveLength(0);
  });

  it("não vende acima do estoque", async () => {
    const pouco = await produto("frutas-vermelhas");
    await expect(
      criarPedido(db, clienteId, await checkoutBase({ itens: [{ produtoId: pouco.id, quantidade: 5 }] })),
    ).rejects.toMatchObject({ codigo: "ESTOQUE_INSUFICIENTE" });
  });

  it("entrega exige endereço; retirada não cobra frete", async () => {
    await expect(criarPedido(db, clienteId, await checkoutBase({ endereco: null }))).rejects.toMatchObject({
      codigo: "VALIDACAO",
    });
    const p = await criarPedido(db, clienteId, await checkoutBase({ tipoEntrega: "RETIRADA", endereco: null }));
    expect(p.freteCentavos).toBe(0);
    expect(p.entregaCep).toBeNull();
  });

  it("PIX: pedido aguarda pagamento e é liberado na confirmação", async () => {
    const p = await criarPedido(db, clienteId, await checkoutBase({ metodoPagamento: "PIX", cartao: null }));
    expect(p.status).toBe("AGUARDANDO_PAGAMENTO");
    const det = await obterPedido(db, p.id, { id: clienteId, papel: "CLIENTE" });
    expect(det.pagamento?.pixCopiaECola).toContain("BR.GOV.BCB.PIX");
    const pago = await confirmarPagamentoPix(db, p.id, clienteId);
    expect(pago.status).toBe("PAGO");
  });

  it("cancelamento pelo cliente devolve o estoque; após preparo não pode cancelar", async () => {
    const antes = (await produto("chocolate-belga")).estoque;
    const p1 = await criarPedido(db, clienteId, await checkoutBase());
    await cancelarPedidoCliente(db, p1.id, clienteId);
    expect((await produto("chocolate-belga")).estoque).toBe(antes);

    const p2 = await criarPedido(db, clienteId, await checkoutBase());
    await mudarStatusPedido(db, p2.id, "EM_PREPARO");
    await expect(cancelarPedidoCliente(db, p2.id, clienteId)).rejects.toMatchObject({
      codigo: "OPERACAO_NAO_PERMITIDA",
    });
  });

  it("fluxo completo da loja até a entrega", async () => {
    const p = await criarPedido(db, clienteId, await checkoutBase());
    await mudarStatusPedido(db, p.id, "EM_PREPARO");
    await mudarStatusPedido(db, p.id, "SAIU_PARA_ENTREGA");
    const final = await mudarStatusPedido(db, p.id, "ENTREGUE");
    expect(final.status).toBe("ENTREGUE");
    await expect(mudarStatusPedido(db, p.id, "CANCELADO")).rejects.toMatchObject({
      codigo: "TRANSICAO_STATUS_INVALIDA",
    });
  });

  it("cliente não enxerga pedido de outro cliente", async () => {
    const p = await criarPedido(db, clienteId, await checkoutBase());
    const outro = await cadastrarUsuario(db, { nome: "Outro Cliente", email: "outro@x.com", senha: "Senha1234" });
    await expect(obterPedido(db, p.id, { id: outro.id, papel: "CLIENTE" })).rejects.toMatchObject({
      codigo: "NAO_ENCONTRADO",
    });
  });
});

describe("Administração", () => {
  it("cria produto com slug único", async () => {
    const cat = await db.query.categorias.findFirst();
    const dados = {
      nome: "Red Velvet",
      categoriaId: cat!.id,
      descricao: "Versão especial do red velvet.",
      precoCentavos: 1300,
      estoque: 5,
      imagemUrl: "/img/cupcakes/red-velvet.svg",
      ativo: true,
      destaque: false,
    };
    const p = await criarProduto(db, dados);
    expect(p.slug).toBe("red-velvet-2");
  });
  it("resumo do painel soma apenas pedidos pagos", async () => {
    const choc = await produto("chocolate-belga");
    await criarPedido(db, clienteId, {
      itens: [{ produtoId: choc.id, quantidade: 1 }],
      tipoEntrega: "RETIRADA",
      metodoPagamento: "PIX",
    });
    await criarPedido(db, clienteId, {
      itens: [{ produtoId: choc.id, quantidade: 1 }],
      tipoEntrega: "RETIRADA",
      metodoPagamento: "CARTAO",
      cartao: cartaoOk,
    });
    const r = await resumoPainel(db);
    expect(r.pedidosEmAberto).toBe(2);
    expect(r.pedidosPagos).toBe(1);
    expect(r.faturamentoCentavos).toBe(1100);
    expect(r.estoqueBaixo.map((p) => p.nome)).toContain("Frutas Vermelhas");
  });
});
