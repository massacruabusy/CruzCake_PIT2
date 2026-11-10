# Dicionário de dados: CruzCake Cupcakes

SGBD: PostgreSQL · Esquema: `public` · Fonte: `src/models/db/schema.ts` · DDL: `database/migrations/0000_estrutura_inicial.sql`

Legenda: **PK** chave primária · **FK** chave estrangeira · **UK** único · **NN** obrigatório (NOT NULL). Valores monetários são inteiros em **centavos** (ex.: `1250` = R$ 12,50).

---

## usuarios
Pessoas com acesso autenticado (clientes e administração).

| Coluna | Tipo | Restrições | Padrão | Domínio / Descrição |
|---|---|---|---|---|
| id | serial | PK | auto | Identificador do usuário |
| nome | varchar(120) | NN | | Nome completo (3–120 caracteres) |
| email | varchar(160) | NN, UK | | E-mail de login, armazenado em minúsculas |
| senha_hash | varchar(100) | NN | | Hash bcrypt (custo 10). A senha em texto nunca é armazenada |
| telefone | varchar(20) | | | Celular com DDD, opcional |
| papel | papel_usuario | NN | `CLIENTE` | `CLIENTE` ou `ADMIN` |
| criado_em | timestamptz | NN | `now()` | Data de cadastro |

## enderecos
Endereços salvos pelo cliente para reaproveitar no checkout.

| Coluna | Tipo | Restrições | Padrão | Domínio / Descrição |
|---|---|---|---|---|
| id | serial | PK | auto | Identificador |
| usuario_id | integer | NN, FK → usuarios.id (CASCADE) | | Dono do endereço |
| apelido | varchar(40) | NN | `'Casa'` | Rótulo exibido (Casa, Trabalho…) |
| cep | char(8) | NN, CHECK 8 dígitos | | Somente números |
| logradouro | varchar(160) | NN | | Rua/avenida |
| numero | varchar(10) | NN | | Número (texto para aceitar "s/n", "120A") |
| complemento | varchar(80) | | | Apto, bloco etc. |
| bairro | varchar(80) | NN | | |
| cidade | varchar(80) | NN | | |
| uf | char(2) | NN | | Sigla do estado, maiúsculas |
| criado_em | timestamptz | NN | `now()` | |

## categorias
Agrupamento do cardápio na vitrine.

| Coluna | Tipo | Restrições | Padrão | Domínio / Descrição |
|---|---|---|---|---|
| id | serial | PK | auto | |
| nome | varchar(60) | NN, UK | | Ex.: "Clássicos" |
| slug | varchar(60) | NN, UK | | Usado na URL (`/?categoria=classicos`) |
| ordem | integer | NN | `0` | Ordem de exibição nos filtros |

## produtos
Cupcakes e kits à venda.

| Coluna | Tipo | Restrições | Padrão | Domínio / Descrição |
|---|---|---|---|---|
| id | serial | PK | auto | |
| categoria_id | integer | NN, FK → categorias.id (RESTRICT) | | |
| nome | varchar(100) | NN | | 3–100 caracteres |
| slug | varchar(120) | NN, UK | | Gerado do nome, sem acentos; sufixo `-2`, `-3` se repetido |
| descricao | text | NN | | 10–2000 caracteres |
| ingredientes | text | | | Ingredientes e alérgenos |
| preco_centavos | integer | NN, CHECK > 0 | | Até 100000 (R$ 1.000,00), validado na aplicação |
| estoque | integer | NN, CHECK ≥ 0 | `0` | Unidades disponíveis para venda (fornada do dia) |
| imagem_url | varchar(255) | NN | | Caminho da imagem (`/img/cupcakes/*.svg`) |
| ativo | boolean | NN | `true` | `false` = oculto da vitrine (RN09) |
| destaque | boolean | NN | `false` | Exibido primeiro e com selo |
| criado_em | timestamptz | NN | `now()` | |
| atualizado_em | timestamptz | NN | `now()` | Atualizado a cada edição ou baixa de estoque |

## cupons
Cupons de desconto (RN05).

