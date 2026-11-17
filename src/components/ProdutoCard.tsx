import Image from "next/image";
import Link from "next/link";
import { formatarCentavos } from "@/models/regras/dinheiro";
import type { ProdutoVitrine } from "@/models/services/catalogo.service";
import { BotaoAdicionar } from "./BotaoAdicionar";

export function ProdutoCard({ produto }: { produto: ProdutoVitrine }) {
  const ehKit = produto.categoriaSlug === "caixas-e-kits";
  return (
    <article className="group flex flex-col gap-2 rounded-3xl border border-marca-100 bg-white p-2.5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:gap-3 sm:p-3">
      <Link href={`/produto/${produto.slug}`} className="block">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-marca-50 to-estrela-100/60">
          <Image
            src={produto.imagemUrl}
            alt={`Cupcake ${produto.nome}`}
            width={300}
            height={300}
            unoptimized
            className="aspect-square w-full transition duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-x-2 top-2 flex flex-wrap justify-between gap-1">
            {produto.destaque ? (
              <span className="rounded-full bg-estrela-500 px-2 py-0.5 text-xs font-bold text-marca-900 shadow-sm">★ Destaque</span>
            ) : (
              <span />
            )}
            {produto.estoque <= 5 && (
              <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-bold text-amber-700 shadow-sm">Últimas {produto.estoque}</span>
            )}
          </div>
          {ehKit && (
            <span className="absolute bottom-2 left-2 rounded-full bg-marca-700 px-2 py-0.5 text-xs font-bold text-white shadow-sm">📦 Kit<span className="hidden sm:inline"> para presentear</span></span>
          )}
        </div>
        <div className="px-1 pt-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-marca-500">{produto.categoria}</p>
          <h3 className="mt-0.5 text-base font-extrabold leading-tight group-hover:text-marca-600 sm:text-lg">{produto.nome}</h3>
          <p className="mt-1 hidden text-sm text-stone-600 sm:line-clamp-2">{produto.descricao}</p>
        </div>
      </Link>
      <div className="mt-auto flex flex-col gap-2 px-1">
        <span className="text-xl font-black text-marca-700">{formatarCentavos(produto.precoCentavos)}</span>
        <BotaoAdicionar produto={produto} />
      </div>
    </article>
  );
}
