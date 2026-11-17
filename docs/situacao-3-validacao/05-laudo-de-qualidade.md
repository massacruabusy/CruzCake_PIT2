# Laudo de Qualidade — CruzCake Cupcakes

## 1. Identificação

| Item | Informação |
|---|---|
| Sistema | CruzCake Cupcakes: loja virtual com vitrine, carrinho, checkout (PIX/cartão simulados), acompanhamento de pedidos e painel administrativo |
| Versão avaliada pelos testadores | **v1**, tag `v1-antes-dos-testes` (commit `524909e`) |
| Versão após correções | **v2**, branch `v2-melhorias` (commits `f24f3a8` e `b84f362`) |
| URL de teste | https://cruz-cake-pit-2.vercel.app |
| Repositório | https://github.com/massacruabusy/CruzCake_PIT2 |
| Responsável | Guilherme Henrique Dalla Rosa |
| Período de testes | 09/11/2026 (automatizados e CT-01 a CT-04) e 12/11/2026 (validação com 5 usuários) |

## 2. Metodologia

Os testes seguiram o [Plano de Testes](01-plano-de-testes.md), organizado pelos níveis do Modelo V:

1. **Verificação:** TypeScript, ESLint, build de produção e 63 testes automatizados (unitários + integração com PostgreSQL em memória).
2. **Teste de sistema:** casos manuais ponta a ponta ([02-casos-de-teste-manuais.md](02-casos-de-teste-manuais.md)).
3. **Validação/aceitação:** 5 colegas de trabalho da área de e-commerce usaram a v1 publicada. O formulário de teste foi aplicado como uma ficha enviada por Slack/WhatsApp ([mensagem](07-mensagem-para-testadores.md)), com os campos do template oficial, e cada testador devolveu a ficha na própria conversa. As respostas estão nas [fichas](04-fichas-dos-testadores.md).
4. Tratamento de cada apontamento (incorporar, corrigir ou justificar), reteste e atualização deste laudo.

Classificação de gravidade:

| Gravidade | Critério |
|---|---|
| Bloqueante | Impede concluir uma compra ou operar a loja |
| Alta | Resultado incorreto (valor, estoque, status) ou falha de segurança |
| Média | Funciona, mas com dificuldade relevante para o usuário |
| Baixa | Problema visual, de texto ou de layout sem impacto funcional |
| Sugestão | Melhoria ou nova funcionalidade |

## 3. Resumo quantitativo

### 3.1 Testes automatizados (verificação)

| Indicador | Resultado |
|---|---|
| Arquivos de teste | 5 |
| Testes executados | 63 |
| Aprovados | **63 (100%)** |
| Reprovados | 0 |
| Regras de negócio cobertas | RN01 a RN10 (ver matriz no plano de testes) |
| TypeScript (`npm run typecheck`) | Sem erros |
| ESLint (`npm run lint`) | Sem erros |
| Build de produção (`npm run build`) | Sucesso |

Distribuição: 36 testes unitários (regras de pedido e frete, pagamento e validações de entrada) e 27 de integração (autenticação, vitrine, carrinho, frete por CEP, checkout e ciclo do pedido, administração e atualização do banco da v1 para a v2).

Reexecução após as correções: **63/63 aprovados em 16/11/2026** (branch `v2-melhorias`).

### 3.2 Testes de sistema (manuais)

| Indicador | Resultado |
|---|---|
| Casos planejados | 30 |
| Executados pelo desenvolvedor | CT-01 a CT-04 (09/11/2026), todos com status Passou |
| Validação em produção | 09/11/2026: login, cartão recusado e aprovado, PIX com confirmação e bloqueio de transição inválida no admin, executados na URL publicada |

### 3.3 Testes com usuários (aceitação)

| Indicador | Resultado |
|---|---|
| Testadores | **5/5** (Lucas, Mariele, Marília, Rafael e João) |
| Data | 12/11/2026 |
| Versão testada | v1 (`v1-antes-dos-testes`) |
| Defeitos funcionais (bugs) relatados | **0**. Mariele, Marília e Rafael afirmaram explicitamente que tudo o que testaram funcionou |
| Apontamentos de melhoria | **4** (Lucas, Mariele, Rafael e João) |
| Incorporados | 3 (frete/área de entrega, refino visual e minicarrinho) |
| Justificados (não pertinentes nesta versão) | 1 (login obrigatório para comprar) |
| Testadores sem apontamentos | 1 (Marília) |

## 4. Achados dos testadores e tratamento

Origem: **T1** Lucas · **T2** Mariele · **T3** Marília · **T4** Rafael · **T5** João. Os testadores não enviaram prints, então a evidência é o relato registrado na ficha.

