/**
 * MODEL — Esquema físico do banco de dados (PostgreSQL).
 *
 * Fonte única da verdade da persistência. As migrações SQL em `database/migrations`
 * são geradas a partir deste arquivo (`npm run db:generate`).
 * Convenções: nomes em português, snake_case no banco, valores monetários em centavos (inteiro).
 */
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  char,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const papelUsuarioEnum = pgEnum("papel_usuario", ["CLIENTE", "ADMIN"]);

export const statusPedidoEnum = pgEnum("status_pedido", [
  "AGUARDANDO_PAGAMENTO",
  "PAGO",
  "EM_PREPARO",
  "SAIU_PARA_ENTREGA",
  "PRONTO_PARA_RETIRADA",
  "ENTREGUE",
  "CANCELADO",
]);

export const tipoEntregaEnum = pgEnum("tipo_entrega", ["ENTREGA", "RETIRADA"]);
export const metodoPagamentoEnum = pgEnum("metodo_pagamento", ["PIX", "CARTAO"]);
export const statusPagamentoEnum = pgEnum("status_pagamento", ["PENDENTE", "APROVADO", "RECUSADO"]);
export const tipoCupomEnum = pgEnum("tipo_cupom", ["PERCENTUAL", "VALOR_FIXO"]);

export const usuarios = pgTable(
  "usuarios",
  {
    id: serial("id").primaryKey(),
    nome: varchar("nome", { length: 120 }).notNull(),
    email: varchar("email", { length: 160 }).notNull(),
    senhaHash: varchar("senha_hash", { length: 100 }).notNull(),
    telefone: varchar("telefone", { length: 20 }),
    papel: papelUsuarioEnum("papel").notNull().default("CLIENTE"),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("usuarios_email_uk").on(t.email)],
);

