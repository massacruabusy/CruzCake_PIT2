import { pedidos } from "@/controllers/admin.controller";
import { tratar } from "@/controllers/http";

export async function GET(req: Request) {
  const status = new URL(req.url).searchParams.get("status") ?? undefined;
  return tratar(() => pedidos(status));
}
