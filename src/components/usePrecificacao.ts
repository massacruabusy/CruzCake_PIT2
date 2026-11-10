"use client";

import { useEffect, useState } from "react";
import { chamarApi, ErroApi } from "@/lib/api-cliente";
import type { CarrinhoPrecificado } from "@/models/services/carrinho.service";
import { useCarrinho } from "./CarrinhoProvider";

/** Busca no servidor os preços/estoque oficiais do carrinho sempre que ele muda. */
export function usePrecificacao(tipoEntrega: "ENTREGA" | "RETIRADA", cep = "") {
  const { itens, cupom, carregado, remover } = useCarrinho();
  const [dados, setDados] = useState<CarrinhoPrecificado | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  const chave = JSON.stringify({ i: itens.map((i) => [i.produtoId, i.quantidade]), cupom, tipoEntrega, cep });

  useEffect(() => {
    if (!carregado) return;
    let cancelado = false;
    const { i, cupom: c, tipoEntrega: t, cep: z } = JSON.parse(chave) as { i: [number, number][]; cupom: string; tipoEntrega: string; cep: string };
    // eslint-disable-next-line react-hooks/set-state-in-effect -- indicador de carregamento da requisição
    setCarregando(true);
    chamarApi<CarrinhoPrecificado>("/api/carrinho/precificar", {
      corpo: { itens: i.map(([produtoId, quantidade]) => ({ produtoId, quantidade })), codigoCupom: c || null, tipoEntrega: t, cep: z || null },
    })
      .then((r) => {
        if (cancelado) return;
        setDados(r);
        setErro(null);
        // Produtos que deixaram de existir/estar ativos saem do carrinho automaticamente.
        r.problemas.filter((p) => p.codigo === "PRODUTO_INDISPONIVEL").forEach((p) => remover(p.produtoId));
      })
      .catch((e) => !cancelado && setErro(e instanceof ErroApi ? e.message : "Erro ao calcular o carrinho."))
      .finally(() => !cancelado && setCarregando(false));
    return () => {
      cancelado = true;
    };
  }, [chave, carregado, remover]);

  return { dados, erro, carregando };
}
