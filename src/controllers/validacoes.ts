/**
 * CONTROLLER — Contratos de entrada. Toda requisição é validada aqui antes de chegar ao Model.
 * As mensagens são exibidas diretamente ao usuário, por isso estão em português claro.
 */
import { z } from "zod";
import { QUANTIDADE_MAXIMA_POR_ITEM } from "@/models/regras/pedido";

const texto = (min: number, max: number, rotulo: string) =>
  z
    .string({ error: `${rotulo} é obrigatório.` })
    .trim()
    .min(min, { error: min <= 1 ? `${rotulo} é obrigatório.` : `${rotulo} deve ter pelo menos ${min} caracteres.` })
    .max(max, { error: `${rotulo} deve ter no máximo ${max} caracteres.` });

/** RN10 — Senha com no mínimo 8 caracteres, contendo letras e números. */
export const senhaSchema = z
  .string({ error: "Senha é obrigatória." })
  .min(8, { error: "A senha deve ter pelo menos 8 caracteres." })
  .max(72, { error: "A senha deve ter no máximo 72 caracteres." })
  .regex(/[A-Za-z]/, { error: "A senha deve conter pelo menos uma letra." })
  .regex(/\d/, { error: "A senha deve conter pelo menos um número." });

export const cadastroSchema = z
  .object({
    nome: texto(3, 120, "Nome"),
    email: z.email({ error: "Informe um e-mail válido." }).max(160),
    telefone: z
      .string()
      .trim()
      .regex(/^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/, { error: "Telefone inválido. Ex.: (11) 91234-5678" })
      .optional()
      .or(z.literal("")),
    senha: senhaSchema,
    confirmacaoSenha: z.string(),
  })
  .refine((d) => d.senha === d.confirmacaoSenha, {
    error: "As senhas não conferem.",
    path: ["confirmacaoSenha"],
  });

export const loginSchema = z.object({
  email: z.email({ error: "Informe um e-mail válido." }),
  senha: z.string().min(1, { error: "Informe sua senha." }),
});

export const itensCarrinhoSchema = z
  .array(
    z.object({
      produtoId: z.number().int().positive(),
      quantidade: z
        .number()
        .int()
        .min(1, { error: "Quantidade mínima é 1." })
        .max(QUANTIDADE_MAXIMA_POR_ITEM, { error: `Quantidade máxima é ${QUANTIDADE_MAXIMA_POR_ITEM}.` }),
    }),
  )
  .max(50);

export const precificarSchema = z.object({
  itens: itensCarrinhoSchema,
  tipoEntrega: z.enum(["ENTREGA", "RETIRADA"]).default("ENTREGA"),
  codigoCupom: z.string().trim().max(30).optional().nullable(),
});

export const enderecoSchema = z.object({
  cep: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .pipe(z.string().length(8, { error: "CEP deve ter 8 dígitos." })),
  logradouro: texto(3, 160, "Rua"),
  numero: texto(1, 10, "Número"),
  complemento: z.string().trim().max(80).optional().nullable(),
  bairro: texto(2, 80, "Bairro"),
  cidade: texto(2, 80, "Cidade"),
  uf: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/, { error: "UF deve ter 2 letras." })
    .transform((v) => v.toUpperCase()),
});

export const cartaoSchema = z.object({
  numero: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .pipe(z.string().min(13, { error: "Número do cartão incompleto." }).max(19)),
  nomeImpresso: texto(3, 60, "Nome impresso no cartão"),
  validade: z.string().regex(/^\d{2}\/\d{2}$/, { error: "Validade no formato MM/AA." }),
  cvv: z.string().regex(/^\d{3,4}$/, { error: "CVV deve ter 3 ou 4 dígitos." }),
});

export const checkoutSchema = z
  .object({
    itens: itensCarrinhoSchema.min(1, { error: "Seu carrinho está vazio." }),
    tipoEntrega: z.enum(["ENTREGA", "RETIRADA"], { error: "Escolha entrega ou retirada." }),
    endereco: enderecoSchema.optional().nullable(),
    salvarEndereco: z.boolean().optional(),
    codigoCupom: z.string().trim().max(30).optional().nullable(),
    metodoPagamento: z.enum(["PIX", "CARTAO"], { error: "Escolha a forma de pagamento." }),
    cartao: cartaoSchema.optional().nullable(),
    observacao: z.string().trim().max(300, { error: "Observação com no máximo 300 caracteres." }).optional().nullable(),
  })
  .superRefine((d, ctx) => {
    if (d.tipoEntrega === "ENTREGA" && !d.endereco) {
      ctx.addIssue({ code: "custom", path: ["endereco"], message: "Informe o endereço de entrega." });
    }
    if (d.metodoPagamento === "CARTAO" && !d.cartao) {
      ctx.addIssue({ code: "custom", path: ["cartao"], message: "Informe os dados do cartão." });
    }
  });

export const produtoSchema = z.object({
  nome: texto(3, 100, "Nome"),
  categoriaId: z.coerce.number().int().positive({ error: "Selecione uma categoria." }),
  descricao: texto(10, 2000, "Descrição"),
  ingredientes: z.string().trim().max(1000).optional().nullable(),
  precoCentavos: z.coerce
    .number({ error: "Preço inválido." })
    .int()
    .positive({ error: "O preço deve ser maior que zero." })
    .max(100000, { error: "Preço acima do permitido (R$ 1.000,00)." }),
  estoque: z.coerce.number().int().min(0, { error: "O estoque não pode ser negativo." }).max(10000),
  imagemUrl: z.string().trim().min(1, { error: "Informe a imagem." }).max(255),
  ativo: z.boolean(),
  destaque: z.boolean(),
});

export const mudarStatusSchema = z.object({
  status: z.enum([
    "AGUARDANDO_PAGAMENTO",
    "PAGO",
    "EM_PREPARO",
    "SAIU_PARA_ENTREGA",
    "PRONTO_PARA_RETIRADA",
    "ENTREGUE",
    "CANCELADO",
  ]),
  observacao: z.string().trim().max(200).optional().nullable(),
});
