"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCarrinho } from "./CarrinhoProvider";
import { chamarApi } from "@/lib/api-cliente";
import type { Sessao } from "@/lib/sessao";

export function Cabecalho({ sessao }: { sessao: Sessao | null }) {
  const { totalItens, carregado } = useCarrinho();
  const router = useRouter();
  const [menuAberto, setMenuAberto] = useState(false);

  async function sair() {
    await chamarApi("/api/auth/sair", { corpo: {} }).catch(() => undefined);
    setMenuAberto(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-marca-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-xl font-black text-marca-700" aria-label="Doce Nuvem — página inicial">
          <span aria-hidden className="text-2xl">🧁</span>
          <span>Doce Nuvem</span>
        </Link>

        <form action="/" className="ml-auto hidden flex-1 sm:block sm:max-w-sm" role="search">
          <label htmlFor="busca-topo" className="sr-only">Buscar sabores</label>
          <input id="busca-topo" name="busca" type="search" placeholder="Buscar sabores…" className="campo rounded-full" />
        </form>

        <nav className="ml-auto flex items-center gap-1 sm:ml-2" aria-label="Principal">
          {sessao?.papel === "ADMIN" && (
            <Link href="/admin" className="rounded-full px-3 py-2 text-sm font-bold text-cacau-700 hover:bg-marca-50">
              Painel
            </Link>
          )}
          <div className="relative">
            {sessao ? (
              <button
                type="button"
                onClick={() => setMenuAberto((v) => !v)}
                aria-expanded={menuAberto}
                aria-haspopup="menu"
                className="rounded-full px-3 py-2 text-sm font-bold text-cacau-700 hover:bg-marca-50"
              >
                Olá, {sessao.nome.split(" ")[0]} ▾
              </button>
            ) : (
              <Link href="/entrar" className="rounded-full px-3 py-2 text-sm font-bold text-cacau-700 hover:bg-marca-50">
                Entrar
              </Link>
            )}
            {menuAberto && sessao && (
              <div role="menu" className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-marca-100 bg-white shadow-lg">
                <Link role="menuitem" href="/pedidos" onClick={() => setMenuAberto(false)} className="block px-4 py-3 hover:bg-marca-50">
                  Meus pedidos
                </Link>
                <button role="menuitem" type="button" onClick={sair} className="block w-full px-4 py-3 text-left hover:bg-marca-50">
                  Sair
                </button>
              </div>
            )}
          </div>
          <Link
            href="/carrinho"
            className="relative rounded-full bg-marca-600 px-4 py-2 text-sm font-bold text-white hover:bg-marca-700"
            aria-label={`Carrinho com ${totalItens} ${totalItens === 1 ? "item" : "itens"}`}
          >
            🛒 <span className="hidden sm:inline">Carrinho</span>
            {carregado && totalItens > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-cacau-900 px-1 text-xs">
                {totalItens}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
