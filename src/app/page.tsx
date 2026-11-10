import Link from "next/link";
import { vitrine } from "@/controllers/loja.controller";
import { ProdutoCard } from "@/components/ProdutoCard";

export default async function PaginaVitrine(props: PageProps<"/">) {
  const sp = await props.searchParams;
  const categoria = typeof sp.categoria === "string" ? sp.categoria : undefined;
  const busca = typeof sp.busca === "string" ? sp.busca : undefined;
  const { categorias, produtos } = await vitrine({ categoria, busca });
  const filtrando = Boolean(categoria || busca);

  return (
    <div className="flex flex-col gap-8">
      {!filtrando && (
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-marca-100 via-marca-50 to-amber-50 px-6 py-10 sm:px-10">
          <p className="font-bold text-marca-700">Feitos hoje, do jeitinho de sempre</p>
          <h1 className="mt-2 max-w-xl text-3xl font-black leading-tight sm:text-5xl">Cupcakes gourmet que chegam fofinhos na sua porta</h1>
          <p className="mt-3 max-w-lg text-stone-700">
            Escolha seus sabores, pague com PIX ou cartão e receba em casa — ou retire na loja sem pagar frete.
          </p>
          <p className="mt-4 inline-block rounded-full bg-white px-4 py-2 text-sm font-bold text-marca-700 shadow-sm">
            Primeira compra? Use o cupom <span className="font-black">BEMVINDO10</span>
          </p>
        </section>
      )}

      <section aria-labelledby="titulo-cardapio" className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="titulo-cardapio" className="text-2xl font-black">
            {busca ? `Resultados para “${busca}”` : "Cardápio"}
          </h2>
          <form action="/" className="sm:hidden" role="search">
            <label htmlFor="busca-mobile" className="sr-only">Buscar sabores</label>
            <input id="busca-mobile" name="busca" type="search" defaultValue={busca} placeholder="Buscar sabores…" className="campo rounded-full" />
          </form>
        </div>

        <nav aria-label="Categorias" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <Link
            href="/"
            aria-current={!categoria ? "page" : undefined}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold ${!categoria ? "border-marca-600 bg-marca-600 text-white" : "border-marca-200 bg-white text-cacau-700 hover:bg-marca-50"}`}
          >
            Todos
          </Link>
          {categorias.map((c) => (
            <Link
              key={c.id}
              href={`/?categoria=${c.slug}`}
              aria-current={categoria === c.slug ? "page" : undefined}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold ${categoria === c.slug ? "border-marca-600 bg-marca-600 text-white" : "border-marca-200 bg-white text-cacau-700 hover:bg-marca-50"}`}
            >
              {c.nome}
            </Link>
          ))}
        </nav>

        {produtos.length === 0 ? (
          <div className="cartao text-center">
            <p className="text-lg font-bold">Nenhum cupcake encontrado.</p>
            <p className="text-stone-600">Tente outro termo de busca ou veja todo o cardápio.</p>
            <Link href="/" className="btn-secundario mt-4">Ver todos os sabores</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4">
            {produtos.map((p) => (
              <ProdutoCard key={p.id} produto={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
