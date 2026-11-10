# Histórias de Usuário — CruzCake Cupcakes

> Versão revisada (PIT II) dos cartões de história levantados no PIT I. Os cartões seguem o template do material do curso (Tabela 1 — Template de Cartão de História do Usuário), com um campo extra **Status no MVP**, que indica se a história foi implementada nesta entrega ou ficou no backlog para evoluções futuras.

## Personas e requerentes

O sistema foi pensado para **três papéis de usuário**. São os mesmos papéis que os testadores (profissionais de e-commerce) vão assumir na validação da Situação 3.

| Persona | Quem é | O que espera do sistema |
|---|---|---|
| **Visitante** | Pessoa que chega pela primeira vez (Instagram, Google, indicação), ainda sem conta, decidindo se compra | Ver o cardápio, preços e disponibilidade do dia e saber **se a loja entrega no CEP dela, quanto custa e em quanto tempo**, tudo sem se cadastrar |
| **Cliente** | Comprador recorrente, para consumo próprio ou para presentear | Comprar rápido, conferir o carrinho sem sair da página, pagar com PIX ou cartão, escolher entrega ou retirada e acompanhar o pedido |
| **Administradora da loja** | Dona da loja (confeiteira) e equipe do balcão | Manter o cardápio e o estoque do dia, **definir onde entrega e quanto cobra de frete**, ver os pedidos que entram e avançar cada etapa até a entrega |

Sistemas externos envolvidos: gateway de pagamento (simulado nesta versão) e serviço de CEP (ViaCEP, com BrasilAPI de reserva).

**Requerentes** citados nos cartões: *Dona da loja* (cliente do projeto e patrocinadora), *Atendente* (balcão/WhatsApp, quem mais sofre com pedido errado), *Cliente final* (ouvido na imersão na loja) e *Equipe técnica* (histórias técnicas/spikes).

## Regras de negócio de referência

A numeração é a mesma usada nos comentários do código-fonte (`src/models/regras/*` e `src/controllers/validacoes.ts`).

| ID | Regra |
|---|---|
| RN01 | Valores monetários são guardados como inteiros em centavos. **Total = subtotal − desconto + frete** |
| RN02 | **Frete por zona de entrega.** A loja cadastra zonas (faixa de CEP, valor, prazo em horas e, opcionalmente, valor para frete grátis). O frete é o da zona que cobre o CEP; havendo sobreposição, vale a faixa mais específica. O frete grátis é avaliado sobre o subtotal já com desconto. CEP fora das zonas ativas não pode receber entrega (só retirada). Retirada na loja não paga frete. Zonas de exemplo: Centro expandido (SP) R$ 9,90, grátis a partir de R$ 120, 2 h; Zona Leste (SP) R$ 14,90, grátis a partir de R$ 180, 3 h; Grande São Paulo R$ 19,90, sem frete grátis, 4 h |
| RN03 | Não se vende acima do estoque. O estoque baixa quando o pedido é criado e volta quando o pedido é cancelado |
| RN04 | Cada sabor aceita no máximo **24 unidades** por pedido |
| RN05 | O cupom precisa estar ativo, dentro da validade e o subtotal precisa atingir o mínimo do cupom. O desconto nunca passa do subtotal. Cupons de exemplo: `BEMVINDO10` (10%, mínimo de R$ 30), `DOCE5` (R$ 5, mínimo de R$ 40) e `NATAL2025` (vencido) |
| RN06 | O pagamento é **simulado**. Cartão: número válido no algoritmo de Luhn, validade MM/AA não vencida e CVV com 3 ou 4 dígitos; cartões terminados em `0000` são recusados. PIX: gera um código copia-e-cola e o pedido aguarda confirmação |
| RN07 | Máquina de estados do pedido: Aguardando pagamento → Pago → Em preparo → Saiu para entrega (se for entrega) ou Pronto para retirada (se for retirada) → Entregue. O cancelamento só é possível até a etapa Em preparo |
| RN08 | O cliente só cancela pelo app enquanto o pedido está *Aguardando pagamento* ou *Pago* |
| RN09 | Na vitrine e na busca aparecem apenas produtos **ativos e com estoque**: cupcake é produção do dia, então o esgotado sai da vitrine. A página direta do produto continua abrindo e informa "Esgotado hoje". Os destaques vêm primeiro |
| RN10 | A senha deve ter de 8 a 72 caracteres, com pelo menos uma letra e um número |

---

## Histórias técnicas (spikes)

### US01 — Decidir a plataforma: web responsiva ou app nativo

| Campo | Conteúdo |
|---|---|
| **ID** | US01 |
| **Título** | Decidir a plataforma: web responsiva ou app nativo |
| **Requerente** | Equipe técnica / Dona da loja |
| **Ação** | Como **equipe técnica**, eu quero **comparar app nativo (Android/iOS), app híbrido e web responsiva** para que **a loja tenha presença mobile sem dobrar o custo de desenvolvimento e de publicação nas lojas de aplicativos**. |
| **Comentários** | Dúvida levantada no PIT I ("o App será o mesmo para Android e iOS?"). Decisão: **aplicação web responsiva (mobile-first)**, acessível por link no Instagram e no WhatsApp, sem instalação e sem taxas de loja de aplicativos. Pode virar PWA no futuro. |
| **Critérios de aceitação** | CA#1 DADO o comparativo de custo, prazo e alcance, QUANDO apresentado à dona da loja, ENTÃO a decisão fica registrada com justificativa.<br>CA#2 DADO um celular de 360 px de largura, QUANDO o cliente acessa o protótipo, ENTÃO todas as telas funcionam sem rolagem horizontal. |
| **Regras de negócio** | — |
| **Requisito não funcional** | RNF#1 Layout responsivo a partir de 360 px. RNF#2 Funcionar nos navegadores modernos (Chrome, Safari, Edge e Firefox). |
| **Prioridade** | [A] |
| **Pontos de história** | 2 |
| **Status no MVP** | Implementado (decisão aplicada) |

### US02 — Definir stack e arquitetura MVC

| Campo | Conteúdo |
|---|---|
| **ID** | US02 |
| **Título** | Definir stack e arquitetura MVC |
| **Requerente** | Equipe técnica |
| **Ação** | Como **equipe técnica**, eu quero **definir linguagem, framework, banco de dados e organização em camadas** para que **o código seja fácil de manter, testar e explicar para novos desenvolvedores**. |
| **Comentários** | Decisão: Next.js com TypeScript (front-end e back-end), PostgreSQL com Drizzle ORM e testes com Vitest. Código organizado em `src/models` (Model), `src/controllers` (Controller) e `src/app` + `src/components` (View). |
| **Critérios de aceitação** | CA#1 DADO o repositório, QUANDO um desenvolvedor abre o README, ENTÃO encontra a stack, o mapa das camadas e como rodar o projeto.<br>CA#2 DADO um Route Handler, QUANDO ele recebe uma requisição, ENTÃO delega ao Controller, que valida a entrada e chama o Model (nenhuma regra de negócio fica na View). |
| **Regras de negócio** | — |
| **Requisito não funcional** | RNF#1 Rodar localmente sem instalar servidor de banco (PGlite). RNF#2 Usar um SGBD popular em produção (PostgreSQL). |
| **Prioridade** | [A] |
| **Pontos de história** | 2 |
| **Status no MVP** | Implementado |

