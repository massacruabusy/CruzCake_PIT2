# 5. Diagramas UML

> Diagramas feitos em **Mermaid**, que o GitHub desenha automaticamente. O texto-fonte fica versionado junto ao código, então qualquer mudança no modelo aparece no histórico do Git. Os diagramas de caso de uso estão em `04-casos-de-uso.md`.

## 5.1 Diagrama de classes de domínio (persistência)

Representa as entidades persistidas e seus relacionamentos. Os atributos seguem o modelo físico (`src/models/db/schema.ts`). Valores monetários são inteiros em centavos (RN01).

```mermaid
classDiagram
  direction LR

  class Usuario {
    +int id
    +String nome
    +String email
    +String senhaHash
    +String telefone
    +PapelUsuario papel
    +DateTime criadoEm
  }
  class Endereco {
    +int id
    +String apelido
    +String cep
    +String logradouro
    +String numero
    +String complemento
    +String bairro
    +String cidade
    +String uf
  }
  class Categoria {
    +int id
    +String nome
    +String slug
    +int ordem
  }
  class Produto {
    +int id
    +String nome
    +String slug
    +String descricao
    +String ingredientes
    +int precoCentavos
    +int estoque
    +String imagemUrl
    +bool ativo
    +bool destaque
  }
  class Cupom {
    +int id
    +String codigo
    +TipoCupom tipo
    +int valor
    +int valorMinimoCentavos
    +DateTime validoAte
    +bool ativo
    +calcularDesconto(subtotal) int
  }
  class Pedido {
    +int id
    +StatusPedido status
    +TipoEntrega tipoEntrega
    +EnderecoEntrega endereco
    +int subtotalCentavos
    +int descontoCentavos
    +int freteCentavos
    +int totalCentavos
    +String observacao
    +DateTime criadoEm
    +podeCancelar() bool
    +proximosStatus() StatusPedido[]
  }
  class ItemPedido {
    +int id
    +String nomeProduto
    +int precoUnitarioCentavos
    +int quantidade
    +int subtotalCentavos
  }
  class Pagamento {
    +int id
    +MetodoPagamento metodo
    +StatusPagamento status
    +int valorCentavos
    +String codigoTransacao
    +String pixCopiaECola
    +String cartaoFinal
  }
  class HistoricoStatusPedido {
    +int id
    +StatusPedido status
    +String observacao
    +DateTime criadoEm
  }

  class PapelUsuario {
    <<enumeration>>
    CLIENTE
    ADMIN
  }
  class StatusPedido {
    <<enumeration>>
    AGUARDANDO_PAGAMENTO
    PAGO
    EM_PREPARO
    SAIU_PARA_ENTREGA
    PRONTO_PARA_RETIRADA
    ENTREGUE
    CANCELADO
  }

  Usuario "1" o-- "0..*" Endereco : possui
  Usuario "1" -- "0..*" Pedido : realiza
  Categoria "1" -- "0..*" Produto : agrupa
  Pedido "1" *-- "1..*" ItemPedido : contém
  ItemPedido "0..*" --> "1" Produto : refere-se a
  Pedido "1" *-- "1" Pagamento : é pago por
  Pedido "1" *-- "1..*" HistoricoStatusPedido : registra
  Pedido "0..*" --> "0..1" Cupom : aplica
  Usuario ..> PapelUsuario
  Pedido ..> StatusPedido
```

**Decisões de modelagem**

- **Composição** (`*--`) entre Pedido e ItemPedido/Pagamento/Histórico: essas partes não existem sem o pedido (no banco, `ON DELETE CASCADE`).
- **Agregação** (`o--`) entre Usuário e Endereço: o endereço pertence ao usuário, mas o pedido guarda uma **cópia** do endereço, então apagar o endereço não afeta pedidos antigos.
- **Associação** entre ItemPedido e Produto: o item mantém o nome e o preço do momento da compra (snapshot), mas continua ligado ao produto para relatórios.

## 5.2 Diagrama de classes da arquitetura (MVC)

Mostra como o código está organizado em camadas e as dependências permitidas entre pacotes. Não há dependência circular: a View só fala com o Controller (direto ou via API), e só o Model acessa o banco.

