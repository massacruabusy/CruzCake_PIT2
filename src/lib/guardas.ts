import "server-only";
import { redirect } from "next/navigation";
import { obterSessao } from "./sessao";

/**
 * Proteção das páginas do painel. O layout de /admin também verifica, mas no Next.js
 * layout e página renderizam em paralelo; por isso cada página redireciona antes de
 * chamar o controller (evita erro NAO_AUTENTICADO no log).
 */
export async function garantirAdminNaPagina(destino = "/admin") {
  const sessao = await obterSessao();
  if (!sessao) redirect(`/entrar?voltar=${encodeURIComponent(destino)}`);
  if (sessao.papel !== "ADMIN") redirect("/");
  return sessao;
}
