import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { meusEnderecos } from "@/controllers/pedido.controller";
import { obterSessao } from "@/lib/sessao";
import { TelaCheckout } from "./TelaCheckout";

export const metadata: Metadata = { title: "Finalizar compra" };

export default async function PaginaCheckout() {
  if (!(await obterSessao())) redirect("/entrar?voltar=/checkout");
  const enderecos = await meusEnderecos();
  return (
    <TelaCheckout
      enderecos={enderecos.map((e) => ({
        id: e.id,
        apelido: e.apelido,
        cep: e.cep,
        logradouro: e.logradouro,
        numero: e.numero,
        complemento: e.complemento,
        bairro: e.bairro,
        cidade: e.cidade,
        uf: e.uf,
      }))}
    />
  );
}
