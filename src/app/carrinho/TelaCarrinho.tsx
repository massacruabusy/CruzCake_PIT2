"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MAX_POR_ITEM, useCarrinho } from "@/components/CarrinhoProvider";
import { CotacaoFrete } from "@/components/CotacaoFrete";
import { ResumoValores } from "@/components/ResumoValores";
import { usePrecificacao } from "@/components/usePrecificacao";
import { formatarCentavos } from "@/models/regras/dinheiro";

export function TelaCarrinho({ logado }: { logado: boolean }) {
  const { itens, alterarQuantidade, remover, cupom, cep, carregado, avisar } = useCarrinho();
  const { dados, erro, carregando } = usePrecificacao("ENTREGA", cep);

  if (!carregado) return <p>Carregando carrinho…</p>;

  if (itens.length === 0) {
    return (
      <div className="cartao mx-auto max-w-md text-center">
        <p className="text-5xl" aria-hidden>🧁</p>
        <h1 className="mt-2 text-2xl font-black">Seu carrinho está vazio</h1>
        <p className="text-stone-600">Que tal escolher alguns sabores?</p>
        <Link href="/" className="btn-primario mt-4">Ver cardápio</Link>
      </div>
    );
  }

  const problemaDe = (id: number) => dados?.problemas.find((p) => p.produtoId === id);
  const temProblema = (dados?.problemas.length ?? 0) > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section aria-labelledby="titulo-carrinho" className="flex flex-col gap-3">
        <h1 id="titulo-carrinho" className="text-2xl font-black">Seu carrinho</h1>
        {erro && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-800">{erro}</p>}
        <ul className="flex flex-col gap-3">
          {itens.map((item) => {
            const oficial = dados?.itens.find((i) => i.produtoId === item.produtoId);
            const problema = problemaDe(item.produtoId);
            const preco = oficial?.precoUnitarioCentavos ?? item.precoCentavos;
            const limite = Math.min(MAX_POR_ITEM, oficial?.estoqueDisponivel ?? MAX_POR_ITEM);
            return (
              <li key={item.produtoId} className={`cartao flex gap-3 p-3 ${problema ? "border-red-300" : ""}`}>
                <Image src={item.imagemUrl} alt="" width={80} height={80} unoptimized className="h-20 w-20 rounded-xl bg-marca-50" />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex justify-between gap-2">
                    <p className="font-bold">{item.nome}</p>
                    <p className="font-bold">{formatarCentavos(preco * item.quantidade)}</p>
                  </div>
                  <p className="text-sm text-stone-600">{formatarCentavos(preco)} cada</p>
                  {problema && <p role="alert" className="text-sm font-semibold text-red-700">{problema.mensagem}</p>}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-full border border-stone-300">
                      <button type="button" className="px-3 py-1 font-bold" aria-label={`Diminuir ${item.nome}`} onClick={() => alterarQuantidade(item.produtoId, item.quantidade - 1)}>−</button>
                      <span className="w-8 text-center font-bold">{item.quantidade}</span>
                      <button
                        type="button"
                        className="px-3 py-1 font-bold disabled:opacity-30"
                        aria-label={`Aumentar ${item.nome}`}
                        disabled={item.quantidade >= limite}
                        onClick={() => alterarQuantidade(item.produtoId, item.quantidade + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button type="button" className="text-sm font-semibold text-red-700 hover:underline" onClick={() => { remover(item.produtoId); avisar(`${item.nome} removido`); }}>
                      Remover
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <Link href="/" className="font-semibold text-marca-700 hover:underline">← Continuar comprando</Link>
      </section>

      <aside className="cartao flex h-fit flex-col gap-4" aria-label="Resumo do pedido">
        <FormCupom key={cupom} erroCupom={dados?.erroCupom ?? null} cupomAplicado={dados?.cupom?.codigo ?? null} />
        <CotacaoFrete compacto baseCentavos={dados ? dados.subtotalCentavos - dados.descontoCentavos : 0} />
        {dados && <ResumoValores {...dados} freteCalculado={Boolean(dados.entrega?.disponivel)} />}
        <p className="text-xs text-stone-500">Na retirada na loja o frete é sempre grátis.</p>
        <Link
          href={logado ? "/checkout" : "/entrar?voltar=/checkout"}
          aria-disabled={temProblema || carregando}
          className={`btn-primario ${temProblema || carregando ? "pointer-events-none opacity-50" : ""}`}
        >
          {logado ? "Finalizar compra" : "Entrar para finalizar"}
        </Link>
        {temProblema && <p className="text-sm text-red-700">Ajuste os itens destacados para continuar.</p>}
      </aside>
    </div>
  );
}

/** Formulário do cupom; remonta (key) quando o cupom salvo muda, já iniciando com o valor correto. */
function FormCupom({ erroCupom, cupomAplicado }: { erroCupom: string | null; cupomAplicado: string | null }) {
  const { cupom, definirCupom } = useCarrinho();
  const [campoCupom, setCampoCupom] = useState(cupom);
  const dados = { erroCupom, cupom: cupomAplicado ? { codigo: cupomAplicado } : null };
  return (
    <form
      className="flex flex-col gap-1"
      onSubmit={(e) => {
        e.preventDefault();
        definirCupom(campoCupom.trim().toUpperCase());
      }}
    >
      <label htmlFor="cupom" className="rotulo">Cupom de desconto</label>
      <div className="flex gap-2">
        <input id="cupom" value={campoCupom} onChange={(e) => setCampoCupom(e.target.value)} className="campo uppercase" placeholder="EX.: BEMVINDO10" aria-invalid={Boolean(dados?.erroCupom)} aria-describedby="cupom-msg" />
        <button className="btn-secundario px-4">Aplicar</button>
      </div>
      <p id="cupom-msg" className={dados?.erroCupom ? "erro-campo" : "text-sm text-green-700"}>
        {dados?.erroCupom ?? (dados?.cupom ? `Cupom ${dados.cupom.codigo} aplicado!` : "")}
      </p>
      {cupom && (
        <button type="button" className="self-start text-sm text-stone-600 underline" onClick={() => { definirCupom(""); setCampoCupom(""); }}>
          Remover cupom
        </button>
      )}
    </form>
  );
}
