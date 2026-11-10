/** CONTROLLER — Cadastro, login e logout. */
import { getDb } from "@/models/db/client";
import { autenticar, cadastrarUsuario } from "@/models/services/auth.service";
import { criarSessao, encerrarSessao } from "@/lib/sessao";
import { cadastroSchema, loginSchema } from "./validacoes";
import { validar } from "./http";

export async function cadastrar(corpo: unknown) {
  const dados = validar(cadastroSchema, corpo);
  const usuario = await cadastrarUsuario(await getDb(), dados);
  await criarSessao({ id: usuario.id, nome: usuario.nome, papel: usuario.papel });
  return { usuario };
}

export async function entrar(corpo: unknown) {
  const { email, senha } = validar(loginSchema, corpo);
  const usuario = await autenticar(await getDb(), email, senha);
  await criarSessao({ id: usuario.id, nome: usuario.nome, papel: usuario.papel });
  return { usuario };
}

export async function sair() {
  await encerrarSessao();
  return { ok: true };
}
