"use client";

/**
 * VIEW — Minicarrinho: gaveta lateral aberta pelo ícone do carrinho ou ao adicionar um produto.
 * Permite ajustar quantidades sem sair da página. Valores aqui são de referência; o total oficial
 * (cupom, frete e estoque) é calculado no carrinho/checkout pelo servidor.
 */
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { formatarCentavos } from "@/models/regras/dinheiro";
import { MAX_POR_ITEM, useCarrinho } from "./CarrinhoProvider";

export function MiniCarrinho() {
  const { itens, miniAberto, fecharMini, alterarQuantidade, remover, totalItens } = useCarrinho();
  const botaoFechar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!miniAberto) return;
    botaoFechar.current?.focus();
    const aoTeclar = (e: KeyboardEvent) => e.key === "Escape" && fecharMini();
    document.addEventListener("keydown", aoTeclar);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = "";
    };
  }, [miniAberto, fecharMini]);

  if (!miniAberto) return null;
  const subtotal = itens.reduce((s, i) => s + i.precoCentavos * i.quantidade, 0);

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Fechar minicarrinho" className="absolute inset-0 bg-marca-900/40" onClick={fecharMini} tabIndex={-1} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="minicarrinho-titulo"
        className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-marca-100 p-4">
          <h2 id="minicarrinho-titulo" className="text-lg font-black">
            Seu carrinho <span className="font-semibold text-stone-500">({totalItens})</span>
          </h2>
          <button ref={botaoFechar} type="button" onClick={fecharMini} className="rounded-full px-3 py-1 text-2xl leading-none hover:bg-marca-50" aria-label="Fechar">
            ×
          </button>
        </div>

        {itens.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-lg font-bold">Seu carrinho está vazio</p>
            <button type="button" onClick={fecharMini} className="btn-secundario">Continuar comprando</button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-marca-100 overflow-y-auto px-4">
              {itens.map((i) => (
                <li key={i.produtoId} className="flex gap-3 py-3">
                  <Image src={i.imagemUrl} alt="" width={64} height={64} unoptimized className="h-16 w-16 rounded-xl bg-marca-50" />
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex justify-between gap-2">
                      <p className="font-bold leading-tight">{i.nome}</p>
                      <p className="font-bold">{formatarCentavos(i.precoCentavos * i.quantidade)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-full border border-stone-300">
                        <button type="button" className="px-3 py-0.5 font-bold" aria-label={`Diminuir ${i.nome}`} onClick={() => alterarQuantidade(i.produtoId, i.quantidade - 1)}>−</button>
                        <span className="w-6 text-center text-sm font-bold">{i.quantidade}</span>
                        <button type="button" className="px-3 py-0.5 font-bold disabled:opacity-30" aria-label={`Aumentar ${i.nome}`} disabled={i.quantidade >= MAX_POR_ITEM} onClick={() => alterarQuantidade(i.produtoId, i.quantidade + 1)}>+</button>
                      </div>
                      <button type="button" className="text-sm font-semibold text-red-700 hover:underline" onClick={() => remover(i.produtoId)}>Remover</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 border-t border-marca-100 p-4">
              <div className="flex justify-between text-lg font-black">
                <span>Subtotal</span>
                <span>{formatarCentavos(subtotal)}</span>
              </div>
              <p className="text-xs text-stone-500">Cupom e frete são calculados no carrinho.</p>
              <Link href="/carrinho" onClick={fecharMini} className="btn-primario">Ver carrinho e finalizar</Link>
              <button type="button" onClick={fecharMini} className="btn-secundario">Continuar comprando</button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
