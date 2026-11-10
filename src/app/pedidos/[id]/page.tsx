import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { detalhePedido } from "@/controllers/pedido.controller";
import { DetalhePedido } from "@/components/DetalhePedido";
import { obterSessao } from "@/lib/sessao";
import { ErroNegocio } from "@/models/erros";
import { clientePodeCancelar } from "@/models/regras/pedido";
import { AcoesPedidoCliente } from "./AcoesPedidoCliente";

export default async function PaginaPedido(props: PageProps<"/pedidos/[id]">) {
  const { id } = await props.params;
  const { novo } = await props.searchParams;
  if (!(await obterSessao())) redirect(`/entrar?voltar=/pedidos/${id}`);

  let pedido;
  try {
    pedido = await detalhePedido(id);
  } catch (e) {
    if (e instanceof ErroNegocio && e.codigo === "NAO_ENCONTRADO") notFound();
    throw e;
  }

  const aguardandoPix = pedido.status === "AGUARDANDO_PAGAMENTO" && pedido.pagamento?.metodo === "PIX";

  return (
    <div className="flex flex-col gap-4">
      <Link href="/pedidos" className="font-semibold text-marca-700 hover:underline">← Meus pedidos</Link>
      {novo && (
        <div role="status" className="rounded-2xl bg-green-50 p-4 text-green-900">
          <p className="text-lg font-black">Pedido #{pedido.id} recebido! 🎉</p>
          <p>{aguardandoPix ? "Pague o PIX abaixo para começarmos o preparo." : "Pagamento aprovado. Já vamos começar o preparo."}</p>
        </div>
      )}
      <h1 className="text-2xl font-black">Pedido #{pedido.id}</h1>
      <AcoesPedidoCliente
        pedidoId={pedido.id}
        pixCopiaECola={aguardandoPix ? pedido.pagamento?.pixCopiaECola ?? null : null}
        podeCancelar={clientePodeCancelar(pedido.status)}
      />
      <DetalhePedido pedido={pedido} />
    </div>
  );
}
