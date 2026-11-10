import { precificar } from "@/controllers/loja.controller";
import { lerJson, tratar } from "@/controllers/http";

export async function POST(req: Request) {
  return tratar(async () => precificar(await lerJson(req)));
}