### US03 — Definir a estratégia de estoque integrado à loja física

| Campo | Conteúdo |
|---|---|
| **ID** | US03 |
| **Título** | Definir a estratégia de estoque integrado à loja física |
| **Requerente** | Dona da loja |
| **Ação** | Como **dona da loja**, eu quero **que o estoque do app represente a produção do dia** para que **não sejam vendidos cupcakes que já acabaram no balcão**. |
| **Comentários** | Pergunta do PIT I: "Como vamos controlar o estoque junto com as lojas físicas?". Decisão para o MVP: estoque único por sabor, ajustado pela confeiteira no painel no início do dia e a cada venda de balcão. A baixa no app é atômica (condicional no banco). Integração com PDV fica para o futuro. |
| **Critérios de aceitação** | CA#1 DADO que dois clientes compram a última unidade ao mesmo tempo, QUANDO os dois pedidos chegam, ENTÃO apenas um é aceito e o outro recebe "acabou de esgotar".<br>CA#2 DADO um pedido cancelado, QUANDO o cancelamento é confirmado, ENTÃO as unidades voltam ao estoque. |
| **Regras de negócio** | RN03 |
| **Requisito não funcional** | RNF#1 A baixa de estoque e a gravação do pedido ocorrem na mesma transação. |
| **Prioridade** | [B] |
| **Pontos de história** | 2 |
| **Status no MVP** | Implementado |

---

## Vitrine

### US04 — Ver o cardápio na vitrine

| Campo | Conteúdo |
|---|---|
| **ID** | US04 |
| **Título** | Ver o cardápio na vitrine |
| **Requerente** | Cliente final |
| **Ação** | Como **visitante**, eu quero **ver todos os cupcakes disponíveis com foto, preço e categoria** para que **eu decida o que comprar sem precisar perguntar no WhatsApp**. |
| **Comentários** | É a página inicial (TELA-01). Mostra um banner com o cupom de boas-vindas, selo "Destaque" e selo "Últimas N" quando restam 5 unidades ou menos. |
| **Critérios de aceitação** | CA#1 DADO produtos ativos e inativos, QUANDO a vitrine abre, ENTÃO apenas os ativos aparecem, com os destaques primeiro.<br>CA#2 DADO um produto com estoque entre 1 e 5, QUANDO aparece na vitrine, ENTÃO mostra o selo "Últimas N".<br>CA#3 DADO um produto esgotado, QUANDO a vitrine abre, ENTÃO ele não aparece (regra revisada, ver US35); se o cliente abrir o link direto, vê "Esgotado hoje" com o botão desabilitado. |
| **Regras de negócio** | RN09 |
| **Requisito não funcional** | RNF#1 Primeira carga em até 2 s em 4G. RNF#2 Imagens com texto alternativo. |
| **Prioridade** | [A] |
| **Pontos de história** | 3 |
| **Status no MVP** | Implementado |

### US05 — Filtrar por categoria

| Campo | Conteúdo |
|---|---|
| **ID** | US05 |
| **Título** | Filtrar por categoria |
| **Requerente** | Cliente final |
| **Ação** | Como **cliente**, eu quero **filtrar por Clássicos, Gourmet, Veganos e sem glúten ou Caixas e kits** para que **eu encontre rápido o que combina com minha restrição ou ocasião**. |
| **Comentários** | Os filtros ficam numa barra rolável no celular. O filtro fica na URL (`?categoria=`), então dá para compartilhar o link. Na revisão, "Caixas e kits" passou a ser o 2º filtro (ver US36). |
| **Critérios de aceitação** | CA#1 DADO a vitrine, QUANDO escolho "Veganos e sem glúten", ENTÃO só aparecem produtos dessa categoria e o chip fica destacado.<br>CA#2 DADO um filtro aplicado, QUANDO clico em "Todos", ENTÃO o cardápio completo volta. |
| **Regras de negócio** | RN09 |
| **Requisito não funcional** | RNF#1 O estado do filtro fica na URL. |
| **Prioridade** | [B] |
| **Pontos de história** | 2 |
| **Status no MVP** | Implementado |

### US06 — Buscar um sabor

| Campo | Conteúdo |
|---|---|
| **ID** | US06 |
| **Título** | Buscar um sabor |
| **Requerente** | Cliente final |
| **Ação** | Como **cliente**, eu quero **buscar por nome ou ingrediente (ex.: "pistache")** para que **eu encontre meu sabor preferido sem rolar o cardápio todo**. |
| **Comentários** | A busca não diferencia maiúsculas de minúsculas e procura no nome e na descrição. |
| **Critérios de aceitação** | CA#1 DADO o termo "pistache", QUANDO busco, ENTÃO aparece "Pistache Siciliano".<br>CA#2 DADO um termo sem resultado, QUANDO busco, ENTÃO vejo "Nenhum cupcake encontrado" e um botão para ver todos os sabores. |
| **Regras de negócio** | RN09 |
| **Requisito não funcional** | RNF#1 O termo é limitado a 60 caracteres. |
| **Prioridade** | [B] |
| **Pontos de história** | 2 |
| **Status no MVP** | Implementado |

### US07 — Ver detalhes do produto

| Campo | Conteúdo |
|---|---|
| **ID** | US07 |
| **Título** | Ver detalhes do produto |
| **Requerente** | Atendente |
| **Ação** | Como **cliente**, eu quero **ver descrição, ingredientes, alérgenos e disponibilidade do dia** para que **eu compre com segurança, principalmente quando tenho restrição alimentar**. |
| **Comentários** | A atendente relatou que a pergunta mais comum no WhatsApp é "tem glúten/lactose?". A tela TELA-02 traz a trilha de navegação, um seletor de quantidade e um aviso de contaminação cruzada. |
| **Critérios de aceitação** | CA#1 DADO um produto ativo, QUANDO abro o detalhe, ENTÃO vejo preço, descrição, ingredientes e um aviso de disponibilidade (Disponível, Últimas N ou Esgotado).<br>CA#2 DADO um produto inativo ou inexistente, QUANDO acesso a URL dele, ENTÃO vejo a página "não encontrada" (TELA-14). |
| **Regras de negócio** | RN04, RN09 |
| **Requisito não funcional** | RNF#1 Título e descrição da página preenchidos para SEO e compartilhamento. |
| **Prioridade** | [A] |
| **Pontos de história** | 3 |
| **Status no MVP** | Implementado |

