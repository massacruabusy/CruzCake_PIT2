# Casos de Teste de Sistema (manuais)

Roteiro ponta a ponta executado no navegador, que corresponde ao nível **Teste de sistema** do Modelo V. Cada caso indica a tela, as regras de negócio cobertas, o resultado esperado e os campos para registrar a execução.

**Legenda de status:** `Passou` · `Falhou` · `Bloqueado` · `Pendente`
**Evidência:** nome do print salvo em [`evidencias/`](evidencias/README.md), no padrão `CT-xx_descricao.png`.

## Dados de teste

| Item | Valor |
|---|---|
| Cliente | `cliente@docenuvem.com.br` / `Cliente1234` |
| Administrador | `admin@docenuvem.com.br` / `Admin1234` |
| Cartão aprovado | `4111 1111 1111 1111`, validade `12/30`, CVV `123`, nome `CLIENTE TESTE` |
| Cartão recusado | `4000 0000 0002 0000`, validade `12/30`, CVV `123` |
| CEP | `01310-100`, número `1000` |
| Cupons | `BEMVINDO10` (10%, mín. R$ 30,00) · `DOCE5` (R$ 5,00, mín. R$ 40,00) · `NATAL2025` (vencido) |
| Estoque especial | *Frutas Vermelhas* = 4 un. · *Coco e Maracujá (sem glúten)* = 0 (esgotado) · *Café com Avelã* = inativo |

> Para recomeçar com o banco limpo em ambiente local: `npm run db:reset`.

## Resumo da execução

| CT | Título | Tela(s) | RN | Status |
|---|---|---|---|---|
| CT-01 | Checkout com cartão recusado | TELA-06 | RN03, RN06 | Passou |
| CT-02 | Checkout com cartão aprovado e cupom | TELA-03, TELA-06, TELA-07 | RN01, RN02, RN05, RN06 | Passou |
| CT-03 | Admin tenta pular etapa do pedido | TELA-11 | RN07 | Passou |
| CT-04 | Admin avança pedido com observação | TELA-11, TELA-07 | RN07 | Passou |
| CT-05 | Busca e filtro na vitrine | TELA-01 | RN09 | Pendente |
| CT-06 | Frete: entrega, frete grátis e retirada | TELA-03, TELA-06 | RN01, RN02 | Pendente |
| CT-07 | Cupom vencido | TELA-03 | RN05 | Pendente |
| CT-08 | Cupom abaixo do valor mínimo | TELA-03 | RN05 | Pendente |
| CT-09 | Produto esgotado | TELA-01, TELA-02 | RN03 | Pendente |
| CT-10 | Quantidade acima do estoque | TELA-02, TELA-03 | RN03, RN04 | Pendente |
| CT-11 | Validação do endereço de entrega | TELA-06 | — | Pendente |
| CT-12 | Compra com PIX e confirmação | TELA-06, TELA-07 | RN06, RN07 | Pendente |
| CT-13 | Cancelamento pelo cliente | TELA-07, TELA-11 | RN03, RN08 | Pendente |
| CT-14 | Fluxo completo do pedido no admin | TELA-09 a TELA-11 | RN07 | Pendente |
| CT-15 | Controle de acesso | TELA-07, TELA-09 | — | Pendente |
| CT-16 | Cadastro e inativação de produto | TELA-12, TELA-13, TELA-01 | RN09 | Pendente |
| CT-17 | Cadastro com senha fraca | TELA-05 | RN10 | Pendente |
| CT-18 | E-mail duplicado e login inválido | TELA-04, TELA-05 | — | Pendente |
| CT-19 | Carrinho persiste após recarregar | TELA-03 | — | Pendente |
| CT-20 | Responsividade em celular | Todas | — | Pendente |
| CT-21 | Navegação somente por teclado | TELA-01, TELA-03, TELA-06 | — | Pendente |
| CT-22 | Página inexistente (404) | — | — | Pendente |

---

## CT-01 — Checkout com cartão recusado