| ID | Descrição | Gravidade | Origem | Evidência | Tratamento | Commit | Reteste |
|---|---|---|---|---|---|---|---|
| A-01 | Não é possível saber se a loja entrega no endereço antes de comprar | Alta | T1 | Relato na ficha 1 | **Incorporado**: cotação de frete por CEP na página do produto e no carrinho (sem login), com endereço, prazo e valor; zonas de entrega configuráveis pela loja; checkout recusa CEP fora da área e sugere retirada (US33, US34) | `f24f3a8` | Passou (testes de frete por zona e CEP fora da área) |
| A-02 | Visual genérico, pede refinamento | Sugestão | T2 | Relato na ficha 2 | **Incorporado**: topo com a marca e botões de ação, faixa de diferenciais, seção "Para presentear", cards e rodapé redesenhados (US39) | `b84f362` | Passou (inspeção visual em celular e desktop) |
| A-03 | Falta minicarrinho para acompanhar o valor sem trocar de tela | Média | T4 | Relato na ficha 4 | **Incorporado**: minicarrinho em gaveta lateral, aberto pelo ícone e ao adicionar produto, com ajuste de quantidade e subtotal (US37) | `f24f3a8` | Passou (inspeção no navegador) |
| A-04 | Exige login para comprar; sugere checkout como o da VTEX | Média | T5 | Relato na ficha 5 | **Justificado** (seção 6) e registrado no backlog (US40) | — | — |

### Evidências

As telas antes (v1) e depois (v2) estão em [`../situacao-1-planejamento/img/`](../situacao-1-planejamento/img/) e no [vídeo de melhorias](06-roteiro-video-melhorias.md). Para a versão em PDF, inserir:

- A-01: produto/carrinho sem cotação (v1) × `tela-02-produto-kit-frete.jpg` e `tela-02-frete-indisponivel.jpg` (v2)
- A-02: vitrine v1 × `tela-01-vitrine-desktop.jpg` e `tela-01-vitrine-mobile.jpg` (v2)
- A-03: carrinho só em página separada (v1) × `tela-03-minicarrinho.jpg` (v2)

## 5. Melhorias adicionais da revisão Kaizen (não citadas pelos testadores)

| ID | Melhoria | Implementação / commit |
|---|---|---|
| K-01 | Vitrine e busca mostram só produtos com estoque; a página do produto esgotado informa "Esgotado hoje" (US35) | `f24f3a8` |
| K-02 | Kits com arte que mostra a caixa e o conteúdo, selo "Kit para presentear" e categoria em destaque (US36) | `f24f3a8` |
| K-03 | Endereço preenchido pelo CEP com ViaCEP e BrasilAPI de reserva | `f24f3a8` |
| K-04 | Banco de produção da v1 recebe os dados da v2 (zonas de entrega) sem duplicar, coberto por teste | `bb440d5` |

## 6. Pendências conhecidas e justificativas

| Item | Justificativa |
|---|---|
| Checkout sem senha (A-04, US40) | O login só é pedido ao finalizar: navegar, cotar frete e montar o carrinho não exigem conta, e depois de entrar ou se cadastrar o cliente volta direto ao checkout. A conta é o que permite acompanhar o status, pagar o PIX depois e cancelar o pedido. Comprar só com e-mail exigiria um acesso seguro ao pedido por link ou código enviado por e-mail, fora do escopo atual. Fica no backlog com prioridade C. |
| Preço promocional programado (US38) | Nesta versão a loja faz promoção alterando o preço do produto e usando cupons. Fica no backlog. |
| Pagamento real (gateway PIX/cartão) | Fora do escopo acadêmico: o pagamento é simulado (RN06) para não envolver dados financeiros reais. A regra está isolada em `src/models/regras/pagamento.ts`, o que permite trocar pelo gateway. |
| Confirmação automática do PIX | Em produção viria de um *webhook* do provedor de pagamento; aqui é simulada por um botão. |
| Recuperação de senha por e-mail (US14) | Exige serviço de e-mail. Registrada no backlog. |

## 7. Parecer final

> Com base nos testes automatizados (63/63 aprovados), na execução dos casos de teste de sistema no ambiente local e no publicado, e na avaliação de 5 usuários da área de e-commerce em 12/11/2026, a versão v2 da CruzCake Cupcakes **atende** aos requisitos definidos. Os testadores não relataram defeitos funcionais. Dos 4 apontamentos de melhoria, 3 foram incorporados (cotação de frete por CEP com zonas de entrega, refino visual e minicarrinho) e 1 foi justificado e levado ao backlog (checkout sem senha). As pendências da seção 6 não impedem o uso da solução.

Data: 16/11/2026
Responsável: Guilherme Henrique Dalla Rosa
