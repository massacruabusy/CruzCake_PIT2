"use client";

import { useState } from "react";
import { MAX_POR_ITEM, useCarrinho } from "./CarrinhoProvider";

interface Props {
  produto: { id: number; nome: string; imagemUrl: string; precoCentavos: number; estoque: number };
  comQuantidade?: boolean;
}

export function BotaoAdicionar({ produto, comQuantidade = false }: Props) {
  const { adicionar, avisar, itens } = useCarrinho();
  const [qtd, setQtd] = useState(1);
  const noCarrinho = itens.find((i) => i.produtoId === produto.id)?.quantidade ?? 0;
  const limite = Math.min(MAX_POR_ITEM, produto.estoque);

  if (produto.estoque <= 0) {
    return (
      <button type="button" disabled className="btn w-full bg-stone-200 text-stone-500">
        Esgotado
      </button>
    );
  }

  function aoAdicionar() {
    if (noCarrinho + qtd > limite) {
      avisar(`Você já tem ${noCarrinho} no carrinho. Limite para este sabor: ${limite}.`, "erro");
      return;
    }
    adicionar({ produtoId: produto.id, nome: produto.nome, imagemUrl: produto.imagemUrl, precoCentavos: produto.precoCentavos }, qtd);
    avisar(`${qtd}× ${produto.nome} adicionado ao carrinho`);
    setQtd(1);
  }

  return (
    <div className="flex w-full items-center gap-2">
      {comQuantidade && (
        <div className="flex items-center rounded-full border border-stone-300 bg-white">
          <button type="button" className="px-3 py-2 text-lg font-bold" onClick={() => setQtd((q) => Math.max(1, q - 1))} aria-label="Diminuir quantidade">
            −
          </button>
          <span className="w-8 text-center font-bold" aria-live="polite" aria-label={`Quantidade ${qtd}`}>
            {qtd}
          </span>
          <button type="button" className="px-3 py-2 text-lg font-bold" onClick={() => setQtd((q) => Math.min(limite, q + 1))} aria-label="Aumentar quantidade">
            +
          </button>
        </div>
      )}
      <button type="button" onClick={aoAdicionar} className="btn-primario flex-1">
        Adicionar
      </button>
    </div>
  );
}
