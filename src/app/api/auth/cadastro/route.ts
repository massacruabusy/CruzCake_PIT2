import { cadastrar } from "@/controllers/auth.controller";
import { lerJson, tratar } from "@/controllers/http";

export async function POST(req: Request) {
  return tratar(async () => cadastrar(await lerJson(req)), 201);
}
