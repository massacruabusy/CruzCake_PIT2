import { entrar } from "@/controllers/auth.controller";
import { lerJson, tratar } from "@/controllers/http";

export async function POST(req: Request) {
  return tratar(async () => entrar(await lerJson(req)));
}
