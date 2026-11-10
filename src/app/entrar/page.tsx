import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { obterSessao } from "@/lib/sessao";
import { FormularioAuth } from "./FormularioAuth";

export const metadata: Metadata = { title: "Entrar" };

function destinoSeguro(voltar: unknown): string {
  // Só aceita caminhos internos (evita redirecionamento para sites externos).
  return typeof voltar === "string" && voltar.startsWith("/") && !voltar.startsWith("//") ? voltar : "/";
}

export default async function PaginaEntrar(props: PageProps<"/entrar">) {
  const voltar = destinoSeguro((await props.searchParams).voltar);
  if (await obterSessao()) redirect(voltar);
  return <FormularioAuth modo="entrar" voltar={voltar} />;
}
