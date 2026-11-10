/** CONTROLLER — Painel administrativo (exige papel ADMIN em todas as operações). */
import { getDb } from "@/models/db/client";
import type { StatusPedido } from "@/models/db/schema";
import { ErroNegocio } from "@/models/erros";
import {
  atualizarProduto,
  criarProduto,
  listarPedidosAdmin,
  listarProdutosAdmin,
  obterProdutoAdmin,
  resumoPainel,
} from "@/models/services/admin.service";
import { listarCategorias } from "@/models/services/catalogo.service";
import { mudarStatusPedido, obterPedido } from "@/models/services/pedido.service";
import { mudarStatusSchema, produtoSchema } from "./validacoes";
import { exigirAdmin, validar } from "./http";

const STATUS_VALIDOS = mudarStatusSchema.shape.status.options;

function idValido(id: string | number, entidade: string): number {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) throw new ErroNegocio("NAO_ENCONTRADO", `${entidade} não encontrado.`);
  return n;
}

export async function painel() {
  await exigirAdmin();
  return resumoPainel(await getDb());
}

export async function produtos() {
  await exigirAdmin();
  return listarProdutosAdmin(await getDb());
}

export async function formularioProduto(id?: string) {
  await exigirAdmin();
  const db = await getDb();
  const categorias = await listarCategorias(db);
  const produto = id ? await obterProdutoAdmin(db, idValido(id, "Produto")) : null;
  return { categorias, produto };
}

export async function novoProduto(corpo: unknown) {
  await exigirAdmin();
  return criarProduto(await getDb(), validar(produtoSchema, corpo));
}

export async function editarProduto(id: string, corpo: unknown) {
  await exigirAdmin();
  return atualizarProduto(await getDb(), idValido(id, "Produto"), validar(produtoSchema, corpo));
}

export async function pedidos(status?: string) {
  await exigirAdmin();
  const filtro = STATUS_VALIDOS.includes(status as StatusPedido) ? (status as StatusPedido) : undefined;
  return listarPedidosAdmin(await getDb(), filtro);
}

export async function pedido(id: string) {
  const sessao = await exigirAdmin();
  return obterPedido(await getDb(), idValido(id, "Pedido"), sessao);
}

export async function alterarStatusPedido(id: string, corpo: unknown) {
  await exigirAdmin();
  const { status, observacao } = validar(mudarStatusSchema, corpo);
  const p = await mudarStatusPedido(await getDb(), idValido(id, "Pedido"), status, observacao ?? undefined);
  return { pedidoId: p.id, status: p.status };
}
