import Link from "next/link";
import { notFound } from "next/navigation";
import { pedido as carregarPedido } from "@/controllers/admin.controller";
import { DetalhePedido } from "@/components/DetalhePedido";
import { ErroNegocio } from "@/models/erros";
import { proximosStatusPossiveis } from "@/models/regras/pedido";
import { AcoesStatusAdmin } from "./AcoesStatusAdmin";
import { garantirAdminNaPagina } from "@/lib/guardas";

export default async function PaginaPedidoAdmin(props: PageProps<"/admin/pedidos/[id]">) {
  await garantirAdminNaPagina("/admin/pedidos");
  const { id } = await props.params;
  let pedido;
  try {
    pedido = await carregarPedido(id);
  } catch (e) {
    if (e instanceof ErroNegocio && e.codigo === "NAO_ENCONTRADO") notFound();
    throw e;
  }
  return (
    <div className="flex flex-col gap-4">
      <Link href="/admin/pedidos" className="font-semibold text-marca-700 hover:underline">← Todos os pedidos</Link>
      <h1 className="text-2xl font-black">Pedido #{pedido.id}</h1>
      <AcoesStatusAdmin pedidoId={pedido.id} proximos={proximosStatusPossiveis(pedido.status, pedido.tipoEntrega)} />
      <DetalhePedido pedido={pedido} mostrarCliente />
    </div>
  );
}
