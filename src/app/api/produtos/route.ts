import { vitrine } from "@/controllers/loja.controller";
import { tratar } from "@/controllers/http";

export async function GET(req: Request) {
  const url = new URL(req.url);
  return tratar(() =>
    vitrine({ categoria: url.searchParams.get("categoria") ?? undefined, busca: url.searchParams.get("busca") ?? undefined }),
  );
}
