import type { Metadata } from "next";
import Link from "next/link";
import { pedidos } from "@/controllers/admin.controller";
import { SeloStatus } from "@/components/StatusPedido";
import { formatarCentavos } from "@/models/regras/dinheiro";
import { ROTULO_STATUS } from "@/models/regras/pedido";
import { garantirAdminNaPagina } from "@/lib/guardas";

export const metadata: Metadata = { title: "Pedidos" };

export default async function PaginaPedidosAdmin(props: PageProps<"/admin/pedidos">) {
  await garantirAdminNaPagina("/admin/pedidos");
  const { status } = await props.searchParams;
  const filtro = typeof status === "string" ? status : undefined;
  const lista = await pedidos(filtro);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-black">Pedidos</h1>
      <nav aria-label="Filtrar por situação" className="-mx-4 flex gap-2 overflow-x-auto px-4">
        <Link href="/admin/pedidos" className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-bold ${!filtro ? "border-marca-600 bg-marca-600 text-white" : "border-marca-200 bg-white"}`}>Todos</Link>
        {Object.entries(ROTULO_STATUS).map(([valor, rotulo]) => (
          <Link key={valor} href={`/admin/pedidos?status=${valor}`} className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-bold ${filtro === valor ? "border-marca-600 bg-marca-600 text-white" : "border-marca-200 bg-white"}`}>
            {rotulo}
          </Link>
        ))}
      </nav>
      {lista.length === 0 ? (
        <p className="cartao text-stone-600">Nenhum pedido nesta situação.</p>
      ) : (
        <div className="cartao overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-left">
            <caption className="sr-only">Pedidos da loja</caption>
            <thead className="bg-marca-50 text-sm">
              <tr>
                <th scope="col" className="p-3">Pedido</th>
                <th scope="col" className="p-3">Data</th>
                <th scope="col" className="p-3">Cliente</th>
                <th scope="col" className="p-3">Recebimento</th>
                <th scope="col" className="p-3">Total</th>
                <th scope="col" className="p-3">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-marca-100">
              {lista.map((p) => (
                <tr key={p.id} className="hover:bg-marca-50/50">
                  <td className="p-3"><Link href={`/admin/pedidos/${p.id}`} className="font-black text-marca-700 hover:underline">#{p.id}</Link></td>
                  <td className="p-3 text-sm">{p.criadoEm.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" })}</td>
                  <td className="p-3">{p.usuario.nome}</td>
                  <td className="p-3">{p.tipoEntrega === "ENTREGA" ? "Entrega" : "Retirada"}</td>
                  <td className="p-3 font-bold">{formatarCentavos(p.totalCentavos)}</td>
                  <td className="p-3"><SeloStatus status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
