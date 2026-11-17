# Manual de uso

> CruzCake Cupcakes: loja virtual de cupcakes. **Ambiente de demonstração: nenhum pagamento é cobrado de verdade.**

## Dados para teste

| O quê | Valor |
|---|---|
| Conta de cliente | `cliente@cruzcake.com.br` / `Cliente1234` |
| Conta de administração | `admin@cruzcake.com.br` / `Admin1234` |
| Cartão aprovado | `4111 1111 1111 1111`, qualquer nome, validade futura (ex.: `12/30`), CVV `123` |
| Cartão recusado | `4000 0000 0002 0000` (simula recusa da operadora) |
| CEPs de exemplo | `01310-100` (Av. Paulista, zona Centro expandido: R$ 9,90, grátis a partir de R$ 120, até 2 h) · `08010-000` (Zona Leste: R$ 14,90, grátis a partir de R$ 180, até 3 h) · `20040-002` (Rio de Janeiro: **fora da área de entrega**) · `99999-999` (CEP inexistente) |
| Cupons | `BEMVINDO10` (10% a partir de R$ 30) · `DOCE5` (R$ 5 a partir de R$ 40) · `NATAL2025` (vencido, para testar o erro) |
| Produtos para testar estoque | *Frutas Vermelhas* (só 4 unidades) · *Coco e Maracujá* (esgotado: não aparece na vitrine; abra direto em `/produto/coco-maracuja-sem-gluten`) |

Você também pode criar sua própria conta em **Entrar → Cadastre-se**.

---

## Para clientes

### 1. Escolher os cupcakes
1. Na página inicial (**Cardápio**) filtre por categoria ou use **Buscar sabores**.
2. Toque no cupcake para ver descrição, ingredientes e alérgenos.
3. Escolha a quantidade e toque em **Adicionar**. O **minicarrinho** abre na lateral mostrando o item; dá para ajustar quantidades ali mesmo e tocar em **Continuar comprando** ou **Ver carrinho e finalizar**. O ícone do carrinho no topo também abre o minicarrinho (Esc ou toque fora fecha).

> Produtos com o selo **Últimas N** têm pouco estoque. Os **esgotados do dia** não aparecem na vitrine nem na busca. Procurando presente? O filtro **Caixas e kits** e o selo **📦 Kit para presentear** mostram as caixas. O limite é de 24 unidades do mesmo sabor por pedido.

### Consultar o frete antes de comprar
Na página do produto ou no carrinho, preencha **Entregamos no seu endereço?** com o CEP e toque em **Calcular**. Aparecem o endereço encontrado e o resultado: a zona, o prazo (em horas após o preparo), o valor do frete e a partir de quanto ele é grátis. Se a loja ainda não entrega no CEP, a mensagem sugere a **retirada na loja**, que é sempre grátis. Não é preciso ter conta, e o CEP fica guardado para o carrinho e o checkout.

### 2. Revisar o carrinho
1. Toque em **Carrinho**.
2. Use **−** e **+** para mudar quantidades ou **Remover**.
3. Digite um cupom e toque em **Aplicar**. A mensagem confirma o desconto ou explica por que o cupom não vale.
4. Informe o CEP para ver o frete no resumo (sem CEP o resumo mostra "Total sem frete").
5. Se algum item estiver em vermelho (sem estoque suficiente), ajuste-o para liberar o botão **Finalizar compra**.

> O carrinho fica salvo no seu navegador: dá para fechar a página e voltar depois.

### 3. Finalizar a compra
1. Toque em **Finalizar compra**. Se ainda não entrou na conta, faça login ou cadastre-se e você volta direto para o checkout.
2. **Como quer receber?**
   - **Entrega:** escolha um endereço salvo ou **Usar outro endereço**. Digite o CEP e a rua, o bairro e a cidade são preenchidos sozinhos; complete o número. Um aviso verde mostra a zona e o prazo; o frete depende da zona do CEP. Se aparecer "Ainda não entregamos neste CEP", escolha **Retirar na loja** ou outro endereço.
   - **Retirar na loja:** sem frete (Rua das Confeitarias, 123).
3. **Pagamento**
   - **PIX:** o código é gerado na tela seguinte.
   - **Cartão de crédito:** preencha os dados; a aprovação é imediata.
