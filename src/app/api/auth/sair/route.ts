import { sair } from "@/controllers/auth.controller";
import { tratar } from "@/controllers/http";

export async function POST() {
  return tratar(() => sair());
}