export const enderecos = pgTable(
  "enderecos",
  {
    id: serial("id").primaryKey(),
    usuarioId: integer("usuario_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    apelido: varchar("apelido", { length: 40 }).notNull().default("Casa"),
    cep: char("cep", { length: 8 }).notNull(),
    logradouro: varchar("logradouro", { length: 160 }).notNull(),
    numero: varchar("numero", { length: 10 }).notNull(),
    complemento: varchar("complemento", { length: 80 }),
    bairro: varchar("bairro", { length: 80 }).notNull(),
    cidade: varchar("cidade", { length: 80 }).notNull(),
    uf: char("uf", { length: 2 }).notNull(),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("enderecos_usuario_idx").on(t.usuarioId),
    check("enderecos_cep_ck", sql`${t.cep} ~ '^[0-9]{8}$'`),
  ],
);

export const categorias = pgTable(
  "categorias",
  {
    id: serial("id").primaryKey(),
    nome: varchar("nome", { length: 60 }).notNull(),
    slug: varchar("slug", { length: 60 }).notNull(),
    ordem: integer("ordem").notNull().default(0),
  },
  (t) => [uniqueIndex("categorias_slug_uk").on(t.slug), uniqueIndex("categorias_nome_uk").on(t.nome)],
);

export const produtos = pgTable(
  "produtos",
  {
    id: serial("id").primaryKey(),
    categoriaId: integer("categoria_id")
      .notNull()
      .references(() => categorias.id, { onDelete: "restrict" }),
    nome: varchar("nome", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    descricao: text("descricao").notNull(),
    ingredientes: text("ingredientes"),
    precoCentavos: integer("preco_centavos").notNull(),
    estoque: integer("estoque").notNull().default(0),
    imagemUrl: varchar("imagem_url", { length: 255 }).notNull(),
    ativo: boolean("ativo").notNull().default(true),
    destaque: boolean("destaque").notNull().default(false),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
    atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("produtos_slug_uk").on(t.slug),
    index("produtos_categoria_idx").on(t.categoriaId),
    check("produtos_preco_ck", sql`${t.precoCentavos} > 0`),
    check("produtos_estoque_ck", sql`${t.estoque} >= 0`),
  ],
);

export const cupons = pgTable(
  "cupons",
  {
    id: serial("id").primaryKey(),
    codigo: varchar("codigo", { length: 30 }).notNull(),
    tipo: tipoCupomEnum("tipo").notNull(),
    valor: integer("valor").notNull(),
    valorMinimoCentavos: integer("valor_minimo_centavos").notNull().default(0),
    validoAte: timestamp("valido_ate", { withTimezone: true }),
    ativo: boolean("ativo").notNull().default(true),
  },
  (t) => [
    uniqueIndex("cupons_codigo_uk").on(t.codigo),
    check("cupons_valor_ck", sql`${t.valor} > 0`),
    check("cupons_percentual_ck", sql`${t.tipo} <> 'PERCENTUAL' OR ${t.valor} <= 100`),
  ],
);

export const pedidos = pgTable(
  "pedidos",
  {
    id: serial("id").primaryKey(),
    usuarioId: integer("usuario_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "restrict" }),
    status: statusPedidoEnum("status").notNull().default("AGUARDANDO_PAGAMENTO"),
    tipoEntrega: tipoEntregaEnum("tipo_entrega").notNull(),
    // Endereço copiado no momento da compra (o cliente pode alterar/remover o endereço depois).
    entregaCep: char("entrega_cep", { length: 8 }),
    entregaLogradouro: varchar("entrega_logradouro", { length: 160 }),
    entregaNumero: varchar("entrega_numero", { length: 10 }),
    entregaComplemento: varchar("entrega_complemento", { length: 80 }),
    entregaBairro: varchar("entrega_bairro", { length: 80 }),
    entregaCidade: varchar("entrega_cidade", { length: 80 }),
    entregaUf: char("entrega_uf", { length: 2 }),
    cupomId: integer("cupom_id").references(() => cupons.id, { onDelete: "set null" }),
    subtotalCentavos: integer("subtotal_centavos").notNull(),
    descontoCentavos: integer("desconto_centavos").notNull().default(0),
    freteCentavos: integer("frete_centavos").notNull().default(0),
    totalCentavos: integer("total_centavos").notNull(),
    observacao: varchar("observacao", { length: 300 }),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
    atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("pedidos_usuario_idx").on(t.usuarioId),
    index("pedidos_status_idx").on(t.status),
    check("pedidos_total_ck", sql`${t.totalCentavos} >= 0`),
    check(
      "pedidos_endereco_ck",
      sql`${t.tipoEntrega} = 'RETIRADA' OR (${t.entregaCep} IS NOT NULL AND ${t.entregaLogradouro} IS NOT NULL)`,
    ),
  ],
);

export const itensPedido = pgTable(
  "itens_pedido",
  {
    id: serial("id").primaryKey(),
    pedidoId: integer("pedido_id")
      .notNull()
      .references(() => pedidos.id, { onDelete: "cascade" }),
    produtoId: integer("produto_id")
      .notNull()
      .references(() => produtos.id, { onDelete: "restrict" }),
    nomeProduto: varchar("nome_produto", { length: 100 }).notNull(),
    precoUnitarioCentavos: integer("preco_unitario_centavos").notNull(),
    quantidade: integer("quantidade").notNull(),
    subtotalCentavos: integer("subtotal_centavos").notNull(),
  },
  (t) => [
    index("itens_pedido_pedido_idx").on(t.pedidoId),
    check("itens_pedido_qtd_ck", sql`${t.quantidade} > 0`),
  ],
);

export const pagamentos = pgTable(
  "pagamentos",
  {
    id: serial("id").primaryKey(),
    pedidoId: integer("pedido_id")
      .notNull()
      .references(() => pedidos.id, { onDelete: "cascade" }),
    metodo: metodoPagamentoEnum("metodo").notNull(),
    status: statusPagamentoEnum("status").notNull().default("PENDENTE"),
    valorCentavos: integer("valor_centavos").notNull(),
    codigoTransacao: varchar("codigo_transacao", { length: 64 }).notNull(),
    pixCopiaECola: text("pix_copia_e_cola"),
    cartaoFinal: char("cartao_final", { length: 4 }),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
    atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("pagamentos_pedido_uk").on(t.pedidoId)],
);

export const historicoStatusPedido = pgTable(
  "historico_status_pedido",
  {
    id: serial("id").primaryKey(),
    pedidoId: integer("pedido_id")
      .notNull()
      .references(() => pedidos.id, { onDelete: "cascade" }),
    status: statusPedidoEnum("status").notNull(),
    observacao: varchar("observacao", { length: 200 }),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("historico_pedido_idx").on(t.pedidoId)],
);

// ---------- Relações (usadas pelas consultas relacionais do ORM) ----------

export const usuariosRelations = relations(usuarios, ({ many }) => ({
  enderecos: many(enderecos),
  pedidos: many(pedidos),
}));

export const enderecosRelations = relations(enderecos, ({ one }) => ({
  usuario: one(usuarios, { fields: [enderecos.usuarioId], references: [usuarios.id] }),
}));

export const categoriasRelations = relations(categorias, ({ many }) => ({
  produtos: many(produtos),
}));

export const produtosRelations = relations(produtos, ({ one }) => ({
  categoria: one(categorias, { fields: [produtos.categoriaId], references: [categorias.id] }),
}));

export const pedidosRelations = relations(pedidos, ({ one, many }) => ({
  usuario: one(usuarios, { fields: [pedidos.usuarioId], references: [usuarios.id] }),
  cupom: one(cupons, { fields: [pedidos.cupomId], references: [cupons.id] }),
  itens: many(itensPedido),
  pagamento: one(pagamentos),
  historico: many(historicoStatusPedido),
}));

export const itensPedidoRelations = relations(itensPedido, ({ one }) => ({
  pedido: one(pedidos, { fields: [itensPedido.pedidoId], references: [pedidos.id] }),
  produto: one(produtos, { fields: [itensPedido.produtoId], references: [produtos.id] }),
}));

export const pagamentosRelations = relations(pagamentos, ({ one }) => ({
  pedido: one(pedidos, { fields: [pagamentos.pedidoId], references: [pedidos.id] }),
}));

export const historicoStatusPedidoRelations = relations(historicoStatusPedido, ({ one }) => ({
  pedido: one(pedidos, { fields: [historicoStatusPedido.pedidoId], references: [pedidos.id] }),
}));

export type Usuario = typeof usuarios.$inferSelect;
export type Endereco = typeof enderecos.$inferSelect;
export type Categoria = typeof categorias.$inferSelect;
export type Produto = typeof produtos.$inferSelect;
export type NovoProduto = typeof produtos.$inferInsert;
export type Cupom = typeof cupons.$inferSelect;
export type Pedido = typeof pedidos.$inferSelect;
export type ItemPedido = typeof itensPedido.$inferSelect;
export type Pagamento = typeof pagamentos.$inferSelect;
export type StatusPedido = (typeof statusPedidoEnum.enumValues)[number];
export type TipoEntrega = (typeof tipoEntregaEnum.enumValues)[number];
export type MetodoPagamento = (typeof metodoPagamentoEnum.enumValues)[number];
export type PapelUsuario = (typeof papelUsuarioEnum.enumValues)[number];
