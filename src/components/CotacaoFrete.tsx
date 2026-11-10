"use client";

/**
 * VIEW — "Calcule o frete": o visitante descobre se a loja entrega no CEP dele, o valor e o prazo,
 * antes de criar conta. O CEP fica salvo e é reaproveitado no carrinho e no checkout.
 */
import { useEffect, useState, type FormEvent } from "react";
import { chamarApi, ErroApi } from "@/lib/api-cliente";
import { formatarCentavos } from "@/models/regras/dinheiro";
import type { CotacaoFrete } from "@/models/services/frete.service";
import type { EnderecoCep } from "@/models/services/cep.service";
import { useCarrinho } from "./CarrinhoProvider";

type Cotacao = CotacaoFrete & { endereco: EnderecoCep | null };

function formatarCep(cep: string) {
  const d = cep.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export function CotacaoFrete({ baseCentavos = 0, compacto = false }: { baseCentavos?: number; compacto?: boolean }) {
  const { cep, definirCep, carregado } = useCarrinho();
  const [campo, setCampo] = useState("");
  const [cotacao, setCotacao] = useState<Cotacao | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function cotar(valor: string) {
    setCarregando(true);
    setErro(null);
    try {
      setCotacao(await chamarApi<Cotacao>(`/api/frete?cep=${valor}&base=${baseCentavos}`));
    } catch (e) {
      setCotacao(null);
      setErro(e instanceof ErroApi ? e.message : "Não foi possível calcular o frete.");
    } finally {
      setCarregando(false);
    }
  }

  // Recalcula com o CEP salvo (ao abrir a página ou quando o subtotal muda).
  useEffect(() => {
    if (!carregado || cep.length !== 8) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza o campo com o CEP salvo
    setCampo(formatarCep(cep));
    cotar(cep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carregado, cep, baseCentavos]);

  function enviar(e: FormEvent) {
    e.preventDefault();
    const limpo = campo.replace(/\D/g, "");
    if (limpo.length !== 8) {
      setErro("Digite os 8 números do CEP.");
      return;
    }
    if (limpo === cep) cotar(limpo);
    else definirCep(limpo);
  }

  return (
    <div className={compacto ? "" : "cartao"}>
      <form onSubmit={enviar} className="flex flex-col gap-1" aria-label="Calcular frete">
        <label htmlFor="cep-frete" className="rotulo">🚚 Entregamos no seu endereço?</label>
        <div className="flex gap-2">
          <input
            id="cep-frete"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="00000-000"
            value={campo}
            onChange={(e) => setCampo(formatarCep(e.target.value))}
            className="campo"
            aria-describedby="cep-frete-resultado"
            aria-invalid={Boolean(erro)}
          />
          <button className="btn-secundario px-4" disabled={carregando}>{carregando ? "…" : "Calcular"}</button>
        </div>
        <div id="cep-frete-resultado" aria-live="polite" className="text-sm">
          {erro && <p className="erro-campo">{erro}</p>}
          {cotacao?.endereco && !erro && (
            <p className="mt-1 text-stone-700">
              📍 {[cotacao.endereco.logradouro, cotacao.endereco.bairro].filter(Boolean).join(", ")}
              {cotacao.endereco.logradouro || cotacao.endereco.bairro ? " · " : ""}
              {cotacao.endereco.cidade}/{cotacao.endereco.uf}
            </p>
          )}
          {cotacao && !erro && (cotacao.disponivel && cotacao.zona ? (
            <p className="mt-1 text-green-800">
              <strong>Entregamos!</strong> {cotacao.zona.nome}: em até {cotacao.zona.prazoHoras}h após o preparo,{" "}
              {cotacao.freteCentavos === 0 ? <strong>frete grátis</strong> : <>por <strong>{formatarCentavos(cotacao.freteCentavos ?? 0)}</strong></>}
              {cotacao.zona.freteGratisAPartirCentavos !== null && cotacao.freteCentavos !== 0 && (
                <> · grátis a partir de {formatarCentavos(cotacao.zona.freteGratisAPartirCentavos)}</>
              )}
              .
            </p>
          ) : (
            <p className="mt-1 text-amber-900">
              Ainda não entregamos no CEP {formatarCep(cotacao.cep)}. Você pode <strong>retirar na loja sem custo</strong> (Rua das Confeitarias, 123).
            </p>
          ))}
          {!cotacao && !erro && !compacto && <p className="mt-1 text-stone-500">Retirada na loja é sempre grátis.</p>}
        </div>
      </form>
    </div>
  );
}