---

## Carrinho e promoções

### US08 — Adicionar ao carrinho

| Campo | Conteúdo |
|---|---|
| **ID** | US08 |
| **Título** | Adicionar ao carrinho |
| **Requerente** | Cliente final |
| **Ação** | Como **visitante ou cliente**, eu quero **adicionar cupcakes ao carrinho sem precisar fazer login** para que **eu monte meu pedido com calma e só me identifique na hora de pagar**. |
| **Comentários** | O carrinho fica salvo no navegador (localStorage) e sobrevive ao fechamento da aba. Ao adicionar, o minicarrinho abre para confirmar a adição (ver US37). |
| **Critérios de aceitação** | CA#1 DADO um produto disponível, QUANDO clico em "Adicionar", ENTÃO o contador do carrinho aumenta e o minicarrinho abre mostrando o item.<br>CA#2 DADO que já tenho no carrinho a quantidade máxima permitida, QUANDO tento adicionar mais, ENTÃO vejo uma mensagem de limite e nada muda. |
| **Regras de negócio** | RN03, RN04 |
| **Requisito não funcional** | RNF#1 O carrinho persiste entre visitas no mesmo navegador. |
| **Prioridade** | [A] |
| **Pontos de história** | 3 |
| **Status no MVP** | Implementado |

### US09 — Alterar quantidades e remover itens

| Campo | Conteúdo |
|---|---|
| **ID** | US09 |
| **Título** | Alterar quantidades e remover itens |
| **Requerente** | Cliente final |
| **Ação** | Como **cliente**, eu quero **aumentar, diminuir ou remover itens do carrinho** para que **o pedido fique exatamente como desejo antes de pagar**. |
| **Comentários** | Preço e estoque exibidos no carrinho (TELA-03) vêm sempre do servidor. Produtos desativados saem do carrinho automaticamente. |
| **Critérios de aceitação** | CA#1 DADO um item com quantidade 1, QUANDO clico em "−", ENTÃO o item sai do carrinho.<br>CA#2 DADO que peço mais unidades do que há em estoque, QUANDO o carrinho é recalculado, ENTÃO o item fica destacado com "Temos apenas N unidade(s)" e o botão de finalizar fica bloqueado.<br>CA#3 DADO o carrinho vazio, QUANDO abro a TELA-03, ENTÃO vejo um convite para voltar ao cardápio. |
| **Regras de negócio** | RN01, RN03, RN04 |
| **Requisito não funcional** | RNF#1 O preço nunca é definido pelo navegador; o servidor sempre reprecifica. |
| **Prioridade** | [A] |
| **Pontos de história** | 2 |
| **Status no MVP** | Implementado |

### US10 — Aplicar cupom de desconto

| Campo | Conteúdo |
|---|---|
| **ID** | US10 |
| **Título** | Aplicar cupom de desconto |
| **Requerente** | Dona da loja |
| **Ação** | Como **cliente**, eu quero **aplicar um cupom no carrinho** para que **eu aproveite as promoções divulgadas no Instagram da loja**. |
| **Comentários** | A dona da loja quer usar `BEMVINDO10` para converter a primeira compra. O código não diferencia maiúsculas de minúsculas. Se o cupom for inválido, o carrinho continua funcionando, só sem o desconto. |
| **Critérios de aceitação** | CA#1 DADO um subtotal de R$ 36,00, QUANDO aplico `BEMVINDO10`, ENTÃO o desconto é de R$ 3,60 e aparece "Cupom BEMVINDO10 aplicado!".<br>CA#2 DADO o cupom vencido `NATAL2025`, QUANDO aplico, ENTÃO vejo "O cupom NATAL2025 está vencido." e nenhum desconto.<br>CA#3 DADO um subtotal de R$ 20,00, QUANDO aplico `BEMVINDO10`, ENTÃO vejo "vale para compras a partir de R$ 30,00". |
| **Regras de negócio** | RN05, RN01 |
| **Requisito não funcional** | RNF#1 O cupom é validado de novo no servidor na finalização da compra. |
| **Prioridade** | [B] |
| **Pontos de história** | 3 |
| **Status no MVP** | Implementado |

### US11 — Ver frete e total antes de pagar

| Campo | Conteúdo |
|---|---|
| **ID** | US11 |
| **Título** | Ver frete e total antes de pagar |
| **Requerente** | Cliente final |
| **Ação** | Como **cliente**, eu quero **ver subtotal, desconto, frete e total antes de informar o pagamento** para que **eu não tenha surpresa no valor final**. |
| **Comentários** | Na imersão, o frete-surpresa apareceu como principal motivo de abandono do app anterior. Revisado: o frete deixou de ser fixo e passou a depender da zona do CEP (RN02, US33 e US34). Enquanto o CEP não é informado, o resumo mostra "Informe o CEP" e "Total sem frete". |
| **Critérios de aceitação** | CA#1 DADO um subtotal de R$ 68,00 com 10% de desconto e entrega para o CEP 01310-100 (Centro expandido), QUANDO vejo o resumo, ENTÃO o frete é R$ 9,90 e o total é R$ 71,10.<br>CA#2 DADO um subtotal com desconto que atinge o mínimo de frete grátis da zona, QUANDO escolho entrega, ENTÃO o frete aparece como "Grátis".<br>CA#3 DADO a opção retirada, QUANDO seleciono, ENTÃO aparece "Retirada na loja — Grátis". |
| **Regras de negócio** | RN01, RN02 |
| **Requisito não funcional** | RNF#1 O resumo é recalculado a cada alteração em menos de 1 s. |
| **Prioridade** | [A] |
| **Pontos de história** | 2 |
| **Status no MVP** | Implementado |

---

## Conta

### US12 — Criar conta

| Campo | Conteúdo |
|---|---|
| **ID** | US12 |
| **Título** | Criar conta |
| **Requerente** | Dona da loja |
| **Ação** | Como **visitante**, eu quero **criar uma conta com nome, e-mail, celular opcional e senha** para que **eu possa comprar e acompanhar meus pedidos**. |
| **Comentários** | O cadastro é feito só na hora de finalizar, para não travar a navegação. Depois de cadastrar, o cliente volta automaticamente para onde estava (por exemplo, o checkout). |
| **Critérios de aceitação** | CA#1 DADO dados válidos, QUANDO envio, ENTÃO a conta é criada, já entro logado e volto para a página de origem.<br>CA#2 DADO um e-mail já cadastrado, QUANDO envio, ENTÃO vejo "Já existe uma conta com este e-mail".<br>CA#3 DADO a senha "somenteletras", QUANDO envio, ENTÃO vejo, abaixo do campo, que a senha precisa ter um número.<br>CA#4 DADO senha e confirmação diferentes, QUANDO envio, ENTÃO o erro aparece no campo de confirmação. |
| **Regras de negócio** | RN10 |
| **Requisito não funcional** | RNF#1 Senha armazenada com hash bcrypt. RNF#2 E-mail normalizado em minúsculas. RNF#3 Coleta mínima de dados (LGPD). |
| **Prioridade** | [A] |
| **Pontos de história** | 3 |
| **Status no MVP** | Implementado |

