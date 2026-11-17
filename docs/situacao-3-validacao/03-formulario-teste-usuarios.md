# Formulário de Teste com Usuários (Teste de Aceitação)

Especificação do formulário a ser criado no **Google Forms** e enviado a **5 colegas de curso ou profissionais da área** (de preferência quem trabalha com e-commerce), que atuarão como "dublês" de usuários.

Cada testador assume **um dos três papéis** das personas do projeto (ver `docs/situacao-1-planejamento/02-historias-de-usuario.md`). Sugestão de distribuição para 5 pessoas: 2 como **Visitante**, 2 como **Cliente** e 1 como **Administradora da loja**. Quem quiser pode testar mais de um papel.

> **Importante:** os testes devem ser feitos por **pessoas reais**, usando o app publicado. Nenhuma ficha deve ser inventada ou preenchida pelo próprio desenvolvedor. Falhas encontradas **não devem ser escondidas**: elas são a matéria-prima das correções e do laudo de qualidade.

## Configuração do formulário

- **Título:** Teste da Loja CruzCake Cupcakes — Projeto Integrador
- **Descrição:** "Obrigado por testar! Use o app como se fosse um cliente de verdade. Nenhum pagamento é cobrado: os pagamentos são simulados. Leva de 15 a 20 minutos."
- **Configurações:** coletar e-mail = *não* (o nome já identifica). Permitir upload de arquivos, o que exige que o testador esteja logado em uma conta Google; avisar isso no convite. Limitar a 1 resposta = não (o testador pode enviar uma segunda rodada após as correções).
- **Respostas:** vincular a uma Planilha Google para consolidar as fichas.

## Seção 1 — Identificação

| # | Pergunta | Tipo | Obrigatória |
|---|---|---|---|
| 1 | Nome completo | Resposta curta | Sim |
| 2 | Perfil | Múltipla escolha: *Colega de curso* / *Profissional de e-commerce* / *Profissional da área de TI* / *Outro* | Sim |
| 2a | **Papel que você assumiu no teste** | Caixas de seleção: *Visitante (ainda sem conta, decidindo se compra)* / *Cliente (comprador recorrente)* / *Administradora da loja* | Sim |
| 3 | Data do teste | Data | Sim |
| 4 | Dispositivo usado | Caixas de seleção: *Computador* / *Celular* / *Tablet* | Sim |
| 5 | Navegador e sistema | Resposta curta (ex.: "Chrome no Android 14") | Sim |

## Seção 2 — Roteiro de tarefas sugeridas

Texto de orientação: "Faça as tarefas do papel que você escolheu. Marque as que conseguiu concluir. Pode explorar além delas!"

**Pergunta 6 — Quais tarefas você conseguiu concluir?** (Caixas de seleção, agrupadas por papel)

*Visitante (sem conta)*
- [ ] V1. Descobrir, sem criar conta, se a loja entrega no seu CEP, quanto custa e em quanto tempo (na página de um produto ou no carrinho). Teste também `20040-002` (fora da área)
- [ ] V2. Encontrar um sabor usando a busca ou as categorias e achar uma opção de presente (caixas e kits)
- [ ] V3. Adicionar sabores pelo minicarrinho, ajustar quantidades e voltar a navegar
- [ ] V4. Aplicar o cupom `BEMVINDO10` no carrinho e conferir o total com frete
- [ ] V5. Criar uma conta e finalizar uma compra com **PIX** (retirada na loja), simulando a confirmação

*Cliente (comprador recorrente, conta `cliente@cruzcake.com.br` / `Cliente1234` ou sua conta)*
- [ ] C1. Comprar com **cartão** e entrega (cartão de teste `4111 1111 1111 1111`, validade futura, CVV `123`), usando o endereço salvo ou um novo
- [ ] C2. Testar um cartão recusado (`4000 0000 0002 0000`) e verificar a mensagem
- [ ] C3. Tentar entregar num CEP fora da área e verificar o que o app sugere
- [ ] C4. Acompanhar o pedido em "Meus pedidos" e cancelar um pedido antes do preparo
- [ ] C5. Usar o app pelo celular

