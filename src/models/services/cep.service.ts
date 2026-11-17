/**
 * MODEL — Consulta de endereço por CEP (base dos Correios).
 * A API oficial dos Correios (CWS) exige contrato; por isso usamos serviços públicos que espelham a base
 * de CEPs dos Correios: ViaCEP (principal) e BrasilAPI (reserva, caso o primeiro falhe ou demore).
 */
export interface EnderecoCep {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
  fonte: "ViaCEP" | "BrasilAPI";
}

const TEMPO_LIMITE_MS = 3500;

async function buscarJson(url: string): Promise<Record<string, unknown> | null> {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(TEMPO_LIMITE_MS), headers: { Accept: "application/json" } });
    if (r.status === 404) return { naoEncontrado: true };
    if (!r.ok) return null;
    return (await r.json()) as Record<string, unknown>;
  } catch {
    return null; // fora do ar ou lento: tenta o próximo
  }
}

/** Retorna o endereço, `null` se o CEP não existe, ou lança se nenhum serviço respondeu. */
export async function consultarCep(cep: string): Promise<EnderecoCep | null> {
  const limpo = cep.replace(/\D/g, "");
  if (limpo.length !== 8) return null;

  const via = await buscarJson(`https://viacep.com.br/ws/${limpo}/json/`);
  if (via && !via.erro && !via.naoEncontrado && via.localidade) {
    return {
      cep: limpo,
      logradouro: String(via.logradouro ?? ""),
      bairro: String(via.bairro ?? ""),
      cidade: String(via.localidade),
      uf: String(via.uf ?? ""),
      fonte: "ViaCEP",
    };
  }
  if (via && (via.erro || via.naoEncontrado)) return null;

  const br = await buscarJson(`https://brasilapi.com.br/api/cep/v1/${limpo}`);
  if (br && !br.naoEncontrado && br.city) {
    return {
      cep: limpo,
      logradouro: String(br.street ?? ""),
      bairro: String(br.neighborhood ?? ""),
      cidade: String(br.city),
      uf: String(br.state ?? ""),
      fonte: "BrasilAPI",
    };
  }
  if (br?.naoEncontrado) return null;
  throw new Error("Serviços de CEP indisponíveis");
}