### US13 — Entrar e sair

| Campo | Conteúdo |
|---|---|
| **ID** | US13 |
| **Título** | Entrar e sair |
| **Requerente** | Cliente final |
| **Ação** | Como **cliente cadastrado**, eu quero **entrar com e-mail e senha e sair quando quiser** para que **minha conta fique protegida, inclusive em celular compartilhado**. |
| **Comentários** | A sessão dura 7 dias e fica num cookie httpOnly. O menu "Olá, Nome" dá acesso a "Meus pedidos" e "Sair". |
| **Critérios de aceitação** | CA#1 DADO credenciais corretas, QUANDO entro, ENTÃO o cabeçalho mostra meu primeiro nome.<br>CA#2 DADO e-mail ou senha errados, QUANDO entro, ENTÃO vejo "E-mail ou senha incorretos." sem revelar qual dos dois está errado.<br>CA#3 DADO que estou logado, QUANDO clico em "Sair", ENTÃO volto à vitrine deslogado. |
| **Regras de negócio** | — |
| **Requisito não funcional** | RNF#1 Cookie de sessão httpOnly e SameSite=Lax. RNF#2 O redirecionamento após o login só aceita caminhos internos. |
| **Prioridade** | [A] |
| **Pontos de história** | 2 |
| **Status no MVP** | Implementado |

### US14 — Recuperar a senha

| Campo | Conteúdo |
|---|---|
| **ID** | US14 |
| **Título** | Recuperar a senha |
| **Requerente** | Atendente |
| **Ação** | Como **cliente**, eu quero **redefinir minha senha por um link enviado ao meu e-mail** para que **eu não perca o acesso nem precise pedir ajuda à loja**. |
| **Comentários** | Depende de um serviço de envio de e-mail (por exemplo, Resend ou SES). |
| **Critérios de aceitação** | CA#1 DADO um e-mail cadastrado, QUANDO peço recuperação, ENTÃO recebo um link válido por 30 minutos.<br>CA#2 DADO um e-mail não cadastrado, QUANDO peço recuperação, ENTÃO vejo a mesma mensagem neutra. |
| **Regras de negócio** | RN10 |
| **Requisito não funcional** | RNF#1 Token de uso único. |
| **Prioridade** | [C] |
| **Pontos de história** | 3 |
| **Status no MVP** | Backlog futuro |

---

## Checkout e pagamento

### US15 — Escolher entrega ou retirada

| Campo | Conteúdo |
|---|---|
| **ID** | US15 |
| **Título** | Escolher entrega ou retirada |
| **Requerente** | Dona da loja |
| **Ação** | Como **cliente**, eu quero **escolher entre receber em casa ou retirar na loja** para que **eu economize o frete quando estiver por perto**. |
| **Comentários** | A retirada reduz custo de motoboy e leva o cliente ao balcão, onde ele pode comprar mais. |
| **Critérios de aceitação** | CA#1 DADO a opção retirada, QUANDO finalizo, ENTÃO o endereço não é pedido e o frete é zero.<br>CA#2 DADO a opção entrega sem endereço, QUANDO finalizo, ENTÃO vejo "Informe o endereço de entrega.". |
| **Regras de negócio** | RN02 |
| **Requisito não funcional** | — |
| **Prioridade** | [A] |
| **Pontos de história** | 2 |
| **Status no MVP** | Implementado |

### US16 — Preencher o endereço pelo CEP

| Campo | Conteúdo |
|---|---|
| **ID** | US16 |
| **Título** | Preencher o endereço pelo CEP |
| **Requerente** | Cliente final |
| **Ação** | Como **cliente**, eu quero **digitar o CEP e ter rua, bairro, cidade e UF preenchidos automaticamente** para que **eu finalize mais rápido e com menos erro de digitação**. |
| **Comentários** | Usa a base de CEPs dos Correios por meio de serviços públicos: ViaCEP (principal) e BrasilAPI (reserva). A API oficial dos Correios exige contrato. Se os dois serviços estiverem fora do ar, o cliente preenche manualmente. O endereço é copiado para o pedido no momento da compra. |
| **Critérios de aceitação** | CA#1 DADO o CEP 01310-100, QUANDO saio do campo, ENTÃO "Avenida Paulista", "Bela Vista", "São Paulo" e "SP" são preenchidos.<br>CA#2 DADO um CEP inexistente, QUANDO saio do campo, ENTÃO vejo "CEP não encontrado".<br>CA#3 DADO o ViaCEP indisponível, QUANDO saio do campo, ENTÃO consigo digitar o endereço manualmente. |
| **Regras de negócio** | — |
| **Requisito não funcional** | RNF#1 O CEP é validado com 8 dígitos no servidor. RNF#2 Campos com `autocomplete` adequado. |
| **Prioridade** | [B] |
| **Pontos de história** | 2 |
| **Status no MVP** | Implementado |

### US17 — Reutilizar endereço salvo

| Campo | Conteúdo |
|---|---|
| **ID** | US17 |
| **Título** | Reutilizar endereço salvo |
| **Requerente** | Cliente final |
| **Ação** | Como **cliente recorrente**, eu quero **salvar meu endereço e escolhê-lo nas próximas compras** para que **a recompra leve poucos toques**. |
| **Comentários** | A opção "Salvar este endereço" vem marcada por padrão. |
| **Critérios de aceitação** | CA#1 DADO que salvei um endereço, QUANDO volto ao checkout, ENTÃO ele aparece selecionado.<br>CA#2 DADO um endereço salvo, QUANDO escolho "Usar outro endereço", ENTÃO o formulário em branco aparece. |
| **Regras de negócio** | — |
| **Requisito não funcional** | RNF#1 Cada cliente só vê os próprios endereços. |
| **Prioridade** | [C] |
| **Pontos de história** | 2 |
| **Status no MVP** | Implementado |

### US18 — Pagar com cartão de crédito

| Campo | Conteúdo |
|---|---|
| **ID** | US18 |
| **Título** | Pagar com cartão de crédito |
| **Requerente** | Dona da loja |
| **Ação** | Como **cliente**, eu quero **pagar com cartão e ter a aprovação na hora** para que **meu pedido entre direto na fila de preparo**. |
| **Comentários** | O gateway é **simulado** nesta versão. Cartões de teste: `4111 1111 1111 1111` (aprovado) e `4000 0000 0002 0000` (recusado). Apenas os 4 últimos dígitos são gravados. |
| **Critérios de aceitação** | CA#1 DADO um cartão válido, QUANDO pago, ENTÃO o pedido nasce "Pagamento aprovado" e vou para a TELA-07.<br>CA#2 DADO um número inválido no Luhn, QUANDO pago, ENTÃO vejo "Número de cartão inválido." abaixo do campo.<br>CA#3 DADO uma validade vencida, QUANDO pago, ENTÃO vejo a mensagem de cartão vencido. |
| **Regras de negócio** | RN06, RN03 |
| **Requisito não funcional** | RNF#1 O número completo e o CVV nunca são armazenados. RNF#2 Autorização e gravação do pedido acontecem numa única transação. |
| **Prioridade** | [A] |
| **Pontos de história** | 5 |
| **Status no MVP** | Implementado (gateway simulado) |

