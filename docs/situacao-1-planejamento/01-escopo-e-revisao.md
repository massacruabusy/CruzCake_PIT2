# 1. Escopo do projeto e revisão do planejamento (Kaizen)

> Documento da **Situação-Problema 1 do PIT II**: revisar o planejamento feito no PIT I, deixá-lo mais robusto e prepará-lo para a execução.

## 1.1 Contexto do negócio

A **CruzCake Cupcakes** é uma confeitaria de cupcakes gourmet com loja física em São Paulo. A dona já teve uma experiência ruim com outro fornecedor: o app foi construído sem ouvir o negócio, não funcionava e foi retirado do ar depois de muitas reclamações, arranhando a imagem da marca. Por isso o projeto começou por uma **imersão no negócio** (loja, produção e atendimento), seguida de levantamento de histórias de usuário com validação constante junto à cliente.

**Objetivo do produto:** vender cupcakes pela internet com uma experiência simples e confiável, cobrindo **vitrine virtual, pedido eletrônico, pagamento e entrega/retirada**, além de dar à loja uma ferramenta para controlar produtos, estoque e o andamento dos pedidos.

## 1.2 Partes interessadas e personas

| Persona | Quem é | O que espera do sistema |
|---|---|---|
| **Visitante** | Pessoa que chegou pelo Instagram ou Google | Ver o cardápio, preços e fotos sem precisar criar conta |
| **Cliente** | Comprador cadastrado (presente, festa, consumo próprio) | Comprar em poucos passos, saber o total antes de pagar e acompanhar o pedido |
| **Administradora (dona/confeiteira)** | Responsável pela produção e pelo atendimento | Cadastrar sabores, controlar estoque do dia e avançar o status dos pedidos |
| **Atendente** | Funcionária do balcão | Consultar pedidos de retirada e confirmar entregas |
| **Sistemas externos** | Gateway de pagamento (simulado) e ViaCEP | Autorizar pagamentos e completar endereços pelo CEP |

## 1.3 Escopo do MVP (o que foi construído)

| Módulo | Funcionalidades |
|---|---|
| Vitrine | Cardápio por categoria, busca, destaques, selo "últimas unidades", página do produto com ingredientes/alérgenos |
| Carrinho | Adicionar/alterar/remover itens, persistência no navegador, preços e estoque recalculados no servidor, cupom de desconto, estimativa de frete |
| Conta | Cadastro, login e logout com sessão segura, endereços salvos |
| Checkout | Entrega ou retirada na loja, endereço com preenchimento automático pelo CEP, pagamento com PIX ou cartão (**simulados**), observações |
| Pós-venda | Confirmação do pedido, "Meus pedidos", linha do tempo do status, cancelamento antes do preparo |
| Administração | Painel com indicadores e estoque baixo, cadastro/edição de produtos, lista de pedidos por situação, avanço de status com regras |

**Fora do escopo do MVP** (ficou no backlog, ver `02-historias-de-usuario.md`): gateway de pagamento real, recuperação de senha por e-mail, avaliações de produtos, agendamento de entrega por janela de horário, notificações por WhatsApp/e-mail, programa de fidelidade e encomendas personalizadas.

## 1.4 Revisão do planejamento do PIT I

No PIT I o trabalho registrou o processo de imersão e o backlog inicial (≈ 30 cartões, ≈ 90 pontos), mas deixou várias **questões técnicas em aberto**, transformadas em cartões de *spike*. Abaixo, como cada uma foi resolvida nesta revisão:

