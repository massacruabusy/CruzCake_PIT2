/**
 * Dados iniciais (seed): categorias, cardápio, cupons e usuários de demonstração.
 * Idempotente: só insere se o banco estiver vazio.
 *
 * Usuários de teste (apenas ambiente de demonstração):
 *   admin@docenuvem.com.br   / Admin1234
 *   cliente@docenuvem.com.br / Cliente1234
 */
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import type { DB } from "../src/models/db/client";
import { categorias, cupons, produtos, usuarios } from "../src/models/db/schema";

const CATEGORIAS = [
  { nome: "Clássicos", slug: "classicos", ordem: 1 },
  { nome: "Gourmet", slug: "gourmet", ordem: 2 },
  { nome: "Veganos e sem glúten", slug: "veganos-sem-gluten", ordem: 3 },
  { nome: "Caixas e kits", slug: "caixas-e-kits", ordem: 4 },
];

type ProdutoSeed = {
  cat: string;
  nome: string;
  slug: string;
  descricao: string;
  ingredientes: string;
  preco: number;
  estoque: number;
  img: string;
  destaque?: boolean;
  ativo?: boolean;
};

const PRODUTOS: ProdutoSeed[] = [
  { cat: "classicos", nome: "Baunilha com Chantilly", slug: "baunilha-com-chantilly", descricao: "Massa amanteigada de baunilha com cobertura de chantilly batido na hora.", ingredientes: "Farinha de trigo, ovos, manteiga, açúcar, baunilha, creme de leite.", preco: 900, estoque: 40, img: "/img/cupcakes/baunilha.svg" },
  { cat: "classicos", nome: "Chocolate Belga", slug: "chocolate-belga", descricao: "Massa de cacau 50% e ganache cremosa de chocolate belga meio amargo.", ingredientes: "Farinha de trigo, cacau, chocolate belga, ovos, manteiga, açúcar.", preco: 1100, estoque: 35, img: "/img/cupcakes/chocolate.svg", destaque: true },
  { cat: "classicos", nome: "Red Velvet", slug: "red-velvet", descricao: "O clássico aveludado vermelho com frosting de cream cheese.", ingredientes: "Farinha de trigo, cacau, leitelho, cream cheese, ovos, açúcar.", preco: 1200, estoque: 30, img: "/img/cupcakes/red-velvet.svg", destaque: true },
  { cat: "classicos", nome: "Cenoura com Brigadeiro", slug: "cenoura-com-brigadeiro", descricao: "Bolo de cenoura fofinho com cobertura de brigadeiro de colher.", ingredientes: "Cenoura, farinha de trigo, ovos, óleo, leite condensado, cacau.", preco: 1000, estoque: 25, img: "/img/cupcakes/cenoura.svg" },
  { cat: "gourmet", nome: "Pistache Siciliano", slug: "pistache-siciliano", descricao: "Massa de pistache com recheio de creme de pistache e farofa crocante.", ingredientes: "Pistache, farinha de trigo, ovos, manteiga, açúcar, creme de leite.", preco: 1600, estoque: 18, img: "/img/cupcakes/pistache.svg", destaque: true },
  { cat: "gourmet", nome: "Limão Siciliano com Merengue", slug: "limao-siciliano-merengue", descricao: "Recheio de lemon curd e merengue italiano maçaricado.", ingredientes: "Limão siciliano, ovos, açúcar, manteiga, farinha de trigo.", preco: 1400, estoque: 20, img: "/img/cupcakes/limao.svg" },
  { cat: "gourmet", nome: "Frutas Vermelhas", slug: "frutas-vermelhas", descricao: "Massa branca com geleia artesanal de frutas vermelhas e buttercream de mascarpone.", ingredientes: "Morango, framboesa, amora, mascarpone, farinha de trigo, ovos.", preco: 1500, estoque: 4, img: "/img/cupcakes/frutas-vermelhas.svg" },
  { cat: "gourmet", nome: "Doce de Leite com Flor de Sal", slug: "doce-de-leite-flor-de-sal", descricao: "Recheio de doce de leite argentino e toque de flor de sal.", ingredientes: "Doce de leite, flor de sal, farinha de trigo, ovos, manteiga.", preco: 1400, estoque: 22, img: "/img/cupcakes/doce-de-leite.svg" },
  { cat: "veganos-sem-gluten", nome: "Chocolate Vegano", slug: "chocolate-vegano", descricao: "Sem ovos, leite ou manteiga. Cobertura de ganache de chocolate 70% com leite de coco.", ingredientes: "Farinha de arroz, cacau, leite de coco, açúcar demerara, óleo de coco.", preco: 1300, estoque: 15, img: "/img/cupcakes/vegano.svg" },
  { cat: "veganos-sem-gluten", nome: "Coco e Maracujá (sem glúten)", slug: "coco-maracuja-sem-gluten", descricao: "Massa de farinha de amêndoas com recheio de maracujá e coco queimado.", ingredientes: "Farinha de amêndoas, coco, maracujá, ovos, açúcar.", preco: 1300, estoque: 0, img: "/img/cupcakes/maracuja.svg" },
  { cat: "caixas-e-kits", nome: "Caixa Degustação (6 unidades)", slug: "caixa-degustacao-6", descricao: "Seis sabores sortidos escolhidos pela confeitaria. Ideal para presentear.", ingredientes: "Varia conforme os sabores do dia.", preco: 6200, estoque: 12, img: "/img/cupcakes/caixa.svg", destaque: true },
  { cat: "caixas-e-kits", nome: "Kit Festa (12 minis)", slug: "kit-festa-12-minis", descricao: "Doze mini cupcakes em três sabores clássicos, com toppers temáticos.", ingredientes: "Varia conforme os sabores do dia.", preco: 7800, estoque: 8, img: "/img/cupcakes/kit-festa.svg" },
  { cat: "gourmet", nome: "Café com Avelã (edição limitada)", slug: "cafe-com-avela", descricao: "Edição sazonal fora de linha.", ingredientes: "Café, avelã, farinha de trigo, ovos.", preco: 1500, estoque: 10, img: "/img/cupcakes/cafe.svg", ativo: false },
];