### US19 — Pagar com PIX

| Campo | Conteúdo |
|---|---|
| **ID** | US19 |
| **Título** | Pagar com PIX |
| **Requerente** | Cliente final |
| **Ação** | Como **cliente**, eu quero **receber um código PIX copia-e-cola** para que **eu pague pelo app do meu banco sem digitar dados de cartão**. |
| **Comentários** | O pedido fica "Aguardando pagamento" e o estoque já fica reservado. Na demonstração, o botão "Simular pagamento confirmado" faz o papel do webhook do banco. |
| **Critérios de aceitação** | CA#1 DADO a escolha de PIX, QUANDO confirmo o pedido, ENTÃO vejo o código e o botão "Copiar código".<br>CA#2 DADO um PIX pendente, QUANDO o pagamento é confirmado, ENTÃO o status muda para "Pagamento aprovado" e aparece na linha do tempo. |
| **Regras de negócio** | RN06, RN07 |
| **Requisito não funcional** | RNF#1 O código PIX traz o valor e o número do pedido. |
| **Prioridade** | [A] |
| **Pontos de história** | 3 |
| **Status no MVP** | Implementado (simulado) |

### US20 — Tratar pagamento recusado

| Campo | Conteúdo |
|---|---|
| **ID** | US20 |
| **Título** | Tratar pagamento recusado |
| **Requerente** | Atendente |
| **Ação** | Como **cliente**, eu quero **uma mensagem clara quando o cartão for recusado, sem perder o que preenchi** para que **eu tente outro cartão ou PIX na mesma tela**. |
| **Comentários** | No app anterior, a recusa gerava pedido "fantasma" e estoque preso. |
| **Critérios de aceitação** | CA#1 DADO um cartão terminado em 0000, QUANDO pago, ENTÃO vejo "Pagamento recusado pela operadora do cartão. Tente outro cartão ou pague com PIX." no topo do formulário.<br>CA#2 DADO uma recusa, QUANDO consulto o banco, ENTÃO nenhum pedido foi criado e o estoque continua igual. |
| **Regras de negócio** | RN06, RN03 |
| **Requisito não funcional** | RNF#1 Rollback total da transação. |
| **Prioridade** | [A] |
| **Pontos de história** | 2 |
| **Status no MVP** | Implementado |

### US21 — Agendar janela de entrega

| Campo | Conteúdo |
|---|---|
| **ID** | US21 |
| **Título** | Agendar janela de entrega |
| **Requerente** | Dona da loja |
| **Ação** | Como **cliente**, eu quero **escolher dia e faixa de horário da entrega** para que **o cupcake chegue fresco na hora da festa ou do presente**. |
| **Comentários** | Exige definir a capacidade de produção por janela. |
| **Critérios de aceitação** | CA#1 DADO uma janela lotada, QUANDO tento escolhê-la, ENTÃO ela aparece indisponível. |
| **Regras de negócio** | Nova regra: capacidade por janela |
| **Requisito não funcional** | — |
| **Prioridade** | [D] |
| **Pontos de história** | 3 |
| **Status no MVP** | Backlog futuro |

### US22 — Integrar gateway de pagamento real

| Campo | Conteúdo |
|---|---|
| **ID** | US22 |
| **Título** | Integrar gateway de pagamento real |
| **Requerente** | Dona da loja |
| **Ação** | Como **dona da loja**, eu quero **receber de verdade por PIX e cartão por meio de um PSP (Mercado Pago, Pagar.me ou Stripe)** para que **o app passe a vender em produção**. |
| **Comentários** | Os pontos de troca já estão isolados em `src/models/regras/pagamento.ts`. O webhook do PSP substitui o botão "Simular pagamento". |
| **Critérios de aceitação** | CA#1 DADO um webhook de PIX pago, QUANDO recebido com assinatura válida, ENTÃO o pedido vai para "Pago".<br>CA#2 DADO um webhook com assinatura inválida, QUANDO recebido, ENTÃO é rejeitado e registrado em log. |
| **Regras de negócio** | RN06, RN07 |
| **Requisito não funcional** | RNF#1 Conformidade PCI via tokenização do PSP (o app não toca no número do cartão). |
| **Prioridade** | [C] |
| **Pontos de história** | 5 |
| **Status no MVP** | Backlog futuro |

---

## Pós-venda

### US23 — Acompanhar o pedido

| Campo | Conteúdo |
|---|---|
| **ID** | US23 |
| **Título** | Acompanhar o pedido |
| **Requerente** | Atendente |
| **Ação** | Como **cliente**, eu quero **ver em que etapa está meu pedido, com data e hora de cada mudança** para que **eu não precise ligar ou mandar mensagem perguntando "já saiu?"**. |
| **Comentários** | A TELA-07 mostra itens, valores, endereço, pagamento e a linha do tempo (histórico de status). Logo após a compra, aparece a mensagem "Pedido #N recebido!". |
| **Critérios de aceitação** | CA#1 DADO um pedido pago com cartão, QUANDO abro o detalhe, ENTÃO vejo "Aguardando pagamento" e "Pagamento aprovado" na linha do tempo.<br>CA#2 DADO que a loja avançou para "Em preparo" com a observação "Forno 2", QUANDO atualizo a página, ENTÃO vejo a nova etapa com a observação.<br>CA#3 DADO um pedido de outro cliente, QUANDO tento acessar pela URL, ENTÃO vejo "não encontrado". |
| **Regras de negócio** | RN07 |
| **Requisito não funcional** | RNF#1 Horários exibidos no fuso America/Sao_Paulo. |
| **Prioridade** | [A] |
| **Pontos de história** | 3 |
| **Status no MVP** | Implementado |

### US24 — Ver o histórico de pedidos

| Campo | Conteúdo |
|---|---|
| **ID** | US24 |
| **Título** | Ver o histórico de pedidos |
| **Requerente** | Cliente final |
| **Ação** | Como **cliente**, eu quero **ver a lista dos meus pedidos com data, quantidade, situação e total** para que **eu consulte compras anteriores**. |
| **Comentários** | TELA-08, com o pedido mais recente primeiro. |
| **Critérios de aceitação** | CA#1 DADO que tenho pedidos, QUANDO abro "Meus pedidos", ENTÃO vejo cada um com um selo colorido de status.<br>CA#2 DADO que não tenho pedidos, QUANDO abro, ENTÃO vejo um convite para conhecer o cardápio. |
| **Regras de negócio** | — |
| **Requisito não funcional** | RNF#1 Exige login; sem login, o cliente é levado para a TELA-04 e volta à lista depois de entrar. |
| **Prioridade** | [B] |
| **Pontos de história** | 2 |
| **Status no MVP** | Implementado |

