import { finalizarCompra, meusPedidos } from "@/controllers/pedido.controller";
import { lerJson, tratar } from "@/controllers/http";

export async function GET() {
  return tratar(() => meusPedidos());
}

export async function POST(req: Request) {
  return tratar(async () => finalizarCompra(await lerJson(req)), 201);
}
