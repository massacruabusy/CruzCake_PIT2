import { confirmarPix } from "@/controllers/pedido.controller";
import { tratar } from "@/controllers/http";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return tratar(() => confirmarPix(id));
}