4. Confira o **Resumo** e toque em **Confirmar e gerar PIX** ou **Pagar e confirmar pedido**.

### 4. Pagar o PIX (demonstração)
Na página do pedido, copie o código com **Copiar código**. Para simular a confirmação do banco, toque em **Simular pagamento confirmado**. O status muda para **Pagamento aprovado**.

### 5. Acompanhar e cancelar
- Menu **Olá, [nome] → Meus pedidos** lista todos os pedidos com o status atual.
- Dentro do pedido, a **linha do tempo** mostra cada etapa com data e hora.
- **Cancelar pedido** só aparece enquanto o pedido está *Aguardando pagamento* ou *Pagamento aprovado*. Depois que entra em preparo, fale com a loja.

### 6. Sair
Menu **Olá, [nome] → Sair**.

---

## Para a administração da loja

Entre com a conta de administração. O link **Painel** aparece no topo.

### Visão geral
Mostra pedidos em aberto, pedidos pagos, faturamento e produtos com **estoque baixo** (≤ 5 unidades). Clique em um produto para ajustar o estoque.

### Pedidos
1. **Painel → Pedidos**: use os filtros por situação (ex.: *Pagamento aprovado* = pedidos para começar a produzir).
2. Abra um pedido: veja itens, endereço ou retirada, forma de pagamento, dados do cliente e observações.
3. Em **Avançar etapa** aparecem **apenas** os próximos passos válidos:
   - Pagamento aprovado → **Em preparo**
   - Em preparo → **Saiu para entrega** (entrega) ou **Pronto para retirada** (retirada)
   - → **Entregue**
4. Opcionalmente escreva uma observação (ex.: "Entregador João"). Ela aparece na linha do tempo do cliente.
5. **Cancelar pedido** pede confirmação e devolve os itens ao estoque.

### Frete (zonas de entrega)
1. **Painel → Frete** lista as zonas: faixa de CEP, valor do frete, "grátis a partir de", prazo e situação.
2. **+ Nova zona** ou **Editar**: informe nome, CEP inicial e final, frete (ex.: `9,90`; use `0` para sempre grátis), **grátis a partir de** (deixe em branco para nunca ser grátis) e o prazo em horas.
3. Se um CEP estiver em mais de uma zona, vale a faixa **mais específica**. Exemplo: a Zona Leste (08000-000 a 08499-999) vale dentro da Grande São Paulo (06000-000 a 09999-999).
4. Desmarque **Zona ativa** para parar de entregar na região sem apagar a zona. CEPs fora de todas as zonas ativas só podem comprar com retirada.

### Promoções
Nesta versão não há módulo de promoção: para fazer uma promoção, **edite o preço do produto** em **Produtos** (e volte ao preço normal depois) ou divulgue um **cupom**. Agendar preço promocional está no backlog.

### Produtos
1. **Painel → Produtos** lista todos os produtos (inclusive inativos).
2. **+ Novo produto** ou **Editar**: preencha nome, categoria, preço (ex.: `12,50`), estoque, descrição, ingredientes e escolha a imagem.
3. **Ativo** controla se o produto aparece na vitrine (produtos com estoque 0 também saem da vitrine até você repor). Para tirar um sabor de linha, desmarque *Ativo* em vez de excluir (o histórico de pedidos é preservado).
4. **Destaque** coloca o produto no topo do cardápio com selo.

---

## Mensagens comuns

| Mensagem | O que fazer |
|---|---|
| "E-mail ou senha incorretos." | Confira os dados ou crie uma conta |
| "Temos apenas N unidade(s)…" / "…esgotou." | Diminua a quantidade ou remova o item |
| "O cupom … está vencido" / "vale para compras a partir de…" | Use outro cupom ou adicione itens |
| "Pagamento recusado pela operadora…" | Tente outro cartão ou PIX (nada foi cobrado e o pedido não foi criado) |
| "Seu pedido já está em preparo…" | Cancelamento só pela loja |
| "Ainda não entregamos no CEP…" | Escolha retirar na loja ou outro endereço |
| "CEP não encontrado. Confira os números." | Confira o CEP ou preencha o endereço manualmente no checkout |
| "Deve ser maior ou igual ao CEP inicial." (admin) | Ajuste a faixa da zona |
| "Página não encontrada" | Volte ao cardápio |
