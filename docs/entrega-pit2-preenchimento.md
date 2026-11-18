# Rascunho de preenchimento do documento de entrega (PIT II)

> Texto pronto para copiar para o arquivo `PIT_atividade.docx` do PIT II. Itens entre colchetes dependem de ações suas (deploy, vídeos e testadores).

**Nome:** Guilherme Henrique Dalla Rosa
**RGM:** 30289815

## Documentação

Revisite a documentação do projeto desenvolvido na PIT I, faça as atualizações e melhorias e suba em um repositório GIT.

**Link do repositório:** https://github.com/massacruabusy/CruzCake_PIT2 (documentação em `/docs`, separada por situação-problema)

Resumo das melhorias (opcional, se houver espaço): planejamento revisado com as decisões que estavam em aberto no PIT I (plataforma, tecnologia, estoque e pagamentos); 40 histórias de usuário no template completo (116 pontos), incluindo evoluções da revisão Kaizen e da validação com usuários (frete por CEP com zonas de entrega, minicarrinho, refino visual, kits em destaque, vitrine sem esgotados); backlog priorizado com tarefas; casos de uso expandidos; diagramas de classes, sequência, atividades e estados; IHC com mapas conceitual e navegacional, wireframes e mockups; modelagem conceitual, lógica normalizada e física (PostgreSQL) com dicionário de dados.

## Codificação

| Campo | Valor |
|---|---|
| Linguagem do Back-end | TypeScript (Node.js) com Next.js 16, arquitetura MVC |
| Banco de Dados | PostgreSQL (ORM Drizzle; migrações versionadas) |
| Hospedagem | Vercel (aplicação) + Neon (PostgreSQL gerenciado) |
| Plataforma | Web responsiva (mobile-first), acessível pelo navegador do celular e do computador |
| Modo de Codificação | (X) Tradicional ( ) Low-code ( ) No-code |
| Link do repositório no GitHub com os códigos abertos | https://github.com/massacruabusy/CruzCake_PIT2 |
| Link da solução em funcionamento | https://cruz-cake-pit-2.vercel.app |
| Link do vídeo narrado (no mínimo 5 min) | https://youtu.be/FhQTHzisszA (roteiro: `docs/situacao-2-desenvolvimento/04-roteiro-video-apresentacao.md`) |

## Testes da solução

Transcrito de `docs/situacao-3-validacao/04-fichas-dos-testadores.md` (5 colegas da área de e-commerce, ficha enviada por Slack/WhatsApp, versão testada: v1).

**Nome:** Lucas
**Data do teste:** 12/11/2026
**O que testou e funcionou:** Não informado
**O que testou e não funcionou – O que deve ser corrigido:** Não há como saber se a loja entrega no endereço dele antes de comprar. Deve ser possível consultar a área de entrega antes da compra.
**Funcionalidade não testada (faltou ou não foi implementada):** Consulta de entrega por endereço/CEP: não existe na versão testada.

**Nome:** Mariele
**Data do teste:** 12/11/2026
**O que testou e funcionou:** Tudo o que testou funcionou.
**O que testou e não funcionou – O que deve ser corrigido:** Nenhum erro. O visual está genérico e precisa de refinamento.
**Funcionalidade não testada (faltou ou não foi implementada):** Não informado

**Nome:** Marília
**Data do teste:** 12/11/2026
**O que testou e funcionou:** Tudo o que testou funcionou.
**O que testou e não funcionou – O que deve ser corrigido:** Nenhum erro encontrado.
**Funcionalidade não testada (faltou ou não foi implementada):** Não informado

**Nome:** Rafael
**Data do teste:** 12/11/2026
**O que testou e funcionou:** Tudo funcionou.
**O que testou e não funcionou – O que deve ser corrigido:** Falta um minicarrinho para conferir itens e valor antes de pagar sem trocar de tela (referência: iFood).
**Funcionalidade não testada (faltou ou não foi implementada):** Minicarrinho: não existe na versão testada.

**Nome:** João
**Data do teste:** 12/11/2026
**O que testou e funcionou:** Não informado
**O que testou e não funcionou – O que deve ser corrigido:** A compra exige login/cadastro antes do checkout. Sugere checkout como o da VTEX, em que o cliente se identifica pelo e-mail no próprio checkout.
**Funcionalidade não testada (faltou ou não foi implementada):** Compra sem cadastro prévio: não existe na versão testada.

## Laudo de qualidade

Resumo (laudo completo em `docs/situacao-3-validacao/05-laudo-de-qualidade.md`):

- **Verificação:** 63/63 testes automatizados aprovados (36 unitários, 27 de integração), TypeScript, ESLint e build sem erros.
- **Validação com usuários (12/11/2026):** 5 testadores, **nenhum defeito funcional relatado**; 4 apontamentos de melhoria.
- **Incorporados:** cotação de frete por CEP com zonas de entrega (Lucas, commit `f24f3a8`), minicarrinho (Rafael, `f24f3a8`) e refino visual da vitrine (Mariele, `b84f362`).
- **Justificado:** login obrigatório (João). O login só é pedido ao finalizar e é o que permite acompanhar, pagar o PIX depois e cancelar o pedido; o checkout só com e-mail foi para o backlog (US40).
- **Melhorias extras da revisão Kaizen:** vitrine sem esgotados, kits em destaque e endereço pelo CEP.
- **Parecer:** a versão v2 atende aos requisitos; as pendências (gateway real, PIX automático, US38, US40) não impedem o uso.

Evidências: telas antes/depois em `docs/situacao-1-planejamento/img/` e no vídeo de melhorias.

## Vídeo da solução atualizada

**Link para o vídeo:** https://youtu.be/-mynRHBNAGU (até 5 min; roteiro: `docs/situacao-3-validacao/06-roteiro-video-melhorias.md`)

---

### Checklist do que falta (somente você pode fazer)

- [x] Criar o repositório público no GitHub pessoal e fazer o push
- [x] Publicar na Vercel + Neon e testar o link em aba anônima
- [x] Gravar o vídeo narrado (≥ 5 min) e publicar (YouTube não listado ou Drive)
- [x] Enviar a ficha de teste para 5 colegas (Slack/WhatsApp)
- [x] Preencher as 5 fichas, corrigir o que for pertinente e atualizar o laudo
- [x] Fazer o merge da `v2-melhorias` na `main` e publicar a v2
- [x] Gravar o vídeo das melhorias (≤ 5 min)
- [x] Preencher o `.docx` com os links
- [ ] Entregar o PDF no AVA