| Campo | Conteúdo |
|---|---|
| **Pré-condição** | Logado como cliente; carrinho com 3× Red Velvet e 2× Pistache Siciliano; cupom `BEMVINDO10` aplicado |
| **Passos** | 1. Abrir `/checkout`. 2. Escolher **Entrega**, informar CEP `01310-100` e sair do campo. 3. Informar número `1000`. 4. Escolher **Cartão de crédito** e preencher com o cartão **recusado**. 5. Clicar em **Pagar e confirmar pedido**. |
| **Resultado esperado** | Rua, bairro, cidade e UF são preenchidos automaticamente. Aparece no topo a mensagem "Pagamento recusado pela operadora do cartão. Tente outro cartão ou pague com PIX." Nenhum pedido é criado e o estoque não muda (rollback da transação). O carrinho continua preenchido. |
| **Resultado obtido** | Mensagem exibida conforme esperado; endereço preenchido pelo ViaCEP; nenhum pedido criado; usuário permaneceu no checkout com os dados preservados. |
| **Status** | **Passou**, executado pelo desenvolvedor em 09/11/2026 |
| **Evidência** | `CT-01_cartao-recusado.png` |

## CT-02 — Checkout com cartão aprovado e cupom

| Campo | Conteúdo |
|---|---|
| **Pré-condição** | Igual ao CT-01 (mesma sessão) |
| **Passos** | 1. Trocar o número do cartão pelo cartão **aprovado**. 2. Clicar em **Pagar e confirmar pedido**. |
| **Resultado esperado** | Redireciona para `/pedidos/{id}?novo=1` com a mensagem "Pedido #… recebido!". Situação **Pagamento aprovado**. Valores: subtotal R$ 68,00, desconto R$ 6,80, frete R$ 9,90, **total R$ 71,10**. Pagamento "Cartão final 1111 · aprovado". Linha do tempo com "Aguardando pagamento" e "Pagamento aprovado". Carrinho esvaziado. |
| **Resultado obtido** | Pedido **#1** criado com status PAGO e total R$ 71,10; valores, endereço, pagamento e linha do tempo conforme esperado; contador do carrinho zerado. |
| **Status** | **Passou**, executado pelo desenvolvedor em 09/11/2026 |
| **Evidência** | `CT-02_pedido-1-pago.png` |

## CT-03 — Admin tenta pular etapa do pedido

| Campo | Conteúdo |
|---|---|
| **Pré-condição** | Pedido #1 com status PAGO; logado como administrador |
| **Passos** | 1. Enviar `PATCH /api/admin/pedidos/1/status` com `{"status":"ENTREGUE"}`, pelo console do navegador ou por ferramenta de API. 2. Abrir `/admin/pedidos/1` e conferir que só são oferecidos botões das transições válidas. |
| **Resultado esperado** | HTTP **409** com `codigo: TRANSICAO_STATUS_INVALIDA` e a mensagem "Não é possível mudar o pedido de "Pagamento aprovado" para "Entregue"." A tela mostra apenas **Marcar como "Em preparo"** e **Cancelar pedido**. |
| **Resultado obtido** | Retornou 409 com a mensagem esperada; status do pedido inalterado. |
| **Status** | **Passou**, executado pelo desenvolvedor em 09/11/2026 |
| **Evidência** | `CT-03_transicao-invalida-409.png` |

## CT-04 — Admin avança pedido com observação

| Campo | Conteúdo |
|---|---|
| **Pré-condição** | Pedido #1 com status PAGO; logado como administrador |
| **Passos** | 1. Em `/admin/pedidos/1`, digitar a observação "Forno 2". 2. Clicar em **Marcar como "Em preparo"**. |
| **Resultado esperado** | Aviso "Pedido atualizado para "Em preparo"". O selo muda para **Em preparo** e a linha do tempo ganha o item "Em preparo · Forno 2". O próximo botão disponível passa a ser **Marcar como "Saiu para entrega"**. |
| **Resultado obtido** | Status atualizado para EM_PREPARO; observação "Forno 2" exibida na linha do tempo; próximo passo "Saiu para entrega" oferecido. |
| **Status** | **Passou**, executado pelo desenvolvedor em 09/11/2026 |
| **Evidência** | `CT-04_em-preparo-observacao.png` |

## CT-05 — Busca e filtro na vitrine

