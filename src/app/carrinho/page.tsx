import type { Metadata } from "next";
import { obterSessao } from "@/lib/sessao";
import { TelaCarrinho } from "./TelaCarrinho";

export const metadata: Metadata = { title: "Carrinho" };

export default async function PaginaCarrinho() {
  const sessao = await obterSessao();
  return <TelaCarrinho logado={Boolean(sessao)} />;
}
