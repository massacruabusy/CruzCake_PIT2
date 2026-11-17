import Image from "next/image";
import Link from "next/link";
import { vitrine } from "@/controllers/loja.controller";
import { IconeCruzCake } from "@/components/Logo";
import { ProdutoCard } from "@/components/ProdutoCard";
import { formatarCentavos } from "@/models/regras/dinheiro";

const DIFERENCIAIS = [
  { icone: "🧁", titulo: "Feitos no dia", texto: "Fornada fresca todas as manhãs. Esgotou, só amanhã." },
  { icone: "🚚", titulo: "Entrega rápida", texto: "Em até 2h após o preparo na região central de SP." },
  { icone: "🏪", titulo: "Retire sem frete", texto: "Peça online e busque na loja quando quiser." },
];

function TituloSecao({ id, children, sub }: { id: string; children: React.ReactNode; sub?: string }) {
  return (
    <div>
      <h2 id={id} className="flex items-center gap-2 text-2xl font-black sm:text-3xl">
        <span aria-hidden className="text-estrela-500">★</span>
        {children}
      </h2>
      {sub && <p className="mt-1 text-stone-600">{sub}</p>}
    </div>
  );
}

export default async function PaginaVitrine(props: PageProps<"/">) {
  const sp = await props.searchParams;
  const categoria = typeof sp.categoria === "string" ? sp.categoria : undefined;
  const busca = typeof sp.busca === "string" ? sp.busca : undefined;
  const { categorias, produtos } = await vitrine({ categoria, busca });
  const filtrando = Boolean(categoria || busca);
  const presentes = produtos.filter((p) => p.categoriaSlug === "caixas-e-kits");

  return (
    <div className="flex flex-col gap-10">
      {!filtrando && (
        <>
          <section className="relative overflow-hidden rounded-3xl bg-marca-700 text-white">
            <div aria-hidden className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-marca-500/40 blur-2xl" />
            <div aria-hidden className="absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-estrela-500/20 blur-2xl" />
            <div className="relative grid items-center gap-6 px-6 py-10 sm:px-10 md:grid-cols-[1.3fr_1fr] md:py-14">
              <div>
                <p className="inline-block rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-estrela-400">
                  ★ Confeitaria artesanal em São Paulo
                </p>
                <h1 className="mt-4 text-4xl font-black leading-[1.05] sm:text-5xl lg:text-6xl">
                  Cupcakes gourmet,
                  <br />
                  <span className="text-estrela-400">feitos hoje</span> para você.
                </h1>
                <p className="mt-4 max-w-lg text-lg text-marca-100">
                  Escolha seus sabores, pague com PIX ou cartão e receba em casa, ou retire na loja sem pagar frete.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="#cardapio" className="btn bg-estrela-500 text-marca-900 hover:bg-estrela-400">Ver cardápio</Link>
                  <Link href="/?categoria=caixas-e-kits" className="btn border-2 border-white/40 text-white hover:bg-white/10">
                    🎁 Caixas para presente
                  </Link>
                </div>
                <p className="mt-6 text-sm text-marca-100">
                  Primeira compra? Use o cupom <span className="rounded bg-white/15 px-2 py-0.5 font-black tracking-wide text-white">BEMVINDO10</span>
                </p>
              </div>
              <div className="relative mx-auto hidden h-64 w-64 md:block lg:h-80 lg:w-80">
                <div className="absolute inset-0 rounded-full bg-white/10" />
                <IconeCruzCake className="absolute inset-6 h-auto w-auto drop-shadow-2xl" />
              </div>
            </div>
          </section>

          <ul className="grid gap-3 sm:grid-cols-3" aria-label="Diferenciais da loja">
            {DIFERENCIAIS.map((d) => (
              <li key={d.titulo} className="cartao flex items-start gap-3 p-4">
                <span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-estrela-100 text-2xl">{d.icone}</span>
                <div>
                  <p className="font-black">{d.titulo}</p>
                  <p className="text-sm text-stone-600">{d.texto}</p>
                </div>
              </li>
            ))}
          </ul>

          {presentes.length > 0 && (
            <section aria-labelledby="titulo-presentes" className="flex flex-col gap-4">
              <TituloSecao id="titulo-presentes" sub="Caixas prontas, com sabores sortidos e embalagem de presente.">
                Para presentear
              </TituloSecao>
              <div className="grid gap-4 sm:grid-cols-2">
                {presentes.map((p) => (
                  <Link
                    key={p.id}
                    href={`/produto/${p.slug}`}
                    className="group flex items-center gap-4 rounded-3xl border border-marca-100 bg-gradient-to-br from-white to-marca-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <Image src={p.imagemUrl} alt={`${p.nome}`} width={140} height={140} unoptimized className="h-28 w-28 shrink-0 rounded-2xl bg-white sm:h-36 sm:w-36" />
                    <div className="flex flex-col gap-1">
                      <span className="w-fit rounded-full bg-marca-700 px-2 py-0.5 text-xs font-bold text-white">📦 Kit</span>
                      <p className="text-lg font-black leading-tight group-hover:text-marca-600">{p.nome}</p>
                      <p className="line-clamp-2 text-sm text-stone-600">{p.descricao}</p>
                      <p className="text-xl font-black text-marca-700">{formatarCentavos(p.precoCentavos)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <section id="cardapio" aria-labelledby="titulo-cardapio" className="flex scroll-mt-24 flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <TituloSecao id="titulo-cardapio">{busca ? `Resultados para “${busca}”` : "Cardápio do dia"}</TituloSecao>
          <form action="/" className="sm:hidden" role="search">
            <label htmlFor="busca-mobile" className="sr-only">Buscar sabores</label>
            <input id="busca-mobile" name="busca" type="search" defaultValue={busca} placeholder="Buscar sabores…" className="campo rounded-full" />
          </form>
        </div>

        <nav aria-label="Categorias" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <Link
            href="/#cardapio"
            aria-current={!categoria ? "page" : undefined}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${!categoria ? "border-marca-700 bg-marca-700 text-white" : "border-marca-200 bg-white text-cacau-700 hover:border-marca-500"}`}
          >
            Todos
          </Link>
          {categorias.map((c) => (
            <Link
              key={c.id}
              href={`/?categoria=${c.slug}`}
              aria-current={categoria === c.slug ? "page" : undefined}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${categoria === c.slug ? "border-marca-700 bg-marca-700 text-white" : "border-marca-200 bg-white text-cacau-700 hover:border-marca-500"}`}
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
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {produtos.map((p) => (
              <ProdutoCard key={p.id} produto={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
