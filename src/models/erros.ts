/**
 * Erros de negócio. Cada erro tem um código estável (usado pelo front e pelos testes),
 * uma mensagem amigável em português e o status HTTP correspondente.
 */
export type CodigoErro =
  | "VALIDACAO"
  | "NAO_AUTENTICADO"
  | "SEM_PERMISSAO"
  | "NAO_ENCONTRADO"
  | "EMAIL_JA_CADASTRADO"
  | "CREDENCIAIS_INVALIDAS"
  | "CARRINHO_VAZIO"
  | "PRODUTO_INDISPONIVEL"
  | "ESTOQUE_INSUFICIENTE"
  | "QUANTIDADE_INVALIDA"
  | "CUPOM_INVALIDO"
  | "PAGAMENTO_RECUSADO"
  | "TRANSICAO_STATUS_INVALIDA"
  | "OPERACAO_NAO_PERMITIDA";

const STATUS_HTTP: Record<CodigoErro, number> = {
  VALIDACAO: 400,
  NAO_AUTENTICADO: 401,
  SEM_PERMISSAO: 403,
  NAO_ENCONTRADO: 404,
  EMAIL_JA_CADASTRADO: 409,
  CREDENCIAIS_INVALIDAS: 401,
  CARRINHO_VAZIO: 422,
  PRODUTO_INDISPONIVEL: 422,
  ESTOQUE_INSUFICIENTE: 422,
  QUANTIDADE_INVALIDA: 422,
  CUPOM_INVALIDO: 422,
  PAGAMENTO_RECUSADO: 402,
  TRANSICAO_STATUS_INVALIDA: 409,
  OPERACAO_NAO_PERMITIDA: 409,
};

export class ErroNegocio extends Error {
  readonly codigo: CodigoErro;
  readonly statusHttp: number;
  readonly campos?: Record<string, string>;

  constructor(codigo: CodigoErro, mensagem: string, campos?: Record<string, string>) {
    super(mensagem);
    this.name = "ErroNegocio";
    this.codigo = codigo;
    this.statusHttp = STATUS_HTTP[codigo];
    this.campos = campos;
  }
}