| Campo | Conteúdo |
|---|---|
| **Pré-condição** | Nenhuma (visitante) |
| **Passos** | 1. Abrir `/`. 2. Clicar na categoria **Veganos e sem glúten**. 3. Buscar "pistache" no campo de busca. 4. Buscar "xyz". 5. Procurar "Café com Avelã". |
| **Resultado esperado** | No passo 2 aparecem só produtos da categoria, com o chip marcado. No passo 3 aparece apenas *Pistache Siciliano*. No passo 4 aparece "Nenhum cupcake encontrado" com o botão "Ver todos os sabores". *Café com Avelã* (inativo) nunca aparece (RN09). Os destaques aparecem primeiro. |
| **Resultado obtido** | |
| **Status** | Pendente |
| **Evidência** | |

## CT-06 — Frete: entrega, frete grátis e retirada

| Campo | Conteúdo |
|---|---|
| **Pré-condição** | Logado como cliente, carrinho vazio |
| **Passos** | 1. Adicionar 1× Chocolate Belga (R$ 11,00) e ver o resumo no carrinho. 2. Adicionar 1× Caixa Degustação e 1× Kit Festa (subtotal ≥ R$ 120,00). 3. No checkout, alternar entre **Entrega** e **Retirar na loja**. |
| **Resultado esperado** | Passo 1: frete R$ 9,90. Passo 2: frete "Grátis". Passo 3: na retirada o frete é "Grátis" e os campos de endereço somem. O total sempre é igual a subtotal − desconto + frete (RN01, RN02). |
| **Resultado obtido** | |
| **Status** | Pendente |
| **Evidência** | |

## CT-07 — Cupom vencido

| Campo | Conteúdo |
|---|---|
| **Pré-condição** | Carrinho com qualquer item |
| **Passos** | 1. No carrinho, digitar `NATAL2025` e clicar em **Aplicar**. |
| **Resultado esperado** | Mensagem em vermelho "O cupom NATAL2025 está vencido." Nenhum desconto aplicado e o carrinho continua utilizável. |
| **Resultado obtido** | |
| **Status** | Pendente |
| **Evidência** | |

## CT-08 — Cupom abaixo do valor mínimo

| Campo | Conteúdo |
|---|---|
| **Pré-condição** | Carrinho com 1× Baunilha com Chantilly (R$ 9,00) |
| **Passos** | 1. Aplicar `DOCE5`. 2. Aumentar os itens até o subtotal passar de R$ 40,00. |
| **Resultado esperado** | Passo 1: "O cupom DOCE5 vale para compras a partir de R$ 40,00." Passo 2: "Cupom DOCE5 aplicado!" e desconto de R$ 5,00. |
| **Resultado obtido** | |
| **Status** | Pendente |
| **Evidência** | |

## CT-09 — Produto esgotado

| Campo | Conteúdo |
|---|---|
| **Pré-condição** | Nenhuma |
| **Passos** | 1. Na vitrine, localizar *Coco e Maracujá (sem glúten)*. 2. Abrir a página do produto. |
| **Resultado esperado** | O botão aparece como **Esgotado**, desabilitado, e não é possível adicionar ao carrinho. A página de detalhe mostra "Esgotado hoje — volte amanhã!" (RN03). |
| **Resultado obtido** | |
| **Status** | Pendente |
| **Evidência** | |

## CT-10 — Quantidade acima do estoque

| Campo | Conteúdo |
|---|---|
| **Pré-condição** | Logado como cliente; *Frutas Vermelhas* com 4 unidades |
| **Passos** | 1. Na página de *Frutas Vermelhas*, tentar aumentar a quantidade além de 4. 2. Adicionar 4 ao carrinho. 3. Em outra aba, como admin, alterar o estoque do produto para 2. 4. Voltar ao carrinho e recarregar. |
| **Resultado esperado** | Passo 1: o seletor para em 4, com o selo "Últimas 4". Passo 4: o item fica destacado com "Temos apenas 2 unidade(s) de Frutas Vermelhas disponíveis." e o botão **Finalizar compra** fica desabilitado até o ajuste. O limite de 24 por item (RN04) vale para produtos com estoque alto. |
| **Resultado obtido** | |
| **Status** | Pendente |
| **Evidência** | |

## CT-11 — Validação do endereço de entrega

| Campo | Conteúdo |
|---|---|
| **Pré-condição** | Logado, carrinho com itens, checkout com **Entrega** e "Usar outro endereço" |
| **Passos** | 1. Deixar o endereço em branco e confirmar. 2. Informar o CEP `00000-000`. 3. Informar a UF com 3 letras. |
| **Resultado esperado** | Passo 1: a mensagem do campo aparece ao lado do CEP ("Informe o endereço de entrega." ou "CEP deve ter 8 dígitos."). Passo 2: "CEP não encontrado. Confira ou preencha o endereço manualmente." Os campos com erro ficam com borda vermelha. Nenhum pedido é criado. |
| **Resultado obtido** | |
| **Status** | Pendente |
| **Evidência** | |