export async function semearBanco(db: DB, opcoes: { log?: boolean } = {}) {
  const existentes = await db.select({ id: categorias.id }).from(categorias).limit(1);
  if (existentes.length > 0) {
    if (opcoes.log) console.log("Seed: banco já possui dados, nada a fazer.");
    return;
  }

  const cats = await db.insert(categorias).values(CATEGORIAS).returning();
  const idCategoria = new Map(cats.map((c) => [c.slug, c.id]));

  await db.insert(produtos).values(
    PRODUTOS.map((p) => ({
      categoriaId: idCategoria.get(p.cat)!,
      nome: p.nome,
      slug: p.slug,
      descricao: p.descricao,
      ingredientes: p.ingredientes,
      precoCentavos: p.preco,
      estoque: p.estoque,
      imagemUrl: p.img,
      destaque: p.destaque ?? false,
      ativo: p.ativo ?? true,
    })),
  );

  await db.insert(cupons).values([
    { codigo: "BEMVINDO10", tipo: "PERCENTUAL", valor: 10, valorMinimoCentavos: 3000 },
    { codigo: "DOCE5", tipo: "VALOR_FIXO", valor: 500, valorMinimoCentavos: 4000 },
    { codigo: "NATAL2025", tipo: "PERCENTUAL", valor: 15, valorMinimoCentavos: 0, validoAte: new Date("2025-12-26T03:00:00Z") },
  ]);

  await db.insert(usuarios).values([
    { nome: "Administração Doce Nuvem", email: "admin@docenuvem.com.br", senhaHash: await bcrypt.hash("Admin1234", 10), papel: "ADMIN" },
    { nome: "Cliente Demonstração", email: "cliente@docenuvem.com.br", senhaHash: await bcrypt.hash("Cliente1234", 10), telefone: "(11) 91234-5678", papel: "CLIENTE" },
  ]);

  if (opcoes.log) console.log(`Seed: ${CATEGORIAS.length} categorias, ${PRODUTOS.length} produtos, 3 cupons e 2 usuários criados.`);
}

/**
 * Cria (ou atualiza) um administrador pessoal a partir de variáveis de ambiente,
 * para não depender da conta de demonstração com senha pública:
 *   ADMIN_NOME, ADMIN_EMAIL, ADMIN_SENHA  (definir em .env.local ou nas variáveis do deploy)
 */
export async function garantirAdminPessoal(db: DB) {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const senha = process.env.ADMIN_SENHA;
  if (!email || !senha) return;
  if (senha.length < 8 || !/[A-Za-z]/.test(senha) || !/d/.test(senha)) {
    throw new Error("ADMIN_SENHA precisa ter 8+ caracteres, com letras e números (RN10).");
  }
  const nome = process.env.ADMIN_NOME?.trim() || "Administrador";
  const senhaHash = await bcrypt.hash(senha, 10);
  const existente = await db.query.usuarios.findFirst({ where: eq(usuarios.email, email) });
  if (existente) {
    await db.update(usuarios).set({ nome, senhaHash, papel: "ADMIN" }).where(eq(usuarios.id, existente.id));
    console.log(`Admin pessoal atualizado: ${email}`);
  } else {
    await db.insert(usuarios).values({ nome, email, senhaHash, papel: "ADMIN" });
    console.log(`Admin pessoal criado: ${email}`);
  }
}
