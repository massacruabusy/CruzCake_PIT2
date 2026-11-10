import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { meusPedidos } from "@/controllers/pedido.controller";
import { obterSessao } from "@/lib/sessao";
import { SeloStatus } from "@/components/StatusPedido";
import { formatarCentavos } from "@/models/regras/dinheiro";

export const metadata: Metadata = { title: "Meus pedidos" };

export default async function PaginaMeusPedidos() {
  if (!(await obterSessao())) redirect("/entrar?voltar=/pedidos");
  const pedidos = await meusPedidos();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-black">Meus pedidos</h1>
      {pedidos.length === 0 ? (
        <div className="cartao text-center">
          <p>Você ainda não fez nenhum pedido.</p>
          <Link href="/" className="btn-primario mt-4">Ver cardápio</Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {pedidos.map((p) => (
            <li key={p.id}>
              <Link href={`/pedidos/${p.id}`} className="cartao flex flex-col gap-2 hover:border-marca-300 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-black">Pedido #{p.id}</p>
                  <p className="text-sm text-stone-600">
                    {p.criadoEm.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })} ·{" "}
                    {p.itens.reduce((s, i) => s + i.quantidade, 0)} cupcake(s) · {p.tipoEntrega === "ENTREGA" ? "Entrega" : "Retirada"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <SeloStatus status={p.status} />
                  <span className="font-black">{formatarCentavos(p.totalCentavos)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