| Coluna | Tipo | Restrições | Padrão | Domínio / Descrição |
|---|---|---|---|---|
| id | serial | PK | auto | |
| codigo | varchar(30) | NN, UK | | Maiúsculas (ex.: `BEMVINDO10`) |
| tipo | tipo_cupom | NN | | `PERCENTUAL` ou `VALOR_FIXO` |
| valor | integer | NN, CHECK > 0; ≤ 100 se percentual | | Percentual (1–100) ou centavos |
| valor_minimo_centavos | integer | NN | `0` | Subtotal mínimo para usar |
| valido_ate | timestamptz | | | Nulo = sem prazo |
| ativo | boolean | NN | `true` | |

## pedidos
Cabeçalho do pedido, com valores e endereço congelados no momento da compra.

| Coluna | Tipo | Restrições | Padrão | Domínio / Descrição |
|---|---|---|---|---|
| id | serial | PK | auto | Número do pedido exibido ao cliente |
| usuario_id | integer | NN, FK → usuarios.id (RESTRICT) | | Comprador |
| status | status_pedido | NN | `AGUARDANDO_PAGAMENTO` | Ver máquina de estados (RN07) |
| tipo_entrega | tipo_entrega | NN | | `ENTREGA` ou `RETIRADA` |
| entrega_cep | char(8) | CHECK: obrigatório se ENTREGA | | Cópia do endereço no momento da compra |
| entrega_logradouro | varchar(160) | CHECK: obrigatório se ENTREGA | | |
| entrega_numero | varchar(10) | | | |
| entrega_complemento | varchar(80) | | | |
| entrega_bairro | varchar(80) | | | |
| entrega_cidade | varchar(80) | | | |
| entrega_uf | char(2) | | | |
| cupom_id | integer | FK → cupons.id (SET NULL) | | Cupom aplicado |
| subtotal_centavos | integer | NN | | Soma dos itens |
| desconto_centavos | integer | NN | `0` | Desconto do cupom |
| frete_centavos | integer | NN | `0` | RN02 |
| total_centavos | integer | NN, CHECK ≥ 0 | | subtotal − desconto + frete (RN01) |
| observacao | varchar(300) | | | Recado do cliente para a loja |
| criado_em | timestamptz | NN | `now()` | |
| atualizado_em | timestamptz | NN | `now()` | Última mudança de status |

## itens_pedido
Linhas do pedido.

| Coluna | Tipo | Restrições | Padrão | Domínio / Descrição |
|---|---|---|---|---|
| id | serial | PK | auto | |
| pedido_id | integer | NN, FK → pedidos.id (CASCADE) | | |
| produto_id | integer | NN, FK → produtos.id (RESTRICT) | | |
| nome_produto | varchar(100) | NN | | Nome no momento da compra |
| preco_unitario_centavos | integer | NN | | Preço no momento da compra |
| quantidade | integer | NN, CHECK > 0 | | 1 a 24 (RN04, validado na aplicação) |
| subtotal_centavos | integer | NN | | preço unitário × quantidade |

## pagamentos
Registro da transação (gateway simulado, RN06).

| Coluna | Tipo | Restrições | Padrão | Domínio / Descrição |
|---|---|---|---|---|
| id | serial | PK | auto | |
| pedido_id | integer | NN, UK, FK → pedidos.id (CASCADE) | | |
| metodo | metodo_pagamento | NN | | `PIX` ou `CARTAO` |
| status | status_pagamento | NN | `PENDENTE` | `PENDENTE`, `APROVADO`, `RECUSADO` |
| valor_centavos | integer | NN | | Igual ao total do pedido |
| codigo_transacao | varchar(64) | NN | | `PIX-<uuid>` ou `CARD-<uuid>` |
| pix_copia_e_cola | text | | | Código PIX (somente PIX) |
| cartao_final | char(4) | | | Últimos 4 dígitos; número completo, validade e CVV **não** são armazenados |
| criado_em | timestamptz | NN | `now()` | |
| atualizado_em | timestamptz | NN | `now()` | |

## historico_status_pedido
Trilha de auditoria exibida como linha do tempo.

| Coluna | Tipo | Restrições | Padrão | Domínio / Descrição |
|---|---|---|---|---|
| id | serial | PK | auto | |
| pedido_id | integer | NN, FK → pedidos.id (CASCADE) | | |
| status | status_pedido | NN | | Status alcançado |
| observacao | varchar(200) | | | Ex.: "PIX confirmado", "Cancelado pelo cliente" |
| criado_em | timestamptz | NN | `now()` | Momento da mudança |
