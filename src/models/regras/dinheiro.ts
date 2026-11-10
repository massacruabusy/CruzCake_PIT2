/** RN01 — Todos os valores monetários são inteiros em centavos (evita erro de ponto flutuante). */

export function formatarCentavos(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Converte "12,50" / "12.50" / "12" em centavos. Retorna NaN se inválido. */
export function reaisParaCentavos(valor: string): number {
  const normalizado = valor.trim().replace(/\s|R\$/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalizado)) return Number.NaN;
  return Math.round(Number(normalizado) * 100);
}
