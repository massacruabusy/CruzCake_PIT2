import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { CarrinhoProvider } from "@/components/CarrinhoProvider";
import { Cabecalho } from "@/components/Cabecalho";
import { IconeCruzCake } from "@/components/Logo";
import Link from "next/link";
import { obterSessao } from "@/lib/sessao";
import "./globals.css";

const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "CruzCake Cupcakes", template: "%s | CruzCake Cupcakes" },
  description: "Cupcakes gourmet feitos todos os dias. Peça online e receba em casa ou retire na loja.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const sessao = await obterSessao();
  return (
    <html lang="pt-BR" className={`${nunito.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:p-2">
          Pular para o conteúdo
        </a>
        <CarrinhoProvider>
          <Cabecalho sessao={sessao} />
          <main id="conteudo" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
            {children}
          </main>
          <footer className="mt-10 bg-marca-900 text-marca-100">
            <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <IconeCruzCake className="h-10 w-10" />
                  <span className="text-2xl font-black text-white">Cruz<span className="text-estrela-400">Cake</span></span>
                </div>
                <p className="text-sm">Cupcakes gourmet feitos todos os dias, com carinho e ingredientes selecionados.</p>
              </div>
              <div>
                <p className="mb-2 font-black text-white">Loja</p>
                <p className="text-sm">Rua das Confeitarias, 123<br />São Paulo/SP<br />Ter a dom, 10h às 20h</p>
              </div>
              <div>
                <p className="mb-2 font-black text-white">Compre</p>
                <ul className="flex flex-col gap-1 text-sm">
                  <li><Link href="/#cardapio" className="hover:text-white">Cardápio do dia</Link></li>
                  <li><Link href="/?categoria=caixas-e-kits" className="hover:text-white">Caixas para presente</Link></li>
                  <li><Link href="/pedidos" className="hover:text-white">Meus pedidos</Link></li>
                </ul>
              </div>
              <div>
                <p className="mb-2 font-black text-white">Pagamento</p>
                <p className="flex gap-2 text-sm">
                  <span className="rounded-md bg-white/10 px-2 py-1 font-bold">PIX</span>
                  <span className="rounded-md bg-white/10 px-2 py-1 font-bold">Cartão</span>
                </p>
              </div>
            </div>
            <div className="border-t border-white/10">
              <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-marca-200">
                Projeto acadêmico (PIT II, Cruzeiro do Sul Virtual). Marca fictícia e pagamentos simulados.
              </p>
            </div>
          </footer>
        </CarrinhoProvider>
      </body>
    </html>
  );
}
