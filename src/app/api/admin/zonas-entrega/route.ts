import { novaZona, zonas } from "@/controllers/admin.controller";
import { lerJson, tratar } from "@/controllers/http";

export async function GET() {
  return tratar(() => zonas());
}

export async function POST(req: Request) {
  return tratar(async () => novaZona(await lerJson(req)), 201);
}
