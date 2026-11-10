/** MODEL — Regras de cadastro e autenticação de usuários. */
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import type { DB } from "../db/client";
import { usuarios, type PapelUsuario } from "../db/schema";
import { ErroNegocio } from "../erros";

export interface UsuarioPublico {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  papel: PapelUsuario;
}

const CUSTO_HASH = 10;

function paraPublico(u: typeof usuarios.$inferSelect): UsuarioPublico {
  return { id: u.id, nome: u.nome, email: u.email, telefone: u.telefone, papel: u.papel };
}

export async function cadastrarUsuario(
  db: DB,
  dados: { nome: string; email: string; senha: string; telefone?: string | null },
): Promise<UsuarioPublico> {
  const email = dados.email.trim().toLowerCase();
  const existente = await db.query.usuarios.findFirst({ where: eq(usuarios.email, email) });
  if (existente) {
    throw new ErroNegocio("EMAIL_JA_CADASTRADO", "Já existe uma conta com este e-mail. Tente entrar ou recuperar a senha.", {
      email: "E-mail já cadastrado.",
    });
  }
  const senhaHash = await bcrypt.hash(dados.senha, CUSTO_HASH);
  const [criado] = await db
    .insert(usuarios)
    .values({ nome: dados.nome.trim(), email, senhaHash, telefone: dados.telefone || null, papel: "CLIENTE" })
    .returning();
  return paraPublico(criado);
}

export async function autenticar(db: DB, email: string, senha: string): Promise<UsuarioPublico> {
  const usuario = await db.query.usuarios.findFirst({ where: eq(usuarios.email, email.trim().toLowerCase()) });
  // Mesma mensagem para e-mail inexistente e senha errada (não revela quais e-mails existem).
  if (!usuario || !(await bcrypt.compare(senha, usuario.senhaHash))) {
    throw new ErroNegocio("CREDENCIAIS_INVALIDAS", "E-mail ou senha incorretos.");
  }
  return paraPublico(usuario);
}

export async function obterUsuario(db: DB, id: number): Promise<UsuarioPublico | null> {
  const u = await db.query.usuarios.findFirst({ where: eq(usuarios.id, id) });
  return u ? paraPublico(u) : null;
}
