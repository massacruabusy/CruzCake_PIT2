# Laudo de Qualidade — CruzCake Cupcakes

## 1. Identificação

| Item | Informação |
|---|---|
| Sistema | CruzCake Cupcakes: loja virtual com vitrine, carrinho, checkout (PIX/cartão simulados), acompanhamento de pedidos e painel administrativo |
| Versão avaliada | [preencher: tag/commit, ex.: `v1.0` / `abc1234`] |
| Versão após correções | [preencher: tag/commit] |
| URL de teste | [LINK DO APP] |
| Repositório | [LINK DO REPOSITÓRIO] |
| Responsável | Guilherme Henrique Dalla Rosa |
| Período de testes | 09/11/2026 (automatizados e CT-01 a CT-04) a [preencher] |

## 2. Metodologia

Os testes seguiram o [Plano de Testes](01-plano-de-testes.md), organizado pelos níveis do Modelo V:

1. **Verificação:** TypeScript, ESLint, build de produção, 62 testes automatizados (unitários + integração com PostgreSQL em memória).
2. **Teste de sistema:** 30 casos manuais ponta a ponta ([02-casos-de-teste-manuais.md](02-casos-de-teste-manuais.md)).
3. **Validação/aceitação:** 5 testadores reais usando o app publicado, com registro pelo [formulário](03-formulario-teste-usuarios.md) e consolidação nas [fichas](04-fichas-dos-testadores.md).
4. Correção dos defeitos pertinentes, reteste e atualização deste laudo.

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
| Arquivos de teste | 4 |
| Testes executados | 62 |
| Aprovados | **62 (100%)** |
| Reprovados | 0 |
| Regras de negócio cobertas | RN01 a RN10 (ver matriz no plano de testes) |
| TypeScript (`npm run typecheck`) | Sem erros |
| ESLint (`npm run lint`) | Sem erros |
| Build de produção (`npm run build`) | Sucesso |

Distribuição: 33 testes unitários (regras de pedido, pagamento e validações de entrada) e 19 de integração (autenticação, vitrine, carrinho, checkout e ciclo do pedido, administração).

Reexecução após as correções: [preencher: X/X aprovados em DD/MM/AAAA]

### 3.2 Testes de sistema (manuais)

| Indicador | Resultado |
|---|---|
| Casos planejados | 30 |
| Executados | [preencher] (4 executados em 09/11/2026: CT-01 a CT-04) |
| Passou | [preencher] |
| Falhou | [preencher] |
| Bloqueado | [preencher] |

### 3.3 Testes com usuários (aceitação)

| Indicador | Resultado |
|---|---|
| Testadores | [preencher]/5 |
| Apontamentos recebidos | [preencher] |
| Defeitos (Bloqueante/Alta/Média/Baixa) | [preencher] / [preencher] / [preencher] / [preencher] |
| Sugestões | [preencher] |
| Média "facilidade de comprar" (1–5) | [preencher] |
| Média "clareza das mensagens" (1–5) | [preencher] |
| "Compraria nesta loja" (Sim/Talvez/Não) | [preencher] |

## 4. Defeitos encontrados e correções

Origem: **AUT** = teste automatizado · **CT-xx** = caso manual · **T1–T5** = testador.

| ID | Descrição (passos para reproduzir) | Gravidade | Origem | Evidência | Correção aplicada | Commit | Reteste |
|---|---|---|---|---|---|---|---|
| D-01 | [preencher] | [preencher] | [T1] | `TESTADOR-1_01.png` | [preencher] | [hash] | [Passou/Falhou] |
| D-02 | [preencher] | [preencher] | [preencher] | [preencher] | [preencher] | [hash] | [preencher] |
| D-03 | [preencher] | [preencher] | [preencher] | [preencher] | [preencher] | [hash] | [preencher] |

> Para cada defeito corrigido, recomenda-se também adicionar um teste automatizado que reproduza o problema, evitando regressão.

### Evidências

Os prints antes e depois de cada correção ficam em [`evidencias/`](evidencias/README.md). Insira-os abaixo na versão em PDF:

[inserir prints: D-01 antes / depois …]

## 5. Melhorias incorporadas a partir das sugestões

| ID | Sugestão (testador) | Decisão | Implementação / commit |
|---|---|---|---|
| M-01 | [preencher] | [Incorporada / Backlog] | [preencher] |
| M-02 | [preencher] | [preencher] | [preencher] |

As melhorias incorporadas também devem ser refletidas na documentação: histórias de usuário/backlog (Situação 1) e manual de uso (Situação 2).

## 6. Pendências conhecidas e justificativas

| Item | Justificativa |
|---|---|
| Pagamento real (gateway PIX/cartão) | Fora do escopo acadêmico: o pagamento é simulado (RN06) para não envolver dados financeiros reais. A arquitetura isola essa regra em `src/models/regras/pagamento.ts`, o que permite trocar pelo gateway. |
| Confirmação automática do PIX | Em produção viria de um *webhook* do provedor de pagamento; aqui é simulada por um botão. |
| Recuperação de senha por e-mail | Não implementada nesta versão (exige serviço de e-mail). Registrada no backlog. |
| [preencher: apontamentos dos testadores não corrigidos] | [preencher] |

## 7. Parecer final

[preencher após a rodada de testes. Modelo:]

> Com base nos testes automatizados (62/62 aprovados), na execução de [N]/30 casos de teste de sistema e na avaliação de 5 usuários, a versão [versão] da CruzCake Cupcakes **[atende / atende com ressalvas / não atende]** aos requisitos definidos. Foram corrigidos [N] defeitos ([N] de gravidade alta) e incorporadas [N] melhorias sugeridas. Permanecem [N] pendências de baixa gravidade, justificadas na seção 6, que não impedem o uso da solução.

Data: [preencher]
Responsável: Guilherme Henrique Dalla Rosa