### US25 — Cancelar o pedido

| Campo | Conteúdo |
|---|---|
| **ID** | US25 |
| **Título** | Cancelar o pedido |
| **Requerente** | Dona da loja |
| **Ação** | Como **cliente**, eu quero **cancelar o pedido antes de ele entrar em preparo** para que **eu corrija uma compra feita por engano sem precisar falar com a loja**. |
| **Comentários** | Depois que entra em preparo, o produto já foi feito, então o cancelamento só pode ser feito pela loja. O app pede confirmação antes de cancelar. |
| **Critérios de aceitação** | CA#1 DADO um pedido "Pago", QUANDO confirmo o cancelamento, ENTÃO ele vai para "Cancelado" e o estoque volta.<br>CA#2 DADO um pedido "Em preparo", QUANDO abro o detalhe, ENTÃO o botão de cancelar não aparece e a API recusa com "Fale com a loja".<br>CA#3 DADO um PIX pendente cancelado, QUANDO consulto o pagamento, ENTÃO ele aparece como não concluído. |
| **Regras de negócio** | RN08, RN03, RN07 |
| **Requisito não funcional** | RNF#1 Confirmação explícita (diálogo) antes de uma ação irreversível. |
| **Prioridade** | [B] |
| **Pontos de história** | 2 |
| **Status no MVP** | Implementado |

### US26 — Receber notificações de status

| Campo | Conteúdo |
|---|---|
| **ID** | US26 |
| **Título** | Receber notificações de status |
| **Requerente** | Cliente final |
| **Ação** | Como **cliente**, eu quero **receber no WhatsApp ou por e-mail quando o pedido sair para entrega** para que **eu esteja em casa para receber**. |
| **Comentários** | O celular já é coletado no cadastro (opcional). Precisa de consentimento de comunicação (LGPD). |
| **Critérios de aceitação** | CA#1 DADO o consentimento ativo, QUANDO o pedido muda para "Saiu para entrega", ENTÃO recebo a mensagem em até 1 minuto. |
| **Regras de negócio** | RN07 |
| **Requisito não funcional** | RNF#1 Envio assíncrono (fila). |
| **Prioridade** | [D] |
| **Pontos de história** | 3 |
| **Status no MVP** | Backlog futuro |

### US27 — Avaliar os cupcakes

| Campo | Conteúdo |
|---|---|
| **ID** | US27 |
| **Título** | Avaliar os cupcakes |
| **Requerente** | Dona da loja |
| **Ação** | Como **cliente**, eu quero **dar nota e comentar os sabores que comprei** para que **outros clientes escolham com mais confiança**. |
| **Comentários** | Só quem comprou e recebeu o pedido pode avaliar (prova social confiável). |
| **Critérios de aceitação** | CA#1 DADO um pedido "Entregue", QUANDO avalio um item, ENTÃO a nota aparece na página do produto após moderação. |
| **Regras de negócio** | Nova regra: avaliação só para compra entregue |
| **Requisito não funcional** | — |
| **Prioridade** | [E] |
| **Pontos de história** | 2 |
| **Status no MVP** | Backlog futuro |

---

## Administração

### US28 — Ver o painel com indicadores

| Campo | Conteúdo |
|---|---|
| **ID** | US28 |
| **Título** | Ver o painel com indicadores |
| **Requerente** | Dona da loja |
| **Ação** | Como **administradora**, eu quero **ver pedidos em aberto, pedidos pagos, faturamento e produtos com estoque baixo** para que **eu planeje a produção do dia**. |
| **Comentários** | TELA-09. "Estoque baixo" lista os produtos ativos com 5 unidades ou menos e destaca os esgotados. |
| **Critérios de aceitação** | CA#1 DADO um pedido PIX pendente e um pago com cartão, QUANDO abro o painel, ENTÃO vejo 2 em aberto, 1 pago e faturamento igual ao total do pedido pago.<br>CA#2 DADO um produto com 4 unidades, QUANDO abro o painel, ENTÃO ele aparece em "Estoque baixo". |
| **Regras de negócio** | RN07 |
| **Requisito não funcional** | RNF#1 Acesso restrito ao papel ADMIN; cliente é redirecionado à vitrine. |
| **Prioridade** | [B] |
| **Pontos de história** | 3 |
| **Status no MVP** | Implementado |

### US29 — Cadastrar e editar produtos

| Campo | Conteúdo |
|---|---|
| **ID** | US29 |
| **Título** | Cadastrar e editar produtos |
| **Requerente** | Dona da loja |
| **Ação** | Como **administradora**, eu quero **cadastrar e editar sabores (nome, categoria, preço, estoque, descrição, ingredientes, imagem, ativo, destaque)** para que **o cardápio online reflita a vitrine da loja**. |
| **Comentários** | TELA-12 e TELA-13. Produtos não são excluídos, apenas desativados, para preservar o histórico dos pedidos. O slug da URL é gerado sem acentos e sem repetição. O preço aceita "12,50". |
| **Critérios de aceitação** | CA#1 DADO dados válidos, QUANDO salvo, ENTÃO o produto aparece na lista e, se estiver ativo, na vitrine.<br>CA#2 DADO o preço "abc", QUANDO salvo, ENTÃO vejo "Informe um preço válido, ex.: 12,50".<br>CA#3 DADO um nome igual ao de outro produto, QUANDO salvo, ENTÃO a URL recebe sufixo (ex.: `red-velvet-2`).<br>CA#4 DADO um produto desativado, QUANDO um cliente acessa a URL dele, ENTÃO vê "não encontrado". |
| **Regras de negócio** | RN09, RN01 |
| **Requisito não funcional** | RNF#1 Preço entre R$ 0,01 e R$ 1.000,00. Estoque entre 0 e 10.000. |
| **Prioridade** | [A] |
| **Pontos de história** | 5 |
| **Status no MVP** | Implementado |

### US30 — Gerenciar o status dos pedidos

