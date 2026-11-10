import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { produtos } from "@/controllers/admin.controller";
import { formatarCentavos } from "@/models/regras/dinheiro";

export const metadata: Metadata = { title: "Produtos" };

export default async function PaginaProdutosAdmin() {
  const lista = await produtos();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Produtos</h1>
        <Link href="/admin/produtos/novo" className="btn-primario">+ Novo produto</Link>
      </div>
      <div className="cartao overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-left">
          <caption className="sr-only">Lista de produtos cadastrados</caption>
          <thead className="bg-marca-50 text-sm">
            <tr>
              <th scope="col" className="p-3">Produto</th>
              <th scope="col" className="p-3">Categoria</th>
              <th scope="col" className="p-3">Preço</th>
              <th scope="col" className="p-3">Estoque</th>
              <th scope="col" className="p-3">Situação</th>
              <th scope="col" className="p-3"><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-marca-100">
            {lista.map((p) => (
              <tr key={p.id}>
                <td className="flex items-center gap-3 p-3">
                  <Image src={p.imagemUrl} alt="" width={40} height={40} unoptimized className="rounded-lg" />
                  <span className="font-semibold">{p.nome}</span>
                  {p.destaque && <span className="rounded-full bg-marca-100 px-2 text-xs font-bold text-marca-700">Destaque</span>}
                </td>
                <td className="p-3">{p.categoria}</td>
                <td className="p-3">{formatarCentavos(p.precoCentavos)}</td>
                <td className={`p-3 font-bold ${p.estoque === 0 ? "text-red-700" : p.estoque <= 5 ? "text-amber-700" : ""}`}>{p.estoque}</td>
                <td className="p-3">{p.ativo ? "Ativo" : <span className="text-stone-500">Inativo</span>}</td>
                <td className="p-3 text-right">
                  <Link href={`/admin/produtos/${p.id}`} className="font-bold text-marca-700 hover:underline">Editar</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