## CT-12 — Compra com PIX e confirmação

| Campo | Conteúdo |
|---|---|
| **Pré-condição** | Logado como cliente, carrinho com itens |
| **Passos** | 1. No checkout, escolher **Retirar na loja** e **PIX**. 2. Clicar em **Confirmar e gerar PIX**. 3. Clicar em **Copiar código**. 4. Clicar em **Simular pagamento confirmado**. |
| **Resultado esperado** | Passo 2: pedido criado com o status **Aguardando pagamento**, exibindo o bloco "Pague com PIX" com o código copia-e-cola que contém o valor. Passo 3: aviso "Código PIX copiado". Passo 4: status **Pagamento aprovado** e o bloco PIX desaparece. |
| **Resultado obtido** | |
| **Status** | Pendente |
| **Evidência** | |

## CT-13 — Cancelamento pelo cliente

| Campo | Conteúdo |
|---|---|
| **Pré-condição** | Um pedido PAGO e outro EM_PREPARO do mesmo cliente; anotar o estoque dos itens |
| **Passos** | 1. Abrir o pedido PAGO, clicar em **Cancelar pedido** e confirmar com **Sim, cancelar**. 2. Conferir o estoque no admin. 3. Abrir o pedido EM_PREPARO. |
| **Resultado esperado** | Passo 1: status **Cancelado** e o aviso "Pedido cancelado". Passo 2: o estoque volta ao valor anterior (RN03). Passo 3: o botão **Cancelar pedido** não aparece (RN08); se a API for chamada diretamente, ela responde "Seu pedido já está em preparo e não pode mais ser cancelado pelo app. Fale com a loja." |
| **Resultado obtido** | |
| **Status** | Pendente |
| **Evidência** | |

## CT-14 — Fluxo completo do pedido no admin

| Campo | Conteúdo |
|---|---|
| **Pré-condição** | Um pedido de **entrega** PAGO e um de **retirada** PAGO; logado como admin |
| **Passos** | 1. Em `/admin/pedidos`, filtrar por **Pagamento aprovado**. 2. Levar o pedido de entrega por Em preparo → Saiu para entrega → Entregue. 3. Levar o de retirada por Em preparo → Pronto para retirada → Entregue. 4. Conferir os indicadores em `/admin`. |
| **Resultado esperado** | A cada etapa só a próxima transição válida é oferecida (RN07). Pedido de entrega nunca oferece "Pronto para retirada" e vice-versa. Ao chegar em Entregue aparece "Este pedido está finalizado". O painel atualiza pedidos em aberto e faturamento. |
| **Resultado obtido** | |
| **Status** | Pendente |
| **Evidência** | |

## CT-15 — Controle de acesso

| Campo | Conteúdo |
|---|---|
| **Pré-condição** | Pedido #1 pertence a `cliente@docenuvem.com.br` |
| **Passos** | 1. Sem login, abrir `/checkout` e `/pedidos`. 2. Logado como cliente, abrir `/admin`. 3. Criar uma segunda conta de cliente e abrir `/pedidos/1`. 4. Como cliente, chamar `GET /api/admin/produtos`. |
| **Resultado esperado** | Passo 1: redireciona para `/entrar?voltar=...` e, após o login, volta à página pedida. Passo 2: redireciona para a vitrine. Passo 3: página "não encontrada" (não revela que o pedido existe). Passo 4: HTTP 403 com "Acesso restrito à administração da loja." |
| **Resultado obtido** | |
| **Status** | Pendente |
| **Evidência** | |

## CT-16 — Cadastro e inativação de produto

