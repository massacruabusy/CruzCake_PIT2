import type { Metadata } from "next";
import Link from "next/link";
import { zonas } from "@/controllers/admin.controller";
import { garantirAdminNaPagina } from "@/lib/guardas";
import { formatarCentavos } from "@/models/regras/dinheiro";

export const metadata: Metadata = { title: "Frete" };

const cep = (c: string) => `${c.slice(0, 5)}-${c.slice(5)}`;

export default async function PaginaFreteAdmin() {
  await garantirAdminNaPagina("/admin/frete");
  const lista = await zonas();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black">Zonas de entrega</h1>
          <p className="text-stone-600">Defina onde a loja entrega, o valor do frete, o prazo e a partir de quanto o frete é grátis.</p>
        </div>
        <Link href="/admin/frete/novo" className="btn-primario">+ Nova zona</Link>
      </div>
      <p className="rounded-xl bg-marca-50 p-3 text-sm text-marca-900">
        Se um CEP estiver em mais de uma zona, vale a faixa <strong>mais específica</strong> (menor intervalo). CEPs fora de todas as
        zonas ativas só podem comprar com retirada na loja.
      </p>
      {lista.length === 0 ? (
        <p className="cartao text-stone-600">Nenhuma zona cadastrada. Sem zonas, a loja só aceita retirada.</p>
      ) : (
        <div className="cartao overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-left">
            <caption className="sr-only">Zonas de entrega</caption>
            <thead className="bg-marca-50 text-sm">
              <tr>
                <th scope="col" className="p-3">Zona</th>
                <th scope="col" className="p-3">Faixa de CEP</th>
                <th scope="col" className="p-3">Frete</th>
                <th scope="col" className="p-3">Grátis a partir de</th>
                <th scope="col" className="p-3">Prazo</th>
                <th scope="col" className="p-3">Situação</th>
                <th scope="col" className="p-3"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-marca-100">
              {lista.map((z) => (
                <tr key={z.id}>
                  <td className="p-3 font-semibold">{z.nome}</td>
                  <td className="p-3 font-mono text-sm">{cep(z.cepInicial)} a {cep(z.cepFinal)}</td>
                  <td className="p-3">{z.valorCentavos === 0 ? "Grátis" : formatarCentavos(z.valorCentavos)}</td>
                  <td className="p-3">{z.freteGratisAPartirCentavos === null ? "—" : formatarCentavos(z.freteGratisAPartirCentavos)}</td>
                  <td className="p-3">até {z.prazoHoras}h</td>
                  <td className="p-3">{z.ativo ? "Ativa" : <span className="text-stone-500">Inativa</span>}</td>
                  <td className="p-3 text-right"><Link href={`/admin/frete/${z.id}`} className="font-bold text-marca-700 hover:underline">Editar</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
