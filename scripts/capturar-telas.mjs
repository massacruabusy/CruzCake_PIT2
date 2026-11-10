/**
 * Gera as imagens de mockup (docs/situacao-1-planejamento/img) a partir da aplicação real.
 *
 * Uso: com o servidor rodando em http://localhost:3000 e o banco recém-criado (npm run db:reset),
 *   npm run telas
 * Usa o Microsoft Edge (ou Chrome) instalado na máquina, sem baixar navegador.
 */
import { chromium } from "playwright-core";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PASTA = "docs/situacao-1-planejamento/img";
const CLIENTE = { email: "cliente@cruzcake.com.br", senha: "Cliente1234" };
const ADMIN = { email: "admin@cruzcake.com.br", senha: "Admin1234" };
const CARTAO_OK = { numero: "4111 1111 1111 1111", nome: "CLIENTE TESTE", validade: "1230", cvv: "123" };
const CARTAO_RECUSADO = "4000 0000 0002 0000";

async function abrirNavegador() {
  for (const channel of ["msedge", "chrome"]) {
    try {
      return await chromium.launch({ channel });
    } catch {
      /* tenta o próximo */
    }
  }
  throw new Error("Instale o Microsoft Edge ou o Google Chrome.");
}

async function entrar(page, conta) {
  await page.request.post(`${BASE}/api/auth/sair`);
  const r = await page.request.post(`${BASE}/api/auth/entrar`, { data: conta });
  if (!r.ok()) throw new Error(`Login falhou para ${conta.email}: ${r.status()}`);
}

async function definirCarrinho(page, itens, cupom = "") {
  const { produtos } = await (await page.request.get(`${BASE}/api/produtos`)).json();
  const linhas = itens.map(([slug, quantidade]) => {
    const p = produtos.find((x) => x.slug === slug);
    return { produtoId: p.id, quantidade, nome: p.nome, imagemUrl: p.imagemUrl, precoCentavos: p.precoCentavos };
  });
  await page.goto(`${BASE}/`);
  await page.evaluate(([l, c]) => localStorage.setItem("cruzcake:carrinho:v1", JSON.stringify({ itens: l, cupom: c })), [linhas, cupom]);
}

const foto = (page, nome, opcoes = {}) => page.screenshot({ path: `${PASTA}/${nome}.jpg`, quality: 85, type: "jpeg", ...opcoes });

async function preencherCartao(page, numero) {
  await page.getByLabel("Cartão de crédito").check();
  await page.getByLabel("Número do cartão").fill(numero);
  await page.getByLabel("Nome impresso no cartão").fill(CARTAO_OK.nome);
  await page.getByLabel("Validade (MM/AA)").fill(CARTAO_OK.validade);
  await page.getByLabel("CVV").fill(CARTAO_OK.cvv);
}

