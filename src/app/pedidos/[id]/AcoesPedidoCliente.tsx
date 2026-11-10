"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCarrinho } from "@/components/CarrinhoProvider";
import { chamarApi, ErroApi } from "@/lib/api-cliente";

interface Props {
  pedidoId: number;
  pixCopiaECola: string | null;
  podeCancelar: boolean;
}

export function AcoesPedidoCliente({ pedidoId, pixCopiaECola, podeCancelar }: Props) {
  const router = useRouter();
  const { avisar } = useCarrinho();
  const [ocupado, setOcupado] = useState(false);
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false);

  async function executar(url: string, sucesso: string) {
    setOcupado(true);
    try {
      await chamarApi(url, { corpo: {} });
      avisar(sucesso);
      router.refresh();
    } catch (e) {
      avisar(e instanceof ErroApi ? e.message : "Não foi possível concluir.", "erro");
    } finally {
      setOcupado(false);
      setConfirmandoCancelamento(false);
    }
  }

  if (!pixCopiaECola && !podeCancelar) return null;

  return (
    <div className="flex flex-col gap-3">
      {pixCopiaECola && (
        <section className="cartao flex flex-col gap-3 border-amber-200 bg-amber-50" aria-labelledby="pix-titulo">
          <h2 id="pix-titulo" className="text-lg font-black">Pague com PIX</h2>
          <label htmlFor="pix-codigo" className="rotulo">Código PIX copia e cola</label>
          <textarea id="pix-codigo" readOnly value={pixCopiaECola} className="campo h-24 font-mono text-xs" />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-secundario"
              onClick={() => navigator.clipboard?.writeText(pixCopiaECola).then(() => avisar("Código PIX copiado"))}
            >
              Copiar código
            </button>
            <button type="button" className="btn-primario" disabled={ocupado} onClick={() => executar(`/api/pedidos/${pedidoId}/confirmar-pix`, "Pagamento confirmado!")}>
              Simular pagamento confirmado
            </button>
          </div>
          <p className="text-xs text-stone-600">Demonstração: em produção a confirmação chegaria automaticamente pelo banco.</p>
        </section>
      )}
      {podeCancelar && (
        <div className="flex flex-wrap items-center gap-2">
          {!confirmandoCancelamento ? (
            <button type="button" className="btn-perigo" onClick={() => setConfirmandoCancelamento(true)}>
              Cancelar pedido
            </button>
          ) : (
            <div role="alertdialog" aria-labelledby="cancelar-titulo" className="cartao flex flex-col gap-2 border-red-200">
              <p id="cancelar-titulo" className="font-bold">Tem certeza que deseja cancelar o pedido #{pedidoId}?</p>
              <p className="text-sm text-stone-600">Se já foi pago, o estorno é feito na mesma forma de pagamento.</p>
              <div className="flex gap-2">
                <button type="button" className="btn-perigo" disabled={ocupado} onClick={() => executar(`/api/pedidos/${pedidoId}/cancelar`, "Pedido cancelado")}>
                  Sim, cancelar
                </button>
                <button type="button" className="btn-secundario" onClick={() => setConfirmandoCancelamento(false)}>
                  Manter pedido
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
