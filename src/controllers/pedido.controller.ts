/** CONTROLLER — Checkout e área "Meus pedidos" (exige login). */
import { getDb } from "@/models/db/client";
import { ErroNegocio } from "@/models/erros";
import {
  cancelarPedidoCliente,
  confirmarPagamentoPix,
  criarPedido,
  listarEnderecos,
  listarPedidosDoUsuario,
  obterPedido,
} from "@/models/services/pedido.service";
import { checkoutSchema } from "./validacoes";
import { exigirSessao, validar } from "./http";

function idValido(id: string | number): number {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) throw new ErroNegocio("NAO_ENCONTRADO", "Pedido não encontrado.");
  return n;
}

export async function finalizarCompra(corpo: unknown) {
  const sessao = await exigirSessao();
  const dados = validar(checkoutSchema, corpo);
  const pedido = await criarPedido(await getDb(), sessao.id, dados);
  return { pedidoId: pedido.id, status: pedido.status };
}

export async function meusPedidos() {
  const sessao = await exigirSessao();
  return listarPedidosDoUsuario(await getDb(), sessao.id);
}

export async function detalhePedido(id: string | number) {
  const sessao = await exigirSessao();
  return obterPedido(await getDb(), idValido(id), sessao);
}

export async function confirmarPix(id: string | number) {
  const sessao = await exigirSessao();
  const p = await confirmarPagamentoPix(await getDb(), idValido(id), sessao.id);
  return { pedidoId: p.id, status: p.status };
}

export async function cancelar(id: string | number) {
  const sessao = await exigirSessao();
  const p = await cancelarPedidoCliente(await getDb(), idValido(id), sessao.id);
  return { pedidoId: p.id, status: p.status };
}

export async function meusEnderecos() {
  const sessao = await exigirSessao();
  return listarEnderecos(await getDb(), sessao.id);
}