| Questão em aberto no PIT I | Decisão no PIT II | Justificativa |
|---|---|---|
| "O app será o mesmo para Android e iOS, ou uma versão para cada?" | **Aplicação web responsiva (mobile-first)**, uma única base de código | Atende Android, iOS e desktop sem publicar em lojas de apps; menor custo para uma loja pequena; o público chega por links do Instagram/WhatsApp, que abrem direto no navegador |
| "Qual tecnologia/plataforma vamos utilizar?" | **Next.js (TypeScript) + PostgreSQL**, organizado em **MVC** | Front e back na mesma linguagem; renderização no servidor (bom para SEO da vitrine); PostgreSQL é SGBD popular, gratuito e de fácil manutenção |
| "Como vamos controlar o estoque junto com as lojas físicas?" | Estoque **diário por produto** no banco, baixado na hora do pedido de forma atômica e devolvido no cancelamento (RN03); a loja ajusta a produção do dia pelo painel | Cupcake é produzido diariamente: o "estoque" representa a fornada do dia, não um estoque de longo prazo |
| "Quais sistemas de pagamento vamos integrar?" | PIX e cartão por meio de uma camada de pagamento **simulada** (RN06), isolada em `src/models/regras/pagamento.ts` | Projeto acadêmico sem contrato com adquirente; a camada isolada permite trocar pelo gateway real (ex.: Mercado Pago, Pagar.me) sem mexer no resto do sistema |
| Ferramenta de gestão (JIRA) | Backlog mantido em Markdown no próprio repositório (e opcionalmente no GitHub Projects) | Mantém documentação e código no mesmo lugar, como pede o PIT II |

### Melhorias de modelagem (ciclo Kaizen)

1. **Requisitos:** histórias reescritas no template completo (critérios de aceitação em DADO/QUANDO/ENTÃO, regras de negócio numeradas e requisitos não funcionais), em vez de cartões genéricos.
2. **Regras de negócio explícitas e numeradas (RN01–RN10)**, com o mesmo número no código e nos testes, garantindo rastreabilidade requisito → código → teste.
3. **Dinheiro em centavos (inteiros)** para evitar erros de arredondamento.
4. **Snapshot de preço e endereço no pedido:** o pedido guarda o nome/preço do produto e o endereço do momento da compra, para que alterações posteriores no cardápio não mudem pedidos antigos.
5. **Máquina de estados do pedido (RN07)**, que impede, por exemplo, marcar como "Entregue" um pedido ainda não preparado.
6. **Retirada na loja** incluída a partir do feedback da cliente: reduz o custo para o comprador e aproveita o fluxo da loja física.

## 1.5 Regras de negócio consolidadas

| ID | Regra |
|---|---|
| RN01 | Valores em centavos; total = subtotal − desconto + frete |
| RN02 | Frete fixo de R$ 9,90 para entrega; grátis quando os produtos (já com desconto) somam R$ 120,00 ou mais; retirada não paga frete |
| RN03 | Não é possível vender acima do estoque; o estoque é baixado ao criar o pedido e devolvido ao cancelar |
| RN04 | Máximo de 24 unidades do mesmo produto por pedido |
| RN05 | Cupom precisa existir, estar ativo, dentro da validade e atingir o valor mínimo; o desconto nunca passa do subtotal |
| RN06 | Pagamento simulado: cartão validado (Luhn, validade e CVV), cartões terminados em 0000 são recusados; PIX gera código e aguarda confirmação |
| RN07 | Status seguem o fluxo: Aguardando pagamento → Pago → Em preparo → Saiu para entrega / Pronto para retirada → Entregue (cancelamento possível até o preparo) |
| RN08 | O cliente só pode cancelar o próprio pedido antes de ele entrar em preparo |
| RN09 | Apenas produtos ativos aparecem na vitrine |
| RN10 | Senha com no mínimo 8 caracteres, contendo letras e números |

## 1.6 Requisitos não funcionais

| ID | Requisito |
|---|---|
| RNF01 Usabilidade | Interface mobile-first, utilizável com uma mão; mensagens de erro em português claro, junto ao campo |
| RNF02 Acessibilidade | Navegação por teclado, foco visível, rótulos em todos os campos, `aria-live` para avisos, contraste adequado |
| RNF03 Segurança | Senhas com hash bcrypt; sessão em cookie `httpOnly` assinado; preços sempre recalculados no servidor; dados de cartão nunca armazenados (somente os 4 últimos dígitos) |
| RNF04 Desempenho | Páginas renderizadas no servidor; consultas indexadas por categoria, status e usuário |
| RNF05 Confiabilidade | Criação de pedido em transação única: se o pagamento falhar, nada é gravado |
| RNF06 Manutenibilidade | Arquitetura MVC, regras de negócio em funções puras testadas, migrações versionadas |
| RNF07 Portabilidade | Roda localmente sem instalar banco (PostgreSQL embarcado) e em produção com PostgreSQL gerenciado |
