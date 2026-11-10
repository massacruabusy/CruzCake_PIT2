/** Chamada à API a partir do navegador, com erro padronizado para exibir na tela. */
export class ErroApi extends Error {
  constructor(
    mensagem: string,
    readonly codigo: string,
    readonly status: number,
    readonly campos: Record<string, string> = {},
  ) {
    super(mensagem);
  }
}

export async function chamarApi<T>(url: string, init?: { method?: string; corpo?: unknown }): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(url, {
      method: init?.method ?? (init?.corpo !== undefined ? "POST" : "GET"),
      headers: init?.corpo !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: init?.corpo !== undefined ? JSON.stringify(init.corpo) : undefined,
    });
  } catch {
    throw new ErroApi("Sem conexão com o servidor. Verifique sua internet e tente novamente.", "SEM_CONEXAO", 0);
  }
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    const e = dados?.erro ?? {};
    throw new ErroApi(e.mensagem ?? "Não foi possível concluir a operação.", e.codigo ?? "ERRO", resposta.status, e.campos ?? {});
  }
  return dados as T;
}
