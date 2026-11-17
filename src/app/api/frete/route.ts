import { cotacaoFrete } from "@/controllers/loja.controller";
import { tratar } from "@/controllers/http";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  return tratar(() => cotacaoFrete({ cep: sp.get("cep"), base: sp.get("base") }));
}
