import type { Metadata } from "next";
import Link from "next/link";
import { painel } from "@/controllers/admin.controller";
import { formatarCentavos } from "@/models/regras/dinheiro";

export const metadata: Metadata = { title: "Painel da loja" };

export default async function PaginaPainel() {
  const r = await painel();
  const indicadores = [
    { rotulo: "Pedidos em aberto", valor: String(r.pedidosEmAberto), href: "/admin/pedidos" },
    { rotulo: "Pedidos pagos", valor: String(r.pedidosPagos), href: "/admin/pedidos" },
    { rotulo: "Faturamento", valor: formatarCentavos(r.faturamentoCentavos), href: "/admin/pedidos?status=ENTREGUE" },
  ];
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-black">Visão geral</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {indicadores.map((i) => (
          <Link key={i.rotulo} href={i.href} className="cartao hover:border-marca-300">
            <p className="text-sm font-semibold text-stone-600">{i.rotulo}</p>
            <p className="text-3xl font-black">{i.valor}</p>
          </Link>
        ))}
      </div>
      <section className="cartao" aria-labelledby="estoque-baixo">
        <h2 id="estoque-baixo" className="mb-2 text-lg font-black">Estoque baixo (≤ 5 unidades)</h2>
        {r.estoqueBaixo.length === 0 ? (
          <p className="text-stone-600">Nenhum produto com estoque baixo.</p>
        ) : (
          <ul className="divide-y divide-marca-100">
            {r.estoqueBaixo.map((p) => (
              <li key={p.id} className="flex justify-between py-2">
                <Link href={`/admin/produtos/${p.id}`} className="font-semibold hover:underline">{p.nome}</Link>
                <span className={p.estoque === 0 ? "font-bold text-red-700" : "font-bold text-amber-700"}>
                  {p.estoque === 0 ? "Esgotado" : `${p.estoque} un.`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
