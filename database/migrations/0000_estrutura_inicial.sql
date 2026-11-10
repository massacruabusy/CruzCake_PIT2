CREATE TYPE "public"."metodo_pagamento" AS ENUM('PIX', 'CARTAO');--> statement-breakpoint
CREATE TYPE "public"."papel_usuario" AS ENUM('CLIENTE', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."status_pagamento" AS ENUM('PENDENTE', 'APROVADO', 'RECUSADO');--> statement-breakpoint
CREATE TYPE "public"."status_pedido" AS ENUM('AGUARDANDO_PAGAMENTO', 'PAGO', 'EM_PREPARO', 'SAIU_PARA_ENTREGA', 'PRONTO_PARA_RETIRADA', 'ENTREGUE', 'CANCELADO');--> statement-breakpoint
CREATE TYPE "public"."tipo_cupom" AS ENUM('PERCENTUAL', 'VALOR_FIXO');--> statement-breakpoint
CREATE TYPE "public"."tipo_entrega" AS ENUM('ENTREGA', 'RETIRADA');--> statement-breakpoint
CREATE TABLE "categorias" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(60) NOT NULL,
	"slug" varchar(60) NOT NULL,
	"ordem" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cupons" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo" varchar(30) NOT NULL,
	"tipo" "tipo_cupom" NOT NULL,
	"valor" integer NOT NULL,
	"valor_minimo_centavos" integer DEFAULT 0 NOT NULL,
	"valido_ate" timestamp with time zone,
	"ativo" boolean DEFAULT true NOT NULL,
	CONSTRAINT "cupons_valor_ck" CHECK ("cupons"."valor" > 0),
	CONSTRAINT "cupons_percentual_ck" CHECK ("cupons"."tipo" <> 'PERCENTUAL' OR "cupons"."valor" <= 100)
);
--> statement-breakpoint
CREATE TABLE "enderecos" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer NOT NULL,
	"apelido" varchar(40) DEFAULT 'Casa' NOT NULL,
	"cep" char(8) NOT NULL,
	"logradouro" varchar(160) NOT NULL,
	"numero" varchar(10) NOT NULL,
	"complemento" varchar(80),
	"bairro" varchar(80) NOT NULL,
	"cidade" varchar(80) NOT NULL,
	"uf" char(2) NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "enderecos_cep_ck" CHECK ("enderecos"."cep" ~ '^[0-9]{8}$')
);
--> statement-breakpoint
CREATE TABLE "historico_status_pedido" (
	"id" serial PRIMARY KEY NOT NULL,
	"pedido_id" integer NOT NULL,
	"status" "status_pedido" NOT NULL,
	"observacao" varchar(200),
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "itens_pedido" (
	"id" serial PRIMARY KEY NOT NULL,
	"pedido_id" integer NOT NULL,
	"produto_id" integer NOT NULL,
	"nome_produto" varchar(100) NOT NULL,
	"preco_unitario_centavos" integer NOT NULL,
	"quantidade" integer NOT NULL,
	"subtotal_centavos" integer NOT NULL,
	CONSTRAINT "itens_pedido_qtd_ck" CHECK ("itens_pedido"."quantidade" > 0)
);
--> statement-breakpoint
CREATE TABLE "pagamentos" (
	"id" serial PRIMARY KEY NOT NULL,
	"pedido_id" integer NOT NULL,
	"metodo" "metodo_pagamento" NOT NULL,
	"status" "status_pagamento" DEFAULT 'PENDENTE' NOT NULL,
	"valor_centavos" integer NOT NULL,
	"codigo_transacao" varchar(64) NOT NULL,
	"pix_copia_e_cola" text,
	"cartao_final" char(4),
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pedidos" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer NOT NULL,
	"status" "status_pedido" DEFAULT 'AGUARDANDO_PAGAMENTO' NOT NULL,
	"tipo_entrega" "tipo_entrega" NOT NULL,
	"entrega_cep" char(8),
	"entrega_logradouro" varchar(160),
	"entrega_numero" varchar(10),
	"entrega_complemento" varchar(80),
	"entrega_bairro" varchar(80),
	"entrega_cidade" varchar(80),
	"entrega_uf" char(2),
	"cupom_id" integer,
	"subtotal_centavos" integer NOT NULL,
	"desconto_centavos" integer DEFAULT 0 NOT NULL,
	"frete_centavos" integer DEFAULT 0 NOT NULL,
	"total_centavos" integer NOT NULL,
	"observacao" varchar(300),
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pedidos_total_ck" CHECK ("pedidos"."total_centavos" >= 0),
	CONSTRAINT "pedidos_endereco_ck" CHECK ("pedidos"."tipo_entrega" = 'RETIRADA' OR ("pedidos"."entrega_cep" IS NOT NULL AND "pedidos"."entrega_logradouro" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "produtos" (
	"id" serial PRIMARY KEY NOT NULL,
	"categoria_id" integer NOT NULL,
	"nome" varchar(100) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"descricao" text NOT NULL,
	"ingredientes" text,
	"preco_centavos" integer NOT NULL,
	"estoque" integer DEFAULT 0 NOT NULL,
	"imagem_url" varchar(255) NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"destaque" boolean DEFAULT false NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "produtos_preco_ck" CHECK ("produtos"."preco_centavos" > 0),
	CONSTRAINT "produtos_estoque_ck" CHECK ("produtos"."estoque" >= 0)
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(120) NOT NULL,
	"email" varchar(160) NOT NULL,
	"senha_hash" varchar(100) NOT NULL,
	"telefone" varchar(20),
	"papel" "papel_usuario" DEFAULT 'CLIENTE' NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "enderecos" ADD CONSTRAINT "enderecos_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "historico_status_pedido" ADD CONSTRAINT "historico_status_pedido_pedido_id_pedidos_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_pedido_id_pedidos_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_produto_id_produtos_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_pedido_id_pedidos_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_cupom_id_cupons_id_fk" FOREIGN KEY ("cupom_id") REFERENCES "public"."cupons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "categorias_slug_uk" ON "categorias" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "categorias_nome_uk" ON "categorias" USING btree ("nome");--> statement-breakpoint
CREATE UNIQUE INDEX "cupons_codigo_uk" ON "cupons" USING btree ("codigo");--> statement-breakpoint
CREATE INDEX "enderecos_usuario_idx" ON "enderecos" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX "historico_pedido_idx" ON "historico_status_pedido" USING btree ("pedido_id");--> statement-breakpoint
CREATE INDEX "itens_pedido_pedido_idx" ON "itens_pedido" USING btree ("pedido_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pagamentos_pedido_uk" ON "pagamentos" USING btree ("pedido_id");--> statement-breakpoint
CREATE INDEX "pedidos_usuario_idx" ON "pedidos" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX "pedidos_status_idx" ON "pedidos" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "produtos_slug_uk" ON "produtos" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "produtos_categoria_idx" ON "produtos" USING btree ("categoria_id");--> statement-breakpoint
CREATE UNIQUE INDEX "usuarios_email_uk" ON "usuarios" USING btree ("email");