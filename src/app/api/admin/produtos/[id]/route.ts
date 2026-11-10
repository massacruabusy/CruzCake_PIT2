import { editarProduto } from "@/controllers/admin.controller";
import { lerJson, tratar } from "@/controllers/http";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return tratar(async () => editarProduto(id, await lerJson(req)));
}