| Campo | Conteúdo |
|---|---|
| **Pré-condição** | Logado como admin |
| **Passos** | 1. Em **Produtos → + Novo produto**, salvar com o nome vazio e o preço "abc". 2. Preencher corretamente (nome "Brigadeiro Gourmet", categoria Clássicos, preço 10,50, estoque 20, descrição) e salvar. 3. Ver o produto na vitrine. 4. Editar, desmarcar **Ativo** e salvar. 5. Ver a vitrine novamente. |
| **Resultado esperado** | Passo 1: mensagens nos campos ("Nome deve ter pelo menos 3 caracteres.", "Informe um preço válido, ex.: 12,50"). Passo 2: aviso "Produto cadastrado" e o produto aparece na lista. Passo 3: visível na vitrine com R$ 10,50. Passo 5: deixa de aparecer na vitrine (RN09), mas continua na lista do admin como "Inativo". |
| **Resultado obtido** | |
| **Status** | Pendente |
| **Evidência** | |

## CT-17 — Cadastro com senha fraca

| Campo | Conteúdo |
|---|---|
| **Pré-condição** | Sem login |
| **Passos** | 1. Em `/cadastro`, usar a senha "abcdefgh". 2. Usar "abc1". 3. Usar "Senha1234" com uma confirmação diferente. |
| **Resultado esperado** | 1: "A senha deve conter pelo menos um número." 2: "A senha deve ter pelo menos 8 caracteres." 3: "As senhas não conferem." exibida no campo de confirmação (RN10). |
| **Resultado obtido** | |
| **Status** | Pendente |
| **Evidência** | |

## CT-18 — E-mail duplicado e login inválido

| Campo | Conteúdo |
|---|---|
| **Pré-condição** | Sem login |
| **Passos** | 1. Cadastrar com o e-mail `cliente@docenuvem.com.br`. 2. Em `/entrar`, usar o e-mail certo com a senha errada. 3. Usar um e-mail inexistente. |
| **Resultado esperado** | 1: "Já existe uma conta com este e-mail…" no campo e-mail. 2 e 3: a mesma mensagem genérica "E-mail ou senha incorretos." (não revela quais e-mails existem). |
| **Resultado obtido** | |
| **Status** | Pendente |
| **Evidência** | |

## CT-19 — Carrinho persiste após recarregar

| Campo | Conteúdo |
|---|---|
| **Pré-condição** | Sem login |
| **Passos** | 1. Adicionar 2 sabores ao carrinho e aplicar o cupom `BEMVINDO10`. 2. Recarregar a página (F5) e fechar/reabrir a aba. 3. Clicar em **Entrar para finalizar** e fazer login. |
| **Resultado esperado** | O contador do cabeçalho, os itens e o cupom continuam após recarregar. Após o login, o usuário volta ao checkout com o carrinho intacto. |
| **Resultado obtido** | |
| **Status** | Pendente |
| **Evidência** | |

## CT-20 — Responsividade em celular

| Campo | Conteúdo |
|---|---|
| **Pré-condição** | Celular real ou DevTools no modo dispositivo (largura 375 px) |
| **Passos** | Percorrer vitrine → produto → carrinho → checkout → pedido → admin (pedidos e produtos). |
| **Resultado esperado** | Sem rolagem horizontal na página (as tabelas do admin rolam dentro do próprio cartão). A busca aparece no topo da vitrine em telas pequenas. Botões com área de toque confortável e textos legíveis sem zoom. |
| **Resultado obtido** | |
| **Status** | Pendente |
| **Evidência** | |

## CT-21 — Navegação somente por teclado

| Campo | Conteúdo |
|---|---|
| **Pré-condição** | Desktop, sem usar o mouse |
| **Passos** | 1. Pressionar Tab ao abrir a vitrine. 2. Adicionar um produto, ir ao carrinho e ao checkout usando Tab/Enter/Espaço/setas. |
| **Resultado esperado** | O primeiro Tab mostra o link "Pular para o conteúdo". O foco fica sempre visível (contorno rosa). Os grupos de opção (entrega e pagamento) funcionam pelas setas. Os erros são anunciados (role="alert"). É possível concluir a compra sem o mouse. |
| **Resultado obtido** | |
| **Status** | Pendente |
| **Evidência** | |

## CT-22 — Página inexistente (404)

| Campo | Conteúdo |
|---|---|
| **Pré-condição** | Nenhuma |
| **Passos** | Abrir `/produto/nao-existe`, `/produto/cafe-com-avela` (inativo) e `/qualquer-coisa`. |
| **Resultado esperado** | Página "Página não encontrada" com o botão **Voltar ao cardápio**, sem mensagens técnicas. |
| **Resultado obtido** | |
| **Status** | Pendente |
| **Evidência** | |