| Campo | Conteúdo |
|---|---|
| **ID** | US30 |
| **Título** | Gerenciar o status dos pedidos |
| **Requerente** | Atendente |
| **Ação** | Como **atendente/confeiteira**, eu quero **filtrar os pedidos por situação e avançar cada um para a próxima etapa** para que **a cozinha e o cliente saibam sempre o que está acontecendo**. |
| **Comentários** | TELA-10 e TELA-11. Só aparecem botões para as transições válidas: um pedido de retirada mostra "Pronto para retirada" e nunca "Saiu para entrega". Cada mudança aceita uma observação (ex.: "entregador João"). |
| **Critérios de aceitação** | CA#1 DADO um pedido "Pago", QUANDO tento marcá-lo como "Entregue" via API, ENTÃO recebo o erro 409 "Não é possível mudar o pedido de 'Pagamento aprovado' para 'Entregue'".<br>CA#2 DADO um pedido "Em preparo" de entrega, QUANDO avanço, ENTÃO ele vai para "Saiu para entrega" e depois "Entregue".<br>CA#3 DADO um cancelamento feito pela loja, QUANDO confirmo, ENTÃO os itens voltam ao estoque. |
| **Regras de negócio** | RN07, RN03 |
| **Requisito não funcional** | RNF#1 Cada mudança é gravada no histórico com data e hora (auditoria). |
| **Prioridade** | [A] |
| **Pontos de história** | 5 |
| **Status no MVP** | Implementado |

### US31 — Encomendas personalizadas para festas

| Campo | Conteúdo |
|---|---|
| **ID** | US31 |
| **Título** | Encomendas personalizadas para festas |
| **Requerente** | Dona da loja |
| **Ação** | Como **cliente**, eu quero **solicitar um orçamento de encomenda (quantidade, tema, cores, toppers e data)** para que **eu feche o pedido da festa sem várias idas e vindas no WhatsApp**. |
| **Comentários** | Encomendas são o maior ticket médio da loja. Fluxo: solicitação → orçamento da loja → aceite → sinal via PIX. |
| **Critérios de aceitação** | CA#1 DADO uma solicitação enviada, QUANDO a loja responde com o orçamento, ENTÃO consigo aceitar e pagar o sinal no app. |
| **Regras de negócio** | Nova regra: antecedência mínima de 3 dias |
| **Requisito não funcional** | — |
| **Prioridade** | [D] |
| **Pontos de história** | 5 |
| **Status no MVP** | Backlog futuro |

### US32 — Relatório de vendas

| Campo | Conteúdo |
|---|---|
| **ID** | US32 |
| **Título** | Relatório de vendas |
| **Requerente** | Dona da loja |
| **Ação** | Como **administradora**, eu quero **ver as vendas por período, os sabores mais vendidos e o ticket médio, com exportação em CSV** para que **eu decida o que produzir e o que promover**. |
| **Comentários** | Evolução natural do painel (US28). |
| **Critérios de aceitação** | CA#1 DADO um período, QUANDO gero o relatório, ENTÃO vejo o ranking de sabores e posso baixar o CSV. |
| **Regras de negócio** | RN01 |
| **Requisito não funcional** | RNF#1 Consulta em menos de 3 s para 12 meses de dados. |
| **Prioridade** | [C] |
| **Pontos de história** | 3 |
| **Status no MVP** | Backlog futuro |

---

## Evoluções incorporadas na revisão (Kaizen)

Histórias acrescentadas na revisão do PIT II a partir de situações comuns em e-commerce: dúvida sobre entrega antes da compra, autonomia da loja para definir frete, vitrine poluída por itens esgotados, produtos de maior ticket pouco visíveis e necessidade de conferir o carrinho sem sair da página.

### US33 — Consultar frete e prazo pelo CEP antes de comprar

| Campo | Conteúdo |
|---|---|
| **ID** | US33 |
| **Título** | Consultar frete e prazo pelo CEP antes de comprar |
| **Requerente** | Cliente final |
| **Ação** | Como **visitante**, eu quero **informar meu CEP na página do produto ou no carrinho e saber se a loja entrega, quanto custa e em quanto tempo** para que **eu decida se compro antes de criar conta**. |
| **Comentários** | Em e-commerce, não saber se há entrega para o próprio endereço é causa clássica de abandono. A cotação é pública (sem login), mostra o endereço encontrado (rua, bairro, cidade/UF) e lembra que a retirada na loja é grátis. O CEP fica salvo e é reaproveitado no carrinho e no checkout. Telas TELA-02 e TELA-03. |
| **Critérios de aceitação** | CA#1 DADO o CEP 08010-000, QUANDO calculo o frete, ENTÃO vejo "Rua Serra Dourada, São Miguel Paulista · São Paulo/SP" e "Entregamos! Zona Leste (SP): em até 3h após o preparo, por R$ 14,90 · grátis a partir de R$ 180,00".<br>CA#2 DADO o CEP 20040-002 (Rio de Janeiro), QUANDO calculo, ENTÃO vejo "Ainda não entregamos no CEP 20040-002" e a sugestão de retirar na loja.<br>CA#3 DADO o CEP 99999-999, QUANDO calculo, ENTÃO vejo "CEP não encontrado. Confira os números."<br>CA#4 DADO um CEP já calculado, QUANDO vou ao carrinho, ENTÃO o frete aparece no resumo sem digitar de novo. |
| **Regras de negócio** | RN02 |
| **Requisito não funcional** | RNF#1 Resposta em até 2 s. RNF#2 Se o serviço de CEP falhar, a cotação de frete continua funcionando (só não mostra o endereço). |
| **Prioridade** | [A] |
| **Pontos de história** | 3 |
| **Status no MVP** | Implementado |
| **Origem** | Evolução proposta a partir de situações reais de e-commerce |

### US34 — Gerenciar zonas de entrega e frete

| Campo | Conteúdo |
|---|---|
| **ID** | US34 |
| **Título** | Gerenciar zonas de entrega e frete |
| **Requerente** | Dona da loja |
| **Ação** | Como **administradora**, eu quero **cadastrar e editar zonas de entrega com faixa de CEP, valor do frete, prazo e valor mínimo para frete grátis** para que **eu ajuste onde entrego e quanto cobro sem depender de um desenvolvedor**. |
| **Comentários** | TELA-16 (lista) e TELA-17 (formulário). Zonas podem se sobrepor: vale a faixa mais específica, o que permite, por exemplo, um bairro com frete diferente dentro da Grande SP. Zona inativa deixa de valer imediatamente. Promoções de preço continuam sendo feitas editando o preço do produto (decisão registrada em 01-escopo-e-revisao.md). |
| **Critérios de aceitação** | CA#1 DADO uma zona nova válida, QUANDO salvo, ENTÃO ela aparece na lista e passa a valer na cotação.<br>CA#2 DADO o CEP final menor que o inicial, QUANDO salvo, ENTÃO vejo "Deve ser maior ou igual ao CEP inicial."<br>CA#3 DADO o campo "grátis a partir de" em branco, QUANDO salvo, ENTÃO a zona nunca tem frete grátis.<br>CA#4 DADO um cliente logado (não administrador), QUANDO acessa /admin/frete, ENTÃO é redirecionado para a vitrine. |
| **Regras de negócio** | RN02 |
| **Requisito não funcional** | RNF#1 Faixa e valores validados também no banco (CHECK). RNF#2 Acesso restrito ao papel ADMIN. |
| **Prioridade** | [A] |
| **Pontos de história** | 5 |
| **Status no MVP** | Implementado |
| **Origem** | Evolução proposta a partir de situações reais de e-commerce |