```mermaid
classDiagram
  direction TB
  namespace View {
    class Paginas {
      <<React Server Components>>
      app/page.tsx
      app/produto/slug
      app/carrinho, app/checkout
      app/pedidos e app/admin
    }
    class ComponentesCliente {
      <<Client Components>>
      CarrinhoProvider
      TelaCheckout
      FormularioProduto
    }
  }
  namespace Roteamento {
    class RouteHandlers {
      <<Route Handlers>>
      POST api/pedidos
      PATCH api/admin/pedidos/id/status
    }
  }
  namespace Controller {
    class Controllers {
      auth.controller
      loja.controller
      pedido.controller
      admin.controller
    }
    class Validacoes {
      <<Zod schemas>>
      checkoutSchema
      produtoSchema
    }
    class Http {
      tratar()
      exigirSessao()
      exigirAdmin()
    }
  }
  namespace Model {
    class Services {
      auth.service
      catalogo.service
      carrinho.service
      pedido.service
      admin.service
    }
    class Regras {
      <<funções puras>>
      regras/pedido.ts
      regras/pagamento.ts
    }
    class Schema {
      <<Drizzle ORM>>
      db/schema.ts
      db/client.ts
    }
  }
  class PostgreSQL {
    <<SGBD>>
  }

  Paginas ..> Controllers : leitura (server-side)
  ComponentesCliente ..> RouteHandlers : fetch JSON
  RouteHandlers ..> Controllers
  Controllers ..> Validacoes
  Controllers ..> Http
  Controllers ..> Services
  Services ..> Regras
  Services ..> Schema
  Schema ..> PostgreSQL
```

## 5.3 Diagrama de sequência — Finalizar compra com cartão

Cenário principal e cenários alternativos (cartão recusado e estoque esgotado durante a compra).

```mermaid
sequenceDiagram
  autonumber
  actor C as Cliente
  participant V as TelaCheckout (View)
  participant R as POST /api/pedidos (Route Handler)
  participant PC as pedido.controller
  participant PS as pedido.service (Model)
  participant CS as carrinho.service
  participant PG as regras/pagamento
  participant DB as PostgreSQL

  C->>V: Preenche entrega e cartão e clica "Pagar e confirmar"
  V->>R: fetch(itens, tipoEntrega, endereco, cupom, cartao)
  R->>PC: finalizarCompra(corpo)
  PC->>PC: exigirSessao() / validar(checkoutSchema)
  alt dados inválidos
    PC-->>V: 400 VALIDACAO + campos com erro
    V-->>C: Mostra mensagens ao lado dos campos
  end
  PC->>PS: criarPedido(usuarioId, dados)
  PS->>DB: BEGIN
  PS->>CS: precificarCarrinho(estrito)
  CS->>DB: SELECT produtos e cupom
  CS-->>PS: itens, subtotal, desconto, frete, total
  loop para cada item
    PS->>DB: UPDATE produtos SET estoque = estoque - qtd WHERE estoque >= qtd
    alt nenhuma linha atualizada
      PS->>DB: ROLLBACK
      PS-->>V: 422 ESTOQUE_INSUFICIENTE
      V-->>C: "Produto acabou de esgotar. Ajuste seu carrinho."
    end
  end
  PS->>PG: processarCartaoSimulado(cartao)
  alt cartão recusado (final 0000)
    PG-->>PS: ErroNegocio PAGAMENTO_RECUSADO
    PS->>DB: ROLLBACK (estoque volta ao valor original)
    PS-->>V: 402 PAGAMENTO_RECUSADO
    V-->>C: "Pagamento recusado. Tente outro cartão ou PIX."
  else aprovado
    PG-->>PS: codigoTransacao, cartaoFinal
    PS->>DB: INSERT pedido (PAGO), itens, pagamento (APROVADO), histórico
    PS->>DB: COMMIT
    PS-->>PC: pedido
    PC-->>V: 201 { pedidoId, status: PAGO }
    V->>V: limpa carrinho
    V-->>C: Redireciona para /pedidos/{id} ("Pedido recebido!")
  end
```

## 5.4 Diagrama de sequência — Administradora avança o status do pedido

```mermaid
sequenceDiagram
  autonumber
  actor A as Administradora
  participant V as AcoesStatusAdmin (View)
  participant R as PATCH /api/admin/pedidos/[id]/status
  participant AC as admin.controller
  participant PS as pedido.service
  participant RG as regras/pedido
  participant DB as PostgreSQL

  A->>V: Clica "Marcar como Em preparo"
  V->>R: fetch({ status, observacao })
  R->>AC: alterarStatusPedido(id, corpo)
  AC->>AC: exigirAdmin()
  alt não é administrador
    AC-->>V: 403 SEM_PERMISSAO
  end
  AC->>PS: mudarStatusPedido(id, status)
  PS->>DB: BEGIN / SELECT pedido
  PS->>RG: validarTransicao(atual, novo, tipoEntrega)
  alt transição inválida (ex.: PAGO → ENTREGUE)
    RG-->>PS: TRANSICAO_STATUS_INVALIDA
    PS-->>V: 409 + mensagem
    V-->>A: Aviso de erro
  else válida
    opt novo status = CANCELADO
      PS->>DB: devolve itens ao estoque (RN03)
    end
    PS->>DB: UPDATE pedidos / INSERT historico_status_pedido
    PS->>DB: COMMIT
    PS-->>V: 200 { status }
    V-->>A: "Pedido atualizado" + linha do tempo atualizada
  end
```

