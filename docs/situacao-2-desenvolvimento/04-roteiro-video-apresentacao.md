# Roteiro do vídeo de apresentação (Situação 2)

> Exigência: vídeo **narrado**, com **no mínimo 5 minutos**, mostrando a solução em funcionamento. Meta: 6–7 minutos.
> Gravação: OBS Studio ou Loom, tela em 1080p, microfone próximo. Antes de gravar, rode `npm run db:reset` (ou use o ambiente publicado) para começar com dados limpos.

| Tempo | Cena | O que mostrar | Fala sugerida (adapte com suas palavras) |
|---|---|---|---|
| 0:00–0:30 | Abertura | Slide ou README no GitHub | "Sou Guilherme Dalla Rosa e este é o CruzCake, a loja virtual de cupcakes que planejei no PIT I e desenvolvi no PIT II." |
| 0:30–1:15 | Contexto e decisões | `docs/situacao-1-planejamento/01-escopo-e-revisao.md` | O problema da cliente (app anterior que falhou), as decisões: web responsiva em vez de app nativo, Next.js + PostgreSQL, MVC |
| 1:15–2:30 | Vitrine e carrinho (celular) | DevTools em modo celular: vitrine, filtro "Caixas e kits", busca, produto com cotação de frete (CEP 08010-000 e 20040-002), adicionar com minicarrinho, carrinho | Mostrar o minicarrinho, o frete por zona, estoque baixo, cupom `NATAL2025` vencido e depois `BEMVINDO10` aplicado |
| 2:30–4:00 | Checkout | Login com redirecionamento, CEP 01310-100 preenchendo a rua, cartão recusado (`4000 0000 0002 0000`) e depois aprovado | Explicar que o preço é recalculado no servidor e que a recusa não cria pedido nem baixa estoque |
| 4:00–4:45 | Pós-venda | Página do pedido, linha do tempo, novo pedido com PIX, "Simular pagamento", "Meus pedidos", cancelamento | Regra: cancelar só antes do preparo |
| 4:45–5:45 | Administração | Painel, pedidos filtrados, avançar status (mostrar que só aparecem etapas válidas), cadastrar produto com erro de validação, zonas de frete (criar zona e ver valer na cotação) | Máquina de estados do pedido |
| 5:45–6:30 | Por dentro do código | VS Code: pastas `models/`, `controllers/`, `app/`; diagrama MVC; rodar `npm test` (62 testes passando) | Como o MVC foi organizado e o que os testes cobrem |
| 6:30–7:00 | Encerramento | Repositório no GitHub (docs por situação) | Próximos passos: testes com 5 colegas e melhorias |

**Dicas:** feche notificações; aumente o zoom do navegador para 125%; tenha os dados de teste à mão (`02-manual-de-uso.md`); grave em blocos e junte depois, se preferir.

Link do vídeo: `[preencher após publicar, YouTube não listado ou Google Drive]`