*Administradora da loja (`admin@cruzcake.com.br` / `Admin1234`)*
- [ ] A1. Avançar um pedido até "Entregue" e cancelar outro
- [ ] A2. Cadastrar um produto e zerar o estoque de outro (verifique se ele some da vitrine)
- [ ] A3. Criar uma zona de entrega nova em **Painel → Frete** e conferir a cotação no site
- [ ] A4. Fazer uma "promoção" alterando o preço de um produto e depois voltar o preço

## Seção 3 — Resultado do teste

Esta seção reproduz os campos exigidos pelo template oficial da atividade.

| # | Pergunta | Tipo | Obrigatória |
|---|---|---|---|
| 7 | **O que você testou e funcionou?** Descreva as funcionalidades. | Parágrafo | Sim |
| 8 | **O que você testou e NÃO funcionou? O que deve ser corrigido?** Descreva o passo a passo para reproduzir. | Parágrafo | Sim (pode responder "nada") |
| 9 | Gravidade do principal problema encontrado | Múltipla escolha: *Bloqueante (impede a compra)* / *Alta* / *Média* / *Baixa (visual/texto)* / *Apenas sugestão* / *Não encontrei problemas* | Sim |
| 10 | **Funcionalidade não testada:** o que faltou testar ou o que você sentiu falta no app, e por quê? | Parágrafo | Sim |
| 11 | Prints das telas com erro (snapshots) | Upload de arquivo (imagens, até 5 arquivos, 10 MB) | Não |

## Seção 4 — Experiência de uso

| # | Pergunta | Tipo |
|---|---|---|
| 12 | Foi fácil comprar no app? | Escala linear 1 (muito difícil) a 5 (muito fácil) |
| 13 | As mensagens de erro foram claras? | Escala linear 1 a 5 |
| 14 | O visual transmite confiança para comprar? | Escala linear 1 a 5 |
| 15 | Você compraria nesta loja? | Múltipla escolha: *Sim* / *Talvez* / *Não* |
| 16 | Sugestões de melhoria | Parágrafo (opcional) |

## Instruções para o testador (texto no início do formulário)

1. Acesse o app pelo link enviado. Use o **celular** ou o **computador**; se puder, teste nos dois.
2. Os pagamentos são **simulados**. Use apenas os cartões de teste informados e **nunca** um cartão real.
3. Escolha o seu papel (Visitante, Cliente ou Administradora), siga as tarefas dele na Seção 2 e sinta-se à vontade para explorar. Avalie como faria no seu trabalho com e-commerce.
4. Ao encontrar um problema, tire um **print** (Windows: `Win+Shift+S`; Android: botões *Power + Volume −*; iPhone: *lateral + volume +*) e anexe na pergunta 11.
5. Descreva o problema com o passo a passo: "o que fiz → o que esperava → o que aconteceu".
6. Seja sincero(a): críticas ajudam mais do que elogios.

## Texto-convite (para enviar por WhatsApp/e-mail)

> Oi, [NOME]! Tudo bem?
>
> Estou finalizando meu Projeto Integrador de Engenharia de Software II: uma loja virtual de cupcakes (vitrine, carrinho, checkout com PIX/cartão e painel da loja). Faz parte da avaliação ter **5 pessoas testando de verdade** e me dando um retorno sincero.
>
> Como você trabalha com e-commerce, sua visão vai ser ótima. Você toparia me ajudar fazendo o papel de **[VISITANTE / CLIENTE / ADMINISTRADORA DA LOJA]**? Leva uns 15–20 minutos:
>
> 1. Acesse o app: **[LINK DO APP]**
> 2. Siga o roteiro e responda: **[LINK DO FORMULÁRIO]**
>
> Os pagamentos são simulados (nada é cobrado). Use só os cartões de teste que estão no formulário. Se achar algum erro, manda print! Pode criticar à vontade, isso me ajuda a melhorar.
>
> Se der, consegue responder até **[DATA LIMITE]**? Muito obrigado! 🧁

## Depois das respostas

1. Exportar as respostas da planilha e transcrever cada uma para [04-fichas-dos-testadores.md](04-fichas-dos-testadores.md).
2. Salvar os prints recebidos em [`evidencias/`](evidencias/README.md) como `TESTADOR-n_xx.png`.
3. Classificar cada problema, decidir se é pertinente corrigir e registrar as correções no [laudo de qualidade](05-laudo-de-qualidade.md).
4. Gerar o PDF com as 5 fichas, exigido na entrega, a partir do arquivo de fichas.
