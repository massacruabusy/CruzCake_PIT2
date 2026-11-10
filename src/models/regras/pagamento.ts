/**
 * RN06 — Pagamento SIMULADO (gateway fictício, não há cobrança real).
 * - Cartão: número precisa passar no algoritmo de Luhn e a validade não pode estar vencida.
 *   Cartões terminados em 0000 são recusados pelo "emissor" para permitir testar o fluxo de recusa.
 * - PIX: gera um código copia-e-cola fictício; o pedido fica aguardando pagamento até a confirmação.
 */
import { randomUUID } from "node:crypto";
import { ErroNegocio } from "../erros";

export function luhnValido(numero: string): boolean {
  const digitos = numero.replace(/\D/g, "");
  if (digitos.length < 13 || digitos.length > 19) return false;
  let soma = 0;
  let dobrar = false;
  for (let i = digitos.length - 1; i >= 0; i--) {
    let d = Number(digitos[i]);
    if (dobrar) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    soma += d;
    dobrar = !dobrar;
  }
  return soma % 10 === 0;
}

/** Validade no formato MM/AA. */
export function validadeCartaoOk(validade: string, agora: Date = new Date()): boolean {
  const m = /^(\d{2})\/(\d{2})$/.exec(validade.trim());
  if (!m) return false;
  const mes = Number(m[1]);
  const ano = 2000 + Number(m[2]);
  if (mes < 1 || mes > 12) return false;
  const fimDoMes = new Date(ano, mes, 0, 23, 59, 59);
  return fimDoMes.getTime() >= agora.getTime();
}

export interface DadosCartao {
  numero: string;
  nomeImpresso: string;
  validade: string;
  cvv: string;
}

export interface ResultadoCartao {
  aprovado: true;
  codigoTransacao: string;
  cartaoFinal: string;
}

export function processarCartaoSimulado(cartao: DadosCartao, agora: Date = new Date()): ResultadoCartao {
  const numero = cartao.numero.replace(/\D/g, "");
  if (!luhnValido(numero)) {
    throw new ErroNegocio("VALIDACAO", "Número de cartão inválido.", { "cartao.numero": "Número de cartão inválido." });
  }
  if (!validadeCartaoOk(cartao.validade, agora)) {
    throw new ErroNegocio("VALIDACAO", "Cartão vencido ou validade inválida.", {
      "cartao.validade": "Use o formato MM/AA e um cartão dentro da validade.",
    });
  }
  if (!/^\d{3,4}$/.test(cartao.cvv)) {
    throw new ErroNegocio("VALIDACAO", "CVV inválido.", { "cartao.cvv": "O CVV tem 3 ou 4 dígitos." });
  }
  if (numero.endsWith("0000")) {
    throw new ErroNegocio(
      "PAGAMENTO_RECUSADO",
      "Pagamento recusado pela operadora do cartão. Tente outro cartão ou pague com PIX.",
    );
  }
  return { aprovado: true, codigoTransacao: `CARD-${randomUUID()}`, cartaoFinal: numero.slice(-4) };
}

export function gerarPixSimulado(pedidoId: number, totalCentavos: number) {
  const codigoTransacao = `PIX-${randomUUID()}`;
  const valor = (totalCentavos / 100).toFixed(2);
  const pixCopiaECola = `00020126580014BR.GOV.BCB.PIX0136cruzcake@exemplo.com5204000053039865406${valor}5802BR5920CRUZCAKE CUPCAKES6009SAO PAULO62140510PED${String(pedidoId).padStart(6, "0")}6304SIMU`;
  return { codigoTransacao, pixCopiaECola };
}
