import { novoProduto, produtos } from "@/controllers/admin.controller";
import { lerJson, tratar } from "@/controllers/http";

export async function GET() {
  return tratar(() => produtos());
}

export async function POST(req: Request) {
  return tratar(async () => novoProduto(await lerJson(req)), 201);
}
