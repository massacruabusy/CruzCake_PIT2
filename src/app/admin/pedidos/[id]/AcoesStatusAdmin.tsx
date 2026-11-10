"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCarrinho } from "@/components/CarrinhoProvider";
import { chamarApi, ErroApi } from "@/lib/api-cliente";
import type { StatusPedido } from "@/models/db/schema";
import { ROTULO_STATUS } from "@/models/regras/pedido";

export function AcoesStatusAdmin({ pedidoId, proximos }: { pedidoId: number; proximos: StatusPedido[] }) {
  const router = useRouter();
  const { avisar } = useCarrinho();
  const [ocupado, setOcupado] = useState(false);
  const [observacao, setObservacao] = useState("");

  if (proximos.length === 0) {
    return <p className="cartao text-stone-600">Este pedido está finalizado. Não há próximas etapas.</p>;
  }

  async function mudar(status: StatusPedido) {
    if (status === "CANCELADO" && !window.confirm(`Cancelar o pedido #${pedidoId}? Os itens voltarão ao estoque.`)) return;
    setOcupado(true);
    try {
      await chamarApi(`/api/admin/pedidos/${pedidoId}/status`, { method: "PATCH", corpo: { status, observacao: observacao || null } });
      avisar(`Pedido atualizado para "${ROTULO_STATUS[status]}"`);
      setObservacao("");
      router.refresh();
    } catch (e) {
      avisar(e instanceof ErroApi ? e.message : "Falha ao atualizar.", "erro");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <section className="cartao flex flex-col gap-3" aria-labelledby="proxima-etapa">
      <h2 id="proxima-etapa" className="font-black">Avançar etapa</h2>
      <label htmlFor="obs-status" className="sr-only">Observação</label>
      <input id="obs-status" value={observacao} onChange={(e) => setObservacao(e.target.value)} maxLength={200} className="campo" placeholder="Observação opcional (ex.: entregador João)" />
      <div className="flex flex-wrap gap-2">
        {proximos.map((s) => (
          <button key={s} type="button" disabled={ocupado} onClick={() => mudar(s)} className={s === "CANCELADO" ? "btn-perigo" : "btn-primario"}>
            {s === "CANCELADO" ? "Cancelar pedido" : `Marcar como "${ROTULO_STATUS[s]}"`}
          </button>
        ))}
      </div>
    </section>
  );
}
