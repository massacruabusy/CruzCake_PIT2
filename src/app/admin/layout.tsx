import Link from "next/link";
import { redirect } from "next/navigation";
import { obterSessao } from "@/lib/sessao";

export default async function LayoutAdmin({ children }: LayoutProps<"/admin">) {
  const sessao = await obterSessao();
  if (!sessao) redirect("/entrar?voltar=/admin");
  if (sessao.papel !== "ADMIN") redirect("/");

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Administração" className="flex flex-wrap gap-2 rounded-2xl bg-cacau-900 p-2">
        {[
          ["/admin", "Visão geral"],
          ["/admin/pedidos", "Pedidos"],
          ["/admin/produtos", "Produtos"],
          ["/admin/frete", "Frete"],
        ].map(([href, rotulo]) => (
          <Link key={href} href={href} className="rounded-xl px-4 py-2 font-bold text-white hover:bg-white/10">
            {rotulo}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
