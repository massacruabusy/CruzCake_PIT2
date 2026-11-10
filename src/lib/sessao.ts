/**
 * Sessão do usuário: JWT assinado (HS256) guardado em cookie httpOnly.
 * Só contém id, nome e papel — nenhum dado sensível.
 */
import "server-only";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import type { PapelUsuario } from "@/models/db/schema";

export const NOME_COOKIE = "sessao_cupcakes";
const DURACAO_SEGUNDOS = 60 * 60 * 24 * 7; // 7 dias

export interface Sessao {
  id: number;
  nome: string;
  papel: PapelUsuario;
}

function chave(): Uint8Array {
  const segredo = process.env.SESSION_SECRET;
  if (!segredo && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET não configurado.");
  }
  return new TextEncoder().encode(segredo ?? "segredo-apenas-para-desenvolvimento-local-123");
}

export async function criarSessao(dados: Sessao): Promise<void> {
  const token = await new SignJWT({ nome: dados.nome, papel: dados.papel })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(dados.id))
    .setIssuedAt()
    .setExpirationTime(`${DURACAO_SEGUNDOS}s`)
    .sign(chave());
  const jar = await cookies();
  jar.set(NOME_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACAO_SEGUNDOS,
  });
}

export async function obterSessao(): Promise<Sessao | null> {
  const jar = await cookies();
  const token = jar.get(NOME_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, chave());
    return { id: Number(payload.sub), nome: String(payload.nome), papel: payload.papel as PapelUsuario };
  } catch {
    return null;
  }
}

export async function encerrarSessao(): Promise<void> {
  const jar = await cookies();
  jar.delete(NOME_COOKIE);
}