async function main() {
  const navegador = await abrirNavegador();

  // ---------- Celular ----------
  const celular = await navegador.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const m = await celular.newPage();

  await m.goto(`${BASE}/`);
  await m.locator("#titulo-cardapio").scrollIntoViewIfNeeded();
  await m.evaluate(() => window.scrollBy(0, -70));
  await foto(m, "tela-01-vitrine-mobile");
  await m.getByRole("button", { name: "Adicionar" }).nth(1).click();
  await m.getByRole("status").filter({ hasText: "adicionado" }).waitFor();
  await foto(m, "tela-01-vitrine-mobile-adicionado");

  await definirCarrinho(m, [["chocolate-belga", 2], ["frutas-vermelhas", 6], ["coco-maracuja-sem-gluten", 1]], "NATAL2025");
  await m.goto(`${BASE}/carrinho`);
  await m.getByText("está vencido").waitFor();
  await foto(m, "tela-03-carrinho-erros", { fullPage: true });

  await m.request.post(`${BASE}/api/auth/sair`);
  await m.goto(`${BASE}/entrar?voltar=/checkout`);
  await m.getByLabel("E-mail").fill(CLIENTE.email);
  await m.getByLabel("Senha").fill("senhaerrada1");
  await m.getByRole("button", { name: "Entrar" }).click();
  await m.getByRole("alert").waitFor();
  await foto(m, "tela-04-entrar-erro");

  await entrar(m, CLIENTE);
  await definirCarrinho(m, [["chocolate-belga", 2], ["limao-siciliano-merengue", 2], ["baunilha-com-chantilly", 1]], "DOCE5");
  await m.goto(`${BASE}/checkout`);
  await m.getByText("Cupom DOCE5 aplicado").waitFor();
  await foto(m, "tela-06-checkout-mobile");
  await m.getByLabel("Retirar na loja").check();
  const confirmar = m.getByRole("button", { name: "Confirmar e gerar PIX" });
  await confirmar.scrollIntoViewIfNeeded();
  await m.getByText("Retirada na loja").waitFor();
  await foto(m, "tela-06-checkout-resumo");
  await confirmar.click();
  await m.waitForURL(/\/pedidos\/\d+/);
  await m.getByText("Pague com PIX").waitFor();
  await foto(m, "tela-07-pedido-pix");

  // ---------- Desktop ----------
  const desktop = await navegador.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1.5 });
  const d = await desktop.newPage();
  await entrar(d, CLIENTE);
  await definirCarrinho(d, [["red-velvet", 3], ["pistache-siciliano", 2]], "BEMVINDO10");
  await d.goto(`${BASE}/checkout`);
  await d.getByText("Cupom BEMVINDO10 aplicado").waitFor();
  if (await d.getByLabel("CEP", { exact: true }).isVisible()) {
    await d.getByLabel("CEP", { exact: true }).fill("01310100");
    await d.getByLabel("Rua", { exact: true }).fill("Avenida Paulista");
    await d.getByLabel("Número", { exact: true }).fill("1000");
    await d.getByLabel("Bairro", { exact: true }).fill("Bela Vista");
    await d.getByLabel("Cidade", { exact: true }).fill("São Paulo");
    await d.getByLabel("UF", { exact: true }).fill("SP");
  }
  await preencherCartao(d, CARTAO_RECUSADO);
  await d.getByRole("button", { name: "Pagar e confirmar pedido" }).click();
  await d.getByText("Pagamento recusado").waitFor();
  await d.evaluate(() => window.scrollTo(0, 0));
  await d.waitForTimeout(400);
  await foto(d, "tela-06-checkout-cartao-recusado");
  await d.getByLabel("Número do cartão").fill(CARTAO_OK.numero);
  await d.getByRole("button", { name: "Pagar e confirmar pedido" }).click();
  await d.waitForURL(/\/pedidos\/\d+/);
  const pedidoId = d.url().match(/pedidos\/(\d+)/)[1];
  await d.getByText("Pagamento aprovado").first().waitFor();
  await foto(d, "tela-07-pedido-cartao-desktop");

  await entrar(d, ADMIN);
  await d.request.patch(`${BASE}/api/admin/pedidos/${pedidoId}/status`, { data: { status: "EM_PREPARO", observacao: "Forno 2" } });
  await d.goto(`${BASE}/admin`);
  await foto(d, "tela-09-admin-painel");
  await d.goto(`${BASE}/admin/pedidos`);
  await foto(d, "tela-10-admin-pedidos");
  await d.goto(`${BASE}/admin/pedidos/${pedidoId}`);
  await foto(d, "tela-11-admin-pedido-detalhe");
  await d.goto(`${BASE}/admin/produtos`);
  await foto(d, "tela-12-admin-produtos");
  await d.goto(`${BASE}/admin/produtos/novo`);
  await d.getByRole("button", { name: "Salvar" }).click();
  await d.getByText("Selecione uma categoria.").first().waitFor();
  await d.getByLabel("Categoria").scrollIntoViewIfNeeded();
  await d.evaluate(() => window.scrollBy(0, -160));
  await foto(d, "tela-13-produto-validacoes");

  await navegador.close();
  console.log(`Telas salvas em ${PASTA}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
