import type { StatusPedido } from "@/models/db/schema";
import { ROTULO_STATUS } from "@/models/regras/pedido";

const CORES: Record<StatusPedido, string> = {
  AGUARDANDO_PAGAMENTO: "bg-amber-100 text-amber-900",
  PAGO: "bg-sky-100 text-sky-900",
  EM_PREPARO: "bg-violet-100 text-violet-900",
  SAIU_PARA_ENTREGA: "bg-indigo-100 text-indigo-900",
  PRONTO_PARA_RETIRADA: "bg-indigo-100 text-indigo-900",
  ENTREGUE: "bg-green-100 text-green-900",
  CANCELADO: "bg-stone-200 text-stone-700",
};

export function SeloStatus({ status }: { status: StatusPedido }) {
  return <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${CORES[status]}`}>{ROTULO_STATUS[status]}</span>;
}

export function LinhaDoTempo({ historico }: { historico: { id: number; status: StatusPedido; observacao: string | null; criadoEm: Date }[] }) {
  return (
    <ol className="relative ml-2 border-l-2 border-marca-200">
      {historico.map((h) => (
        <li key={h.id} className="mb-4 ml-4">
          <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full bg-marca-600" aria-hidden />
          <p className="font-bold">{ROTULO_STATUS[h.status]}</p>
          <p className="text-sm text-stone-600">
            {h.criadoEm.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" })}
            {h.observacao ? ` · ${h.observacao}` : ""}
          </p>
        </li>
      ))}
    </ol>
  );
}
