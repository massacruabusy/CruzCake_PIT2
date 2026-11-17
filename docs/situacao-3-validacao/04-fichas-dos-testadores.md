# Fichas dos Testadores

Respostas dos 5 colegas que testaram a **v1** publicada (https://cruz-cake-pit-2.vercel.app, tag `v1-antes-dos-testes`). A ficha foi enviada por Slack/WhatsApp ([mensagem](07-mensagem-para-testadores.md)) e devolvida na própria conversa. Os campos em negrito são os do template oficial da atividade.

O **relato original** de cada testador está transcrito literalmente. Os campos da ficha organizam esse relato sem acrescentar fatos: o que o testador não informou aparece como "não informado". Comentários do desenvolvedor ficam só em "Ação tomada".

**Gravidade:** Bloqueante · Alta · Média · Baixa · Sugestão
**Ação tomada:** Corrigido · Melhoria incorporada · Não pertinente (justificar) · Pendente (justificar)

---

## Ficha 1: Lucas

> **Relato original:** "cara, como vou comprar cupcake sem saber p onde entrega? n faz sentido"

| Campo | Resposta |
|---|---|
| **Nome** | Lucas |
| **Papel assumido** | Visitante (avaliou a decisão de compra) |
| **Data do teste** | 12/11/2026 |
| **O que testou e funcionou** | Não informado |
| **O que testou e não funcionou – O que deve ser corrigido** | Não há como saber se a loja entrega no endereço dele antes de comprar. Deve ser possível consultar a área de entrega antes da compra. |
| **Funcionalidade não testada (faltou ou não foi implementada)** | Consulta de entrega por endereço/CEP: não existe na versão testada. |

| # | Apontamento | Gravidade | Evidência | Ação tomada | Commit da correção |
|---|---|---|---|---|---|
| 1.1 | Não informa onde a loja entrega antes da compra | Alta | Relato | **Melhoria incorporada**: cotação de frete por CEP na página do produto e no carrinho, sem login, com prazo, valor e endereço; zonas de entrega configuráveis pela loja; checkout recusa CEP fora da área e sugere retirada (US33, US34) | `f24f3a8` |

---

## Ficha 2: Mariele

> **Relato original:** "testei aqui tudo ta funcionando perfeito mas ta bem generico, né? eu daria uma refinada no visual"

| Campo | Resposta |
|---|---|
| **Nome** | Mariele |
| **Papel assumido** | Não informado |
| **Data do teste** | 12/11/2026 |
| **O que testou e funcionou** | Tudo o que testou funcionou. |
| **O que testou e não funcionou – O que deve ser corrigido** | Nenhum erro. O visual está genérico e precisa de refinamento. |
| **Funcionalidade não testada (faltou ou não foi implementada)** | Não informado |

| # | Apontamento | Gravidade | Evidência | Ação tomada | Commit da correção |
|---|---|---|---|---|---|
| 2.1 | Visual genérico, pede refinamento | Sugestão | Relato | **Melhoria incorporada**: refino visual da vitrine, com destaque da marca no topo, faixa de diferenciais, vitrine de presentes, cards de produto e rodapé redesenhados (US39) | [commit] |

---

## Ficha 3: Marília

> **Relato original:** "tudo funcionou, nada bugou."

| Campo | Resposta |
|---|---|
| **Nome** | Marília |
| **Papel assumido** | Não informado |
| **Data do teste** | 12/11/2026 |
| **O que testou e funcionou** | Tudo o que testou funcionou. |
| **O que testou e não funcionou – O que deve ser corrigido** | Nenhum erro encontrado. |
| **Funcionalidade não testada (faltou ou não foi implementada)** | Não informado |

| # | Apontamento | Gravidade | Evidência | Ação tomada | Commit da correção |
|---|---|---|---|---|---|
| 3.1 | Sem apontamentos | — | Relato | Nenhuma ação necessária | — |

---

## Ficha 4: Rafael

> **Relato original:** "achei bem legal tudo funciona, só poderia ter um minicart né pra eu conferir antes de pagar. No ifood consigo acompanhar o valor q ta meu carrinho sem trocar de tela"

| Campo | Resposta |
|---|---|
| **Nome** | Rafael |
| **Papel assumido** | Cliente (montou o carrinho para pagar) |
| **Data do teste** | 12/11/2026 |
| **O que testou e funcionou** | Tudo funcionou. |
| **O que testou e não funcionou – O que deve ser corrigido** | Falta um minicarrinho para conferir itens e valor antes de pagar sem trocar de tela (referência: iFood). |
| **Funcionalidade não testada (faltou ou não foi implementada)** | Minicarrinho: não existe na versão testada. |

| # | Apontamento | Gravidade | Evidência | Ação tomada | Commit da correção |
|---|---|---|---|---|---|
| 4.1 | Falta minicarrinho para acompanhar o carrinho sem trocar de tela | Média | Relato | **Melhoria incorporada**: minicarrinho em gaveta lateral, aberto pelo ícone e ao adicionar um produto, com ajuste de quantidade e subtotal (US37) | `f24f3a8` |

---

## Ficha 5: João

> **Relato original:** "acho ruim precisa fazer login pra comprar? n da pra ter um chekout tipo vtex?"

| Campo | Resposta |
|---|---|
| **Nome** | João |
| **Papel assumido** | Cliente (tentou comprar) |
| **Data do teste** | 12/11/2026 |
| **O que testou e funcionou** | Não informado |
| **O que testou e não funcionou – O que deve ser corrigido** | A compra exige login/cadastro antes do checkout. Sugere checkout como o da VTEX, em que o cliente se identifica pelo e-mail no próprio checkout. |
| **Funcionalidade não testada (faltou ou não foi implementada)** | Compra sem cadastro prévio: não existe na versão testada. |

| # | Apontamento | Gravidade | Evidência | Ação tomada | Commit da correção |
|---|---|---|---|---|---|
| 5.1 | Login obrigatório antes de comprar | Média | Relato | **Não pertinente nesta versão (justificado)**: o login só é pedido ao finalizar (navegar, cotar frete e montar o carrinho não exigem conta) e, após entrar ou se cadastrar, o cliente volta direto ao checkout. A conta é o que permite acompanhar o status, pagar o PIX depois e cancelar o pedido, recursos centrais para a loja. Checkout com identificação só por e-mail foi registrado no backlog (US40) | — |

---

## Pontos não citados pelos testadores

As melhorias abaixo também estão na v2, mas **nenhum testador as mencionou**. Elas vêm da revisão Kaizen e não de feedback: vitrine sem produtos esgotados (US35), kits com arte que mostra o conteúdo e selo (US36) e endereço preenchido pelo CEP (ViaCEP/BrasilAPI).
