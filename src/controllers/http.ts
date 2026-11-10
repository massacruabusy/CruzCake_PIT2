/**
 * CONTROLLER — Utilitários compartilhados: tratamento padronizado de erros e controle de acesso.
 *
 * Formato de erro devolvido pela API:
 *   { "erro": { "codigo": "ESTOQUE_INSUFICIENTE", "mensagem": "...", "campos": { "email": "..." } } }
 */
import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { ErroNegocio } from "@/models/erros";
import { obterSessao, type Sessao } from "@/lib/sessao";

export function camposDoZod(erro: ZodError): Record<string, string> {
  const campos: Record<string, string> = {};
  for (const issue of erro.issues) {
    const chave = issue.path.join(".") || "_";
    if (!campos[chave]) campos[chave] = issue.message;
  }
  return campos;
}

/** Valida a entrada contra o schema; converte falhas em ErroNegocio("VALIDACAO"). */
export function validar<T>(schema: ZodType<T>, dados: unknown): T {
  const r = schema.safeParse(dados);
  if (!r.success) {
    const campos = camposDoZod(r.error);
    throw new ErroNegocio("VALIDACAO", Object.values(campos)[0] ?? "Dados inválidos.", campos);
  }
  return r.data;
}

export async function exigirSessao(): Promise<Sessao> {
  const s = await obterSessao();
  if (!s) throw new ErroNegocio("NAO_AUTENTICADO", "Faça login para continuar.");
  return s;
}

export async function exigirAdmin(): Promise<Sessao> {
  const s = await exigirSessao();
  if (s.papel !== "ADMIN") throw new ErroNegocio("SEM_PERMISSAO", "Acesso restrito à administração da loja.");
  return s;
}

export function respostaDeErro(e: unknown): NextResponse {
  if (e instanceof ErroNegocio) {
    return NextResponse.json(
      { erro: { codigo: e.codigo, mensagem: e.message, campos: e.campos } },
      { status: e.statusHttp },
    );
  }
  if (e instanceof ZodError) {
    return NextResponse.json(
      { erro: { codigo: "VALIDACAO", mensagem: "Dados inválidos.", campos: camposDoZod(e) } },
      { status: 400 },
    );
  }
  console.error("[erro inesperado]", e);
  return NextResponse.json(
    { erro: { codigo: "ERRO_INTERNO", mensagem: "Algo deu errado do nosso lado. Tente novamente em instantes." } },
    { status: 500 },
  );
}

/** Envolve um Route Handler: executa a ação e traduz qualquer erro para a resposta padrão. */
export async function tratar<T>(acao: () => Promise<T>, status = 200): Promise<NextResponse> {
  try {
    const dados = await acao();
    return NextResponse.json(dados ?? { ok: true }, { status });
  } catch (e) {
    return respostaDeErro(e);
  }
}

export async function lerJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new ErroNegocio("VALIDACAO", "Corpo da requisição inválido.");
  }
}
