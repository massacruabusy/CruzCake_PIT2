import { enderecoPorCep } from "@/controllers/loja.controller";
import { tratar } from "@/controllers/http";

export async function GET(_req: Request, ctx: { params: Promise<{ cep: string }> }) {
  const { cep } = await ctx.params;
  return tratar(() => enderecoPorCep(cep));
}
