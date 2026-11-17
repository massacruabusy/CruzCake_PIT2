/** MODEL — Ciclo de vida do pedido: checkout, pagamento, acompanhamento e cancelamento. */
import { and, desc, eq, gte, sql } from "drizzle-orm";
import type { DB } from "../db/client";
import {
  enderecos,
  historicoStatusPedido,
  itensPedido,
  pagamentos,
  pedidos,
  produtos,
  type MetodoPagamento,
  type StatusPedido,
  type TipoEntrega,
} from "../db/schema";
import { ErroNegocio } from "../erros";
import { clientePodeCancelar, validarTransicao } from "../regras/pedido";
import { gerarPixSimulado, processarCartaoSimulado, type DadosCartao } from "../regras/pagamento";
import { precificarCarrinho, type ItemCarrinhoEntrada } from "./carrinho.service";

export interface EnderecoEntrega {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface DadosCheckout {
  itens: ItemCarrinhoEntrada[];
  tipoEntrega: TipoEntrega;
  endereco?: EnderecoEntrega | null;
  salvarEndereco?: boolean;
  codigoCupom?: string | null;
  metodoPagamento: MetodoPagamento;
  cartao?: DadosCartao | null;
  observacao?: string | null;
}

/**
 * Cria o pedido em uma única transação:
 * reprecifica no servidor → baixa estoque de forma condicional → grava pedido, itens, pagamento e histórico.
 * Se qualquer passo falhar (estoque, cupom, cartão recusado), nada é gravado.
 */
export async function criarPedido(db: DB, usuarioId: number, dados: DadosCheckout) {
  if (dados.tipoEntrega === "ENTREGA" && !dados.endereco) {
    throw new ErroNegocio("VALIDACAO", "Informe o endereço de entrega.", { endereco: "Endereço obrigatório para entrega." });
  }
  if (dados.metodoPagamento === "CARTAO" && !dados.cartao) {
    throw new ErroNegocio("VALIDACAO", "Informe os dados do cartão.", { cartao: "Dados do cartão obrigatórios." });
  }

  return db.transaction(async (tx) => {
    const carrinho = await precificarCarrinho(tx, dados.itens, {
      tipoEntrega: dados.tipoEntrega,
      codigoCupom: dados.codigoCupom,
      cep: dados.tipoEntrega === "ENTREGA" ? dados.endereco?.cep : null,
      estrito: true,
    });

    // RN03 — baixa condicional: só debita se ainda houver estoque (protege contra compras simultâneas).
    for (const item of carrinho.itens) {
      const atualizados = await tx
        .update(produtos)
        .set({ estoque: sql`${produtos.estoque} - ${item.quantidade}`, atualizadoEm: new Date() })
        .where(and(eq(produtos.id, item.produtoId), gte(produtos.estoque, item.quantidade)))
        .returning({ id: produtos.id });
      if (atualizados.length === 0) {
        throw new ErroNegocio("ESTOQUE_INSUFICIENTE", `${item.nome} acabou de esgotar. Ajuste seu carrinho.`);
      }
    }

    // Cartão é autorizado antes de gravar o pedido: se recusar, a transação é desfeita.
    const resultadoCartao =
      dados.metodoPagamento === "CARTAO" ? processarCartaoSimulado(dados.cartao!) : null;

    const end = dados.tipoEntrega === "ENTREGA" ? dados.endereco! : null;
    const statusInicial: StatusPedido = resultadoCartao ? "PAGO" : "AGUARDANDO_PAGAMENTO";

    const [pedido] = await tx
      .insert(pedidos)
      .values({
        usuarioId,
        status: statusInicial,
        tipoEntrega: dados.tipoEntrega,
        entregaCep: end?.cep ?? null,
        entregaLogradouro: end?.logradouro ?? null,
        entregaNumero: end?.numero ?? null,
        entregaComplemento: end?.complemento || null,
        entregaBairro: end?.bairro ?? null,
        entregaCidade: end?.cidade ?? null,
        entregaUf: end?.uf?.toUpperCase() ?? null,
        zonaEntregaId: carrinho.entrega?.zona?.id ?? null,
        cupomId: carrinho.cupom?.id ?? null,
        subtotalCentavos: carrinho.subtotalCentavos,
        descontoCentavos: carrinho.descontoCentavos,
        freteCentavos: carrinho.freteCentavos,
        totalCentavos: carrinho.totalCentavos,
        observacao: dados.observacao || null,
      })
      .returning();

    await tx.insert(itensPedido).values(
      carrinho.itens.map((i) => ({
        pedidoId: pedido.id,
        produtoId: i.produtoId,
        nomeProduto: i.nome,
        precoUnitarioCentavos: i.precoUnitarioCentavos,
        quantidade: i.quantidade,
        subtotalCentavos: i.subtotalCentavos,
      })),
    );

    if (resultadoCartao) {
      await tx.insert(pagamentos).values({
        pedidoId: pedido.id,
        metodo: "CARTAO",
        status: "APROVADO",
        valorCentavos: pedido.totalCentavos,
        codigoTransacao: resultadoCartao.codigoTransacao,
        cartaoFinal: resultadoCartao.cartaoFinal,
      });
      await tx.insert(historicoStatusPedido).values([
        { pedidoId: pedido.id, status: "AGUARDANDO_PAGAMENTO", observacao: "Pedido recebido" },
        { pedidoId: pedido.id, status: "PAGO", observacao: `Cartão final ${resultadoCartao.cartaoFinal} aprovado` },
      ]);
    } else {
      const pix = gerarPixSimulado(pedido.id, pedido.totalCentavos);
      await tx.insert(pagamentos).values({
        pedidoId: pedido.id,
        metodo: "PIX",
        status: "PENDENTE",
        valorCentavos: pedido.totalCentavos,
        codigoTransacao: pix.codigoTransacao,
        pixCopiaECola: pix.pixCopiaECola,
      });
      await tx
        .insert(historicoStatusPedido)
        .values({ pedidoId: pedido.id, status: "AGUARDANDO_PAGAMENTO", observacao: "Aguardando pagamento via PIX" });
    }

    if (end && dados.salvarEndereco) {
      await tx.insert(enderecos).values({ usuarioId, ...end, complemento: end.complemento || null, uf: end.uf.toUpperCase() });
    }

    return pedido;
  });
}

export async function listarPedidosDoUsuario(db: DB, usuarioId: number) {
  return db.query.pedidos.findMany({
    where: eq(pedidos.usuarioId, usuarioId),
    orderBy: desc(pedidos.criadoEm),
    with: { itens: true },
  });
}

/** Detalhe do pedido. Cliente só vê os próprios pedidos; administrador vê todos. */
export async function obterPedido(db: DB, pedidoId: number, solicitante: { id: number; papel: string }) {
  const pedido = await db.query.pedidos.findFirst({
    where: eq(pedidos.id, pedidoId),
    with: {
      itens: true,
      pagamento: true,
      historico: { orderBy: (h, { asc }) => [asc(h.criadoEm), asc(h.id)] },
      usuario: { columns: { id: true, nome: true, email: true, telefone: true } },
    },
  });
  if (!pedido || (solicitante.papel !== "ADMIN" && pedido.usuarioId !== solicitante.id)) {
    throw new ErroNegocio("NAO_ENCONTRADO", "Pedido não encontrado.");
  }
  return pedido;
}

export type PedidoDetalhado = Awaited<ReturnType<typeof obterPedido>>;

/**
 * Muda o status do pedido respeitando a máquina de estados (RN07).
 * Cancelamento devolve os itens ao estoque (RN03); confirmação do PIX aprova o pagamento.
 */
export async function mudarStatusPedido(db: DB, pedidoId: number, novoStatus: StatusPedido, observacao?: string) {
  return db.transaction(async (tx) => {
    const pedido = await tx.query.pedidos.findFirst({ where: eq(pedidos.id, pedidoId), with: { itens: true } });
    if (!pedido) throw new ErroNegocio("NAO_ENCONTRADO", "Pedido não encontrado.");
    validarTransicao(pedido.status, novoStatus, pedido.tipoEntrega);

    if (novoStatus === "CANCELADO") {
      for (const item of pedido.itens) {
        await tx
          .update(produtos)
          .set({ estoque: sql`${produtos.estoque} + ${item.quantidade}` })
          .where(eq(produtos.id, item.produtoId));
      }
      await tx
        .update(pagamentos)
        .set({ status: "RECUSADO", atualizadoEm: new Date() })
        .where(and(eq(pagamentos.pedidoId, pedidoId), eq(pagamentos.status, "PENDENTE")));
    }
    if (novoStatus === "PAGO") {
      await tx
        .update(pagamentos)
        .set({ status: "APROVADO", atualizadoEm: new Date() })
        .where(eq(pagamentos.pedidoId, pedidoId));
    }

    const [atualizado] = await tx
      .update(pedidos)
      .set({ status: novoStatus, atualizadoEm: new Date() })
      .where(eq(pedidos.id, pedidoId))
      .returning();
    await tx.insert(historicoStatusPedido).values({ pedidoId, status: novoStatus, observacao: observacao || null });
    return atualizado;
  });
}

/** Simula a confirmação do PIX pelo banco (na vida real viria de um webhook do PSP). */
export async function confirmarPagamentoPix(db: DB, pedidoId: number, usuarioId: number) {
  const pedido = await obterPedido(db, pedidoId, { id: usuarioId, papel: "CLIENTE" });
  if (pedido.pagamento?.metodo !== "PIX" || pedido.status !== "AGUARDANDO_PAGAMENTO") {
    throw new ErroNegocio("OPERACAO_NAO_PERMITIDA", "Este pedido não está aguardando pagamento via PIX.");
  }
  return mudarStatusPedido(db, pedidoId, "PAGO", "PIX confirmado");
}

export async function cancelarPedidoCliente(db: DB, pedidoId: number, usuarioId: number) {
  const pedido = await obterPedido(db, pedidoId, { id: usuarioId, papel: "CLIENTE" });
  if (!clientePodeCancelar(pedido.status)) {
    throw new ErroNegocio(
      "OPERACAO_NAO_PERMITIDA",
      "Seu pedido já está em preparo e não pode mais ser cancelado pelo app. Fale com a loja.",
    );
  }
  return mudarStatusPedido(db, pedidoId, "CANCELADO", "Cancelado pelo cliente");
}

export async function listarEnderecos(db: DB, usuarioId: number) {
  return db.select().from(enderecos).where(eq(enderecos.usuarioId, usuarioId)).orderBy(desc(enderecos.criadoEm));
}
