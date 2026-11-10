import { alterarStatusPedido } from "@/controllers/admin.controller";
import { lerJson, tratar } from "@/controllers/http";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return tratar(async () => alterarStatusPedido(id, await lerJson(req)));
}
