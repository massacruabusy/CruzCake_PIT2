import { detalhePedido } from "@/controllers/pedido.controller";
import { tratar } from "@/controllers/http";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return tratar(() => detalhePedido(id));
}
