import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { CarrinhoProvider } from "@/components/CarrinhoProvider";
import { Cabecalho } from "@/components/Cabecalho";
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
          <footer className="border-t border-marca-100 bg-white">
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-sm text-stone-600 sm:flex-row sm:justify-between">
              <p>CruzCake Cupcakes · Rua das Confeitarias, 123 · São Paulo/SP</p>
              <p>Ter a dom, 10h às 20h · Projeto acadêmico — pagamentos simulados</p>
            </div>
          </footer>
        </CarrinhoProvider>
      </body>
    </html>
  );
}
