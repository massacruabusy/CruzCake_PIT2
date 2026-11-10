import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { detalheProduto } from "@/controllers/loja.controller";
import { BotaoAdicionar } from "@/components/BotaoAdicionar";
import { ErroNegocio } from "@/models/erros";
import { formatarCentavos } from "@/models/regras/dinheiro";
import { FRETE_GRATIS_A_PARTIR_CENTAVOS } from "@/models/regras/pedido";

async function carregar(slug: string) {
  try {
    return await detalheProduto(slug);
  } catch (e) {
    if (e instanceof ErroNegocio && e.codigo === "NAO_ENCONTRADO") notFound();
    throw e;
  }
}

export async function generateMetadata(props: PageProps<"/produto/[slug]">) {
  const { slug } = await props.params;
  const p = await carregar(slug);
  return { title: p.nome, description: p.descricao };
}

export default async function PaginaProduto(props: PageProps<"/produto/[slug]">) {
  const { slug } = await props.params;
  const p = await carregar(slug);

  return (
    <div className="flex flex-col gap-4">
      <nav aria-label="Trilha de navegação" className="text-sm text-stone-600">
        <Link href="/" className="hover:underline">Cardápio</Link> ›{" "}
        <Link href={`/?categoria=${p.categoria.slug}`} className="hover:underline">{p.categoria.nome}</Link> ›{" "}
        <span aria-current="page">{p.nome}</span>
      </nav>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="mx-auto w-full max-w-xs overflow-hidden rounded-3xl bg-marca-50 md:max-w-none">
          <Image src={p.imagemUrl} alt={`Cupcake ${p.nome}`} width={600} height={600} unoptimized priority className="aspect-square w-full" />
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <p className="font-semibold uppercase tracking-wide text-stone-500">{p.categoria.nome}</p>
            <h1 className="text-3xl font-black sm:text-4xl">{p.nome}</h1>
          </div>
          <p className="text-3xl font-black text-marca-700">{formatarCentavos(p.precoCentavos)}</p>
          <p className="text-lg text-stone-700">{p.descricao}</p>
          {p.ingredientes && (
            <details className="cartao">
              <summary className="cursor-pointer font-bold">Ingredientes e alérgenos</summary>
              <p className="mt-2 text-stone-700">{p.ingredientes}</p>
              <p className="mt-2 text-sm text-stone-500">Produzido em cozinha que manipula glúten, leite, ovos e oleaginosas.</p>
            </details>
          )}
          <p className={`font-semibold ${p.estoque === 0 ? "text-red-700" : p.estoque <= 5 ? "text-amber-700" : "text-green-700"}`}>
            {p.estoque === 0 ? "Esgotado hoje — volte amanhã!" : p.estoque <= 5 ? `Últimas ${p.estoque} unidades` : "Disponível para hoje"}
          </p>
          <BotaoAdicionar produto={p} comQuantidade />
          <ul className="text-sm text-stone-600">
            <li>🚚 Frete grátis a partir de {formatarCentavos(FRETE_GRATIS_A_PARTIR_CENTAVOS)}</li>
            <li>🏪 Retirada na loja sem custo</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
