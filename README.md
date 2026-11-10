<p align="center"><img src="public/logo.svg" alt="CruzCake" width="360"></p>

# CruzCake Cupcakes: loja virtual

Aplicação web responsiva de e-commerce para uma confeitaria de cupcakes gourmet: **vitrine virtual, carrinho, pedido eletrônico, pagamento (PIX e cartão simulados) e entrega ou retirada**, mais um **painel administrativo** para produtos, estoque e pedidos.

Projeto das disciplinas **Projeto Integrador Transdisciplinar em Engenharia de Software I e II** (Cruzeiro do Sul Virtual). O PIT I cobriu o levantamento de requisitos e o planejamento; o PIT II revisou o planejamento, implementou e validou a solução.

| | |
|---|---|
| **Aplicação publicada** | `[preencher após o deploy]` |
| **Vídeo de apresentação** | `[preencher]` |
| **Vídeo das melhorias** | `[preencher]` |

## Funcionalidades

**Cliente:** cardápio com categorias e busca · página do produto com ingredientes · carrinho persistente com estoque em tempo real · cupons de desconto · frete com regra de gratuidade · cadastro e login · checkout com entrega (CEP preenchido automaticamente) ou retirada · PIX e cartão (simulados, com cenário de recusa) · acompanhamento do pedido em linha do tempo · cancelamento antes do preparo.

**Administração:** indicadores e alerta de estoque baixo · cadastro e edição de produtos · lista de pedidos por situação · avanço de status com máquina de estados (só as etapas válidas aparecem) · cancelamento com devolução ao estoque.

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · PostgreSQL (Drizzle ORM; PGlite embarcado em desenvolvimento) · Zod · Vitest. Arquitetura **MVC**: `src/models` (Model), `src/controllers` (Controller), `src/app` + `src/components` (View). Detalhes em [docs/situacao-2-desenvolvimento/01-arquitetura.md](docs/situacao-2-desenvolvimento/01-arquitetura.md).

## Como rodar

Requer Node.js 20.9+ e **não exige instalar banco**:

```bash
npm install
npm run dev        # cria o banco local (migrações + seed) e abre em http://localhost:3000
npm test           # 52 testes unitários e de integração
```

Contas de demonstração: `cliente@cruzcake.com.br` / `Cliente1234` e `admin@cruzcake.com.br` / `Admin1234`. Cartão aprovado `4111 1111 1111 1111`; recusado `4000 0000 0002 0000`. Mais dados no [manual de uso](docs/situacao-2-desenvolvimento/02-manual-de-uso.md). Deploy (Vercel + Neon): [instalação e implantação](docs/situacao-2-desenvolvimento/03-instalacao-e-implantacao.md).

## Documentação

### Situação 1: planejamento revisado
1. [Escopo e revisão do PIT I (Kaizen)](docs/situacao-1-planejamento/01-escopo-e-revisao.md)
2. [Histórias de usuário (32 cartões, 91 pontos)](docs/situacao-1-planejamento/02-historias-de-usuario.md)
3. [Mapa de afinidade, backlog priorizado, sprints e tarefas](docs/situacao-1-planejamento/03-mapa-de-afinidade-e-backlog.md)
4. [Casos de uso: diagrama geral e expandidos](docs/situacao-1-planejamento/04-casos-de-uso.md)
5. [Diagramas UML: classes, sequência, atividades, estados, MVC](docs/situacao-1-planejamento/05-diagramas-uml.md)
6. [IHC: princípios, mapa conceitual, mapa navegacional, telas, wireframes e mockups](docs/situacao-1-planejamento/06-ihc.md)
7. [Modelagem de dados: conceitual, lógica normalizada e física](docs/situacao-1-planejamento/07-modelagem-de-dados.md) · [Dicionário de dados](database/dicionario-de-dados.md) · [DDL](database/migrations/0000_estrutura_inicial.sql)

### Situação 2: desenvolvimento
1. [Arquitetura, API e decisões técnicas](docs/situacao-2-desenvolvimento/01-arquitetura.md)
2. [Manual de uso](docs/situacao-2-desenvolvimento/02-manual-de-uso.md)
3. [Instalação e implantação](docs/situacao-2-desenvolvimento/03-instalacao-e-implantacao.md)
4. [Roteiro do vídeo de apresentação](docs/situacao-2-desenvolvimento/04-roteiro-video-apresentacao.md)

### Situação 3: validação
1. [Plano de testes (verificação e validação)](docs/situacao-3-validacao/01-plano-de-testes.md)
2. [Casos de teste manuais](docs/situacao-3-validacao/02-casos-de-teste-manuais.md)
3. [Formulário para os testadores](docs/situacao-3-validacao/03-formulario-teste-usuarios.md)
4. [Fichas dos 5 testadores](docs/situacao-3-validacao/04-fichas-dos-testadores.md)
5. [Laudo de qualidade](docs/situacao-3-validacao/05-laudo-de-qualidade.md)
6. [Roteiro do vídeo de melhorias](docs/situacao-3-validacao/06-roteiro-video-melhorias.md)

## Estrutura

```
src/app            páginas (View) e rotas de API (Router)
src/components     componentes de interface (View)
src/controllers    validação, autorização e orquestração (Controller)
src/models         entidades, regras de negócio e serviços (Model)
database           migrações SQL, seed e dicionário de dados
tests              testes unitários e de integração
docs               documentação organizada por situação-problema
```

## Autor

**Guilherme Henrique Dalla Rosa**, Engenharia de Software, Cruzeiro do Sul Virtual.

> Projeto acadêmico. A marca "CruzCake" é fictícia; a estrela do logo é uma homenagem à Universidade Cruzeiro do Sul. Nenhum pagamento real é processado.