### US35 — Ver na vitrine só o que dá para comprar hoje

| Campo | Conteúdo |
|---|---|
| **ID** | US35 |
| **Título** | Ver na vitrine só o que dá para comprar hoje |
| **Requerente** | Cliente final |
| **Ação** | Como **cliente**, eu quero **que a vitrine e a busca mostrem apenas cupcakes disponíveis hoje** para que **eu não perca tempo escolhendo algo que não posso comprar**. |
| **Comentários** | Cupcake é produção do dia: mostrar esgotado polui a vitrine e frustra. O produto esgotado continua cadastrado e ativo; volta sozinho à vitrine quando a loja repõe o estoque. A página direta continua abrindo (links compartilhados não quebram) e informa "Esgotado hoje". |
| **Critérios de aceitação** | CA#1 DADO "Coco e Maracujá" com estoque 0, QUANDO abro a vitrine ou busco "maracujá", ENTÃO ele não aparece.<br>CA#2 DADO o link direto do produto esgotado, QUANDO abro, ENTÃO vejo "Esgotado hoje, volte amanhã!" e o botão desabilitado.<br>CA#3 DADO que a loja repõe o estoque, QUANDO a vitrine recarrega, ENTÃO o produto volta a aparecer. |
| **Regras de negócio** | RN09, RN03 |
| **Requisito não funcional** | RNF#1 Filtro feito na consulta ao banco (não no navegador). |
| **Prioridade** | [B] |
| **Pontos de história** | 1 |
| **Status no MVP** | Implementado |
| **Origem** | Evolução proposta a partir de situações reais de e-commerce |

### US36 — Identificar rapidamente as caixas e kits para presente

| Campo | Conteúdo |
|---|---|
| **ID** | US36 |
| **Título** | Identificar rapidamente as caixas e kits para presente |
| **Requerente** | Dona da loja |
| **Ação** | Como **visitante**, eu quero **perceber logo de cara que existem caixas e kits para presente** para que **eu considere uma compra maior quando estou procurando um presente**. |
| **Comentários** | A foto de um cupcake isolado não comunica "caixa com 6". Solução: arte que mostra a caixa aberta com os cupcakes e a quantidade ("CAIXA COM 6", "KIT FESTA · 12 MINIS"), selo "📦 Kit para presentear" no card e a categoria "Caixas e kits" como 2º filtro. Fotos reais podem substituir as ilustrações sem mudar o código. |
| **Critérios de aceitação** | CA#1 DADO a vitrine, QUANDO vejo o card de um kit, ENTÃO a imagem mostra a caixa com os cupcakes e o selo "Kit para presentear".<br>CA#2 DADO os filtros de categoria no celular, QUANDO a vitrine abre, ENTÃO "Caixas e kits" aparece sem precisar rolar a barra. |
| **Regras de negócio** | RN09 |
| **Requisito não funcional** | RNF#1 Imagem com texto alternativo descrevendo o conteúdo da caixa. |
| **Prioridade** | [B] |
| **Pontos de história** | 2 |
| **Status no MVP** | Implementado |
| **Origem** | Evolução proposta a partir de situações reais de e-commerce |

### US37 — Conferir e ajustar o carrinho no minicarrinho

| Campo | Conteúdo |
|---|---|
| **ID** | US37 |
| **Título** | Conferir e ajustar o carrinho no minicarrinho |
| **Requerente** | Cliente final |
| **Ação** | Como **cliente**, eu quero **um minicarrinho lateral para conferir e ajustar os itens sem sair da página** para que **eu continue escolhendo sabores sem perder o lugar no cardápio**. |
| **Comentários** | Padrão de mercado em e-commerce. Abre pelo ícone do carrinho e automaticamente ao adicionar um produto. Mostra itens, quantidades, subtotal e os botões "Ver carrinho e finalizar" e "Continuar comprando". Cupom e frete continuam no carrinho completo (TELA-03). |
| **Critérios de aceitação** | CA#1 DADO um produto disponível, QUANDO clico em "Adicionar", ENTÃO o minicarrinho abre com o item.<br>CA#2 DADO o minicarrinho aberto, QUANDO aperto Esc, clico fora ou no ×, ENTÃO ele fecha e continuo na mesma página.<br>CA#3 DADO um item no minicarrinho, QUANDO uso + / − / Remover, ENTÃO o subtotal e o contador do cabeçalho atualizam na hora. |
| **Regras de negócio** | RN04 |
| **Requisito não funcional** | RNF#1 Acessível: role="dialog", foco no botão fechar ao abrir, Esc fecha. RNF#2 Ocupa a tela inteira no celular. |
| **Prioridade** | [B] |
| **Pontos de história** | 3 |
| **Status no MVP** | Implementado |
| **Origem** | Evolução proposta a partir de situações reais de e-commerce |

### US38 — Programar preço promocional

| Campo | Conteúdo |
|---|---|
| **ID** | US38 |
| **Título** | Programar preço promocional |
| **Requerente** | Dona da loja |
| **Ação** | Como **administradora**, eu quero **definir um preço promocional com data e hora de início e fim** para que **a promoção entre e saia do ar sozinha, sem eu precisar lembrar de mudar o preço**. |
| **Comentários** | Decisão de produto nesta versão: não há módulo de promoção; a loja faz promoção alterando o preço do produto no painel (US29) e usa cupons (US10). Esta história fica no backlog para quando as promoções ficarem frequentes. Deve exibir "de R$ X por R$ Y" na vitrine. |
| **Critérios de aceitação** | CA#1 DADO uma promoção agendada para sexta das 18h às 22h, QUANDO chega 18h, ENTÃO a vitrine mostra o preço promocional e o preço antigo riscado; às 22h volta ao normal. |
| **Regras de negócio** | RN01, nova regra: preço promocional menor que o preço normal |
| **Requisito não funcional** | — |
| **Prioridade** | [C] |
| **Pontos de história** | 3 |
| **Status no MVP** | Backlog futuro |
| **Origem** | Evolução proposta a partir de situações reais de e-commerce |

---

## Totais

| Situação | Histórias | Pontos |
|---|---|---|
| Implementadas no MVP | 30 (US01–US13, US15–US20, US23–US25, US28–US30, US33–US37) | 81 |
| Backlog futuro | 8 (US14, US21, US22, US26, US27, US31, US32, US38) | 27 |
| **Total** | **38** | **108** |

O levantamento do PIT I registrou cerca de 30 cartões e 90 pontos (32 cartões / 91 pontos na primeira revisão). Na revisão Kaizen do PIT II o backlog cresceu para 38 cartões e 108 pontos com as evoluções US33–US38. A história de frete fixo (US11) foi revisada para a regra de frete por zona.
