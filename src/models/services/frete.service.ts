/** MODEL — Zonas de entrega e cotação de frete por CEP (RN02). */
import { asc, eq } from "drizzle-orm";
import type { DB } from "../db/client";
import { zonasEntrega, type ZonaEntrega } from "../db/schema";
import { ErroNegocio } from "../erros";
import { calcularFrete, encontrarZona } from "../regras/pedido";

export interface CotacaoFrete {
  cep: string;
  disponivel: boolean;
  zona: Pick<ZonaEntrega, "id" | "nome" | "prazoHoras" | "valorCentavos" | "freteGratisAPartirCentavos"> | null;
  /** Frete para a base informada (produtos já com desconto). Null quando não entrega. */
  freteCentavos: number | null;
}

export async function listarZonas(db: DB, apenasAtivas = false) {
  const consulta = db.select().from(zonasEntrega).orderBy(asc(zonasEntrega.cepInicial), asc(zonasEntrega.nome));
  return apenasAtivas ? consulta.where(eq(zonasEntrega.ativo, true)) : consulta;
}

export function montarCotacao(zonas: ZonaEntrega[], cep: string, baseCentavos: number): CotacaoFrete {
  const limpo = cep.replace(/\D/g, "");
  const zona = encontrarZona(zonas, limpo);
  if (!zona) return { cep: limpo, disponivel: false, zona: null, freteCentavos: null };
  return {
    cep: limpo,
    disponivel: true,
    zona: {
      id: zona.id,
      nome: zona.nome,
      prazoHoras: zona.prazoHoras,
      valorCentavos: zona.valorCentavos,
      freteGratisAPartirCentavos: zona.freteGratisAPartirCentavos,
    },
    freteCentavos: calcularFrete(zona, baseCentavos),
  };
}

export async function cotarFrete(db: DB, cep: string, baseCentavos = 0): Promise<CotacaoFrete> {
  return montarCotacao(await listarZonas(db, true), cep, baseCentavos);
}

export interface DadosZona {
  nome: string;
  cepInicial: string;
  cepFinal: string;
  valorCentavos: number;
  freteGratisAPartirCentavos: number | null;
  prazoHoras: number;
  ativo: boolean;
}

function validarFaixa(d: DadosZona) {
  if (d.cepInicial > d.cepFinal) {
    throw new ErroNegocio("VALIDACAO", "O CEP inicial deve ser menor ou igual ao CEP final.", {
      cepFinal: "Deve ser maior ou igual ao CEP inicial.",
    });
  }
}

export async function criarZona(db: DB, dados: DadosZona) {
  validarFaixa(dados);
  const [z] = await db.insert(zonasEntrega).values(dados).returning();
  return z;
}

export async function atualizarZona(db: DB, id: number, dados: DadosZona) {
  validarFaixa(dados);
  const [z] = await db.update(zonasEntrega).set(dados).where(eq(zonasEntrega.id, id)).returning();
  if (!z) throw new ErroNegocio("NAO_ENCONTRADO", "Zona de entrega não encontrada.");
  return z;
}

export async function obterZona(db: DB, id: number) {
  const z = await db.query.zonasEntrega.findFirst({ where: eq(zonasEntrega.id, id) });
  if (!z) throw new ErroNegocio("NAO_ENCONTRADO", "Zona de entrega não encontrada.");
  return z;
}