## 5.5 Diagrama de sequência — Login

```mermaid
sequenceDiagram
  autonumber
  actor U as Usuário
  participant V as FormularioAuth
  participant R as POST /api/auth/entrar
  participant AC as auth.controller
  participant AS as auth.service
  participant DB as PostgreSQL

  U->>V: Informa e-mail e senha
  V->>R: fetch({ email, senha })
  R->>AC: entrar(corpo)
  AC->>AS: autenticar(email, senha)
  AS->>DB: SELECT usuario WHERE email
  AS->>AS: bcrypt.compare(senha, senhaHash)
  alt e-mail inexistente ou senha errada
    AS-->>V: 401 "E-mail ou senha incorretos." (mensagem única, não revela qual)
  else válido
    AS-->>AC: usuario
    AC->>AC: criarSessao() → cookie httpOnly assinado (JWT)
    AC-->>V: 200
    V-->>U: Volta para a página de origem (ex.: /checkout)
  end
```

## 5.6 Diagrama de atividades — Processo de compra

```mermaid
flowchart TD
  inicio((Início)) --> vitrine[Navegar na vitrine]
  vitrine --> escolhe[Escolher sabor e quantidade]
  escolhe --> estoque{Tem estoque?}
  estoque -- Não --> esgotado[Exibir 'Esgotado'] --> vitrine
  estoque -- Sim --> add[Adicionar ao carrinho]
  add --> mais{Comprar mais?}
  mais -- Sim --> vitrine
  mais -- Não --> carrinho[Revisar carrinho e cupom]
  carrinho --> logado{Está logado?}
  logado -- Não --> conta{Tem conta?}
  conta -- Não --> cadastro[Cadastrar-se] --> checkout
  conta -- Sim --> login[Entrar] --> checkout
  logado -- Sim --> checkout[Checkout]
  checkout --> tipo{Entrega ou retirada?}
  tipo -- Entrega --> cep[Informar CEP e endereço] --> pagamento
  tipo -- Retirada --> pagamento{Forma de pagamento}
  pagamento -- PIX --> pix[Gerar código PIX] --> aguarda[Pedido aguardando pagamento]
  aguarda --> pagou{Pagamento confirmado?}
  pagou -- Sim --> pago
  pagou -- Não / desistiu --> cancelado[Cancelar pedido e devolver estoque] --> fim((Fim))
  pagamento -- Cartão --> autoriza{Cartão aprovado?}
  autoriza -- Não --> erroCartao[Mostrar recusa] --> pagamento
  autoriza -- Sim --> pago[Pedido pago]
  pago --> preparo[Loja prepara os cupcakes]
  preparo --> envio{Tipo de recebimento}
  envio -- Entrega --> saiu[Saiu para entrega] --> entregue
  envio -- Retirada --> pronto[Pronto para retirada] --> entregue[Entregue]
  entregue --> fim
```

## 5.7 Diagrama de máquina de estados — Pedido (RN07)

```mermaid
stateDiagram-v2
  [*] --> AGUARDANDO_PAGAMENTO : pedido com PIX
  [*] --> PAGO : pedido com cartão aprovado
  AGUARDANDO_PAGAMENTO --> PAGO : PIX confirmado
  AGUARDANDO_PAGAMENTO --> CANCELADO : cliente ou loja cancela
  PAGO --> EM_PREPARO : loja inicia produção
  PAGO --> CANCELADO : cliente ou loja cancela
  EM_PREPARO --> SAIU_PARA_ENTREGA : [tipo = ENTREGA]
  EM_PREPARO --> PRONTO_PARA_RETIRADA : [tipo = RETIRADA]
  EM_PREPARO --> CANCELADO : somente a loja
  SAIU_PARA_ENTREGA --> ENTREGUE
  PRONTO_PARA_RETIRADA --> ENTREGUE
  ENTREGUE --> [*]
  CANCELADO --> [*]
  note right of CANCELADO : Ao cancelar, os itens voltam ao estoque (RN03)
```

A tabela de transições implementada está em `src/models/regras/pedido.ts` (`TRANSICOES`) e é coberta pelos testes de `tests/unit/regras-pedido.test.ts`.
