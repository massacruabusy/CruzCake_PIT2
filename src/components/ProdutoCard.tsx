import Image from "next/image";
import Link from "next/link";
import { formatarCentavos } from "@/models/regras/dinheiro";
import type { ProdutoVitrine } from "@/models/services/catalogo.service";
import { BotaoAdicionar } from "./BotaoAdicionar";

export function ProdutoCard({ produto }: { produto: ProdutoVitrine }) {
  return (
    <article className="cartao flex flex-col gap-2 p-3 sm:gap-3 sm:p-4">
      <Link href={`/produto/${produto.slug}`} className="group block">
        <div className="relative overflow-hidden rounded-xl bg-marca-50">
          <Image
            src={produto.imagemUrl}
            alt={`Cupcake ${produto.nome}`}
            width={300}
            height={300}
            unoptimized
            className="aspect-square w-full transition group-hover:scale-105"
          />
          {produto.destaque && (
            <span className="absolute left-2 top-2 rounded-full bg-marca-600 px-2 py-0.5 text-xs font-bold text-white">Destaque</span>
          )}
          {produto.estoque > 0 && produto.estoque <= 5 && (
            <span className="absolute right-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
              Últimas {produto.estoque}
            </span>
          )}
        </div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-stone-500">{produto.categoria}</p>
        <h3 className="text-base font-extrabold leading-tight group-hover:text-marca-700 sm:text-lg">{produto.nome}</h3>
      </Link>
      <p className="hidden text-sm text-stone-600 sm:line-clamp-2">{produto.descricao}</p>
      <div className="mt-auto flex items-center justify-between gap-2">
        <span className="text-lg font-black text-marca-700 sm:text-xl">{formatarCentavos(produto.precoCentavos)}</span>
      </div>
      <BotaoAdicionar produto={produto} />
    </article>
  );
}
