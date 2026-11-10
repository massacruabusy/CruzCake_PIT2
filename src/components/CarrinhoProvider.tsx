"use client";

/**
 * VIEW — Estado do carrinho no navegador (persistido em localStorage).
 * Guarda apenas id, quantidade, dados de exibição, cupom e CEP; preço, estoque e frete oficiais
 * vêm sempre do servidor. Também controla o minicarrinho (gaveta lateral) e os avisos.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { MiniCarrinho } from "./MiniCarrinho";

export interface ItemCarrinho {
  produtoId: number;
  quantidade: number;
  nome: string;
  imagemUrl: string;
  precoCentavos: number;
}

interface Aviso {
  id: number;
  texto: string;
  tipo: "sucesso" | "erro";
}

interface ContextoCarrinho {
  itens: ItemCarrinho[];
  totalItens: number;
  cupom: string;
  cep: string;
  carregado: boolean;
  miniAberto: boolean;
  adicionar: (item: Omit<ItemCarrinho, "quantidade">, quantidade?: number) => void;
  alterarQuantidade: (produtoId: number, quantidade: number) => void;
  remover: (produtoId: number) => void;
  limpar: () => void;
  definirCupom: (codigo: string) => void;
  definirCep: (cep: string) => void;
  abrirMini: () => void;
  fecharMini: () => void;
  avisar: (texto: string, tipo?: Aviso["tipo"]) => void;
}

const Contexto = createContext<ContextoCarrinho | null>(null);
const CHAVE = "cruzcake:carrinho:v1";
export const MAX_POR_ITEM = 24;

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [cupom, setCupom] = useState("");
  const [cep, setCep] = useState("");
  const [carregado, setCarregado] = useState(false);
  const [miniAberto, setMiniAberto] = useState(false);
  const [avisos, setAvisos] = useState<Aviso[]>([]);

  useEffect(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE) ?? "{}");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hidratação a partir do localStorage
      if (Array.isArray(salvo.itens)) setItens(salvo.itens);
      if (typeof salvo.cupom === "string") setCupom(salvo.cupom);
      if (typeof salvo.cep === "string") setCep(salvo.cep);
    } catch {
      /* armazenamento indisponível: segue com carrinho vazio */
    }
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (!carregado) return;
    try {
      localStorage.setItem(CHAVE, JSON.stringify({ itens, cupom, cep }));
    } catch {
      /* ignora */
    }
  }, [itens, cupom, cep, carregado]);

  const avisar = useCallback((texto: string, tipo: Aviso["tipo"] = "sucesso") => {
    const id = Date.now() + Math.random();
    setAvisos((a) => [...a, { id, texto, tipo }]);
    setTimeout(() => setAvisos((a) => a.filter((x) => x.id !== id)), 3500);
  }, []);

  const adicionar = useCallback<ContextoCarrinho["adicionar"]>((item, quantidade = 1) => {
    setItens((atual) => {
      const existente = atual.find((i) => i.produtoId === item.produtoId);
      if (existente) {
        return atual.map((i) =>
          i.produtoId === item.produtoId ? { ...i, quantidade: Math.min(MAX_POR_ITEM, i.quantidade + quantidade) } : i,
        );
      }
      return [...atual, { ...item, quantidade: Math.min(MAX_POR_ITEM, quantidade) }];
    });
  }, []);

  const alterarQuantidade = useCallback((produtoId: number, quantidade: number) => {
    setItens((atual) =>
      quantidade <= 0
        ? atual.filter((i) => i.produtoId !== produtoId)
        : atual.map((i) => (i.produtoId === produtoId ? { ...i, quantidade: Math.min(MAX_POR_ITEM, quantidade) } : i)),
    );
  }, []);

  const remover = useCallback((produtoId: number) => setItens((a) => a.filter((i) => i.produtoId !== produtoId)), []);
  const limpar = useCallback(() => {
    setItens([]);
    setCupom("");
  }, []);
  const definirCep = useCallback((valor: string) => setCep(valor.replace(/\D/g, "").slice(0, 8)), []);
  const abrirMini = useCallback(() => setMiniAberto(true), []);
  const fecharMini = useCallback(() => setMiniAberto(false), []);

  const valor = useMemo<ContextoCarrinho>(
    () => ({
      itens,
      totalItens: itens.reduce((s, i) => s + i.quantidade, 0),
      cupom,
      cep,
      carregado,
      miniAberto,
      adicionar,
      alterarQuantidade,
      remover,
      limpar,
      definirCupom: setCupom,
      definirCep,
      abrirMini,
      fecharMini,
      avisar,
    }),
    [itens, cupom, cep, carregado, miniAberto, adicionar, alterarQuantidade, remover, limpar, definirCep, abrirMini, fecharMini, avisar],
  );

  return (
    <Contexto.Provider value={valor}>
      {children}
      <MiniCarrinho />
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4">
        {avisos.map((a) => (
          <div
            key={a.id}
            role={a.tipo === "erro" ? "alert" : "status"}
            className={`pointer-events-auto rounded-full px-5 py-3 font-semibold text-white shadow-lg ${
              a.tipo === "erro" ? "bg-red-700" : "bg-cacau-900"
            }`}
          >
            {a.texto}
          </div>
        ))}
      </div>
    </Contexto.Provider>
  );
}

export function useCarrinho(): ContextoCarrinho {
  const c = useContext(Contexto);
  if (!c) throw new Error("useCarrinho deve ser usado dentro de CarrinhoProvider");
  return c;
}
