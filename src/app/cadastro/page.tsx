import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { obterSessao } from "@/lib/sessao";
import { FormularioAuth } from "../entrar/FormularioAuth";

export const metadata: Metadata = { title: "Criar conta" };

export default async function PaginaCadastro(props: PageProps<"/cadastro">) {
  const v = (await props.searchParams).voltar;
  const voltar = typeof v === "string" && v.startsWith("/") && !v.startsWith("//") ? v : "/";
  if (await obterSessao()) redirect(voltar);
  return <FormularioAuth modo="cadastro" voltar={voltar} />;
}
