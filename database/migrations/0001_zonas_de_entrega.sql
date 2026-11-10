CREATE TABLE "zonas_entrega" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(80) NOT NULL,
	"cep_inicial" char(8) NOT NULL,
	"cep_final" char(8) NOT NULL,
	"valor_centavos" integer NOT NULL,
	"frete_gratis_a_partir_centavos" integer,
	"prazo_horas" integer NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "zonas_cep_ck" CHECK ("zonas_entrega"."cep_inicial" ~ '^[0-9]{8}$' AND "zonas_entrega"."cep_final" ~ '^[0-9]{8}$' AND "zonas_entrega"."cep_inicial" <= "zonas_entrega"."cep_final"),
	CONSTRAINT "zonas_valor_ck" CHECK ("zonas_entrega"."valor_centavos" >= 0),
	CONSTRAINT "zonas_prazo_ck" CHECK ("zonas_entrega"."prazo_horas" > 0)
);
--> statement-breakpoint
ALTER TABLE "pedidos" ADD COLUMN "zona_entrega_id" integer;--> statement-breakpoint
CREATE INDEX "zonas_faixa_idx" ON "zonas_entrega" USING btree ("cep_inicial","cep_final");--> statement-breakpoint
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_zona_entrega_id_zonas_entrega_id_fk" FOREIGN KEY ("zona_entrega_id") REFERENCES "public"."zonas_entrega"("id") ON DELETE set null ON UPDATE no action;