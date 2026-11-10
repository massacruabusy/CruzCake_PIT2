import type { PedidoDetalhado } from "@/models/services/pedido.service";
import { formatarCentavos } from "@/models/regras/dinheiro";
import { LinhaDoTempo, SeloStatus } from "./StatusPedido";
import { ResumoValores } from "./ResumoValores";

/** Bloco reutilizado na área do cliente e no painel administrativo. */
export function DetalhePedido({ pedido, mostrarCliente = false }: { pedido: PedidoDetalhado; mostrarCliente?: boolean }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-4">
        <section className="cartao" aria-labelledby="itens-titulo">
          <h2 id="itens-titulo" className="mb-3 text-lg font-black">Itens</h2>
          <ul className="flex flex-col gap-2">
            {pedido.itens.map((i) => (
              <li key={i.id} className="flex justify-between gap-2">
                <span>{i.quantidade}× {i.nomeProduto} <span className="text-sm text-stone-500">({formatarCentavos(i.precoUnitarioCentavos)} cada)</span></span>
                <span className="font-bold">{formatarCentavos(i.subtotalCentavos)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-marca-100 pt-3">
            <ResumoValores {...pedido} tipoEntrega={pedido.tipoEntrega} />
          </div>
        </section>

        <section className="cartao grid gap-4 sm:grid-cols-2">
          <div>
            <h2 className="font-black">{pedido.tipoEntrega === "ENTREGA" ? "Entrega" : "Retirada na loja"}</h2>
            {pedido.tipoEntrega === "ENTREGA" ? (
              <p className="text-stone-700">
                {pedido.entregaLogradouro}, {pedido.entregaNumero}
                {pedido.entregaComplemento ? ` — ${pedido.entregaComplemento}` : ""}
                <br />
                {pedido.entregaBairro} · {pedido.entregaCidade}/{pedido.entregaUf}
                <br />
                CEP {pedido.entregaCep?.replace(/(\d{5})(\d{3})/, "$1-$2")}
              </p>
            ) : (
              <p className="text-stone-700">Rua das Confeitarias, 123 — São Paulo/SP<br />Ter a dom, 10h às 20h</p>
            )}
          </div>
          <div>
            <h2 className="font-black">Pagamento</h2>
            <p className="text-stone-700">
              {pedido.pagamento?.metodo === "CARTAO" ? `Cartão final ${pedido.pagamento.cartaoFinal}` : "PIX"} ·{" "}
              {pedido.pagamento?.status === "APROVADO" ? "aprovado" : pedido.pagamento?.status === "PENDENTE" ? "pendente" : "não concluído"}
            </p>
          </div>
          {mostrarCliente && (
            <div>
              <h2 className="font-black">Cliente</h2>
              <p className="text-stone-700">{pedido.usuario.nome}<br />{pedido.usuario.email}{pedido.usuario.telefone ? <><br />{pedido.usuario.telefone}</> : null}</p>
            </div>
          )}
          {pedido.observacao && (
            <div>
              <h2 className="font-black">Observação</h2>
              <p className="text-stone-700">{pedido.observacao}</p>
            </div>
          )}
        </section>
      </div>

      <aside className="cartao h-fit" aria-labelledby="acompanhamento">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="acompanhamento" className="text-lg font-black">Acompanhamento</h2>
          <SeloStatus status={pedido.status} />
        </div>
        <LinhaDoTempo historico={pedido.historico} />
      </aside>
    </div>
  );
}
