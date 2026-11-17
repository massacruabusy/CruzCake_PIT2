# Roteiro — Vídeo da Solução Atualizada (até 5 minutos)

Vídeo exigido na Situação 3: apresentar as modificações feitas no sistema **depois** do feedback dos testadores. Ele é diferente do vídeo narrado da Situação 2, que apresenta a solução completa e dura no mínimo 5 minutos.

**Preparação:** duas abas lado a lado ou alternadas:
- **Antes (v1):** a versão que os testadores usaram, tag `v1-antes-dos-testes`. Antes do merge é a produção atual (https://cruz-cake-pit-2.vercel.app). Depois do merge, rode localmente com `git checkout v1-antes-dos-testes`.
- **Depois (v2):** branch `v2-melhorias`, local (`npm run dev`) ou já publicada.

## Roteiro

| Tempo | Bloco | O que mostrar | Fala sugerida (adapte) |
|---|---|---|---|
| 0:00 – 0:20 | Abertura | README no GitHub | "Sou Guilherme Dalla Rosa, este é o CruzCake, PIT II, Situação 3. Vou mostrar o que mudou depois dos testes com usuários." |
| 0:20 – 0:45 | Como foi o teste | Fichas (`04-fichas-dos-testadores.md`) | "Cinco colegas de e-commerce testaram a v1 em 12/11 pelo Slack e WhatsApp. Ninguém achou bug; vieram quatro sugestões: três incorporei e uma justifiquei." |
| 0:45 – 1:50 | **Lucas: onde entrega?** | **Antes:** página do produto e carrinho sem nenhuma informação de entrega. **Depois:** na página da Caixa Degustação, digitar `08010-000` → endereço + "Entregamos! Zona Leste, até 3h, R$ 14,90"; digitar `20040-002` → "Ainda não entregamos… retire na loja". Mostrar rapidamente o admin **Frete** com as zonas | "O Lucas perguntou como comprar sem saber para onde entrega. Agora o visitante consulta pelo CEP, sem login, e a loja define as zonas no painel." |
| 1:50 – 2:35 | **Rafael: minicart** | **Antes:** "Adicionar" só mostra um aviso; para conferir é preciso ir ao carrinho. **Depois:** "Adicionar" abre o minicarrinho; ajustar quantidade, ver subtotal, fechar com Esc | "O Rafael comparou com o iFood: queria ver o carrinho sem trocar de tela." |
| 2:35 – 3:25 | **Mariele: visual** | **Antes:** vitrine v1. **Depois:** novo topo com a marca, diferenciais, "Para presentear", cards e rodapé, no desktop e no celular | "A Mariele achou o visual genérico; refinei a vitrine para ter cara de loja." |
| 3:25 – 3:55 | **João: login** | Fluxo: montar carrinho sem conta → Finalizar → entrar → volta direto ao checkout | "O João sugeriu checkout sem login, como na VTEX. Mantive o login só no fim da compra porque é ele que permite acompanhar, pagar o PIX depois e cancelar; a ideia ficou no backlog." |
| 3:55 – 4:25 | Evoluções extras | Vitrine sem o sabor esgotado; card do kit com a arte da caixa | "Aproveitei a revisão para tirar os esgotados da vitrine e destacar os kits." |
| 4:25 – 4:50 | Qualidade | Terminal: `npm test` (63 testes passando) | "Todas as mudanças estão cobertas por testes automatizados." |
| 4:50 – 5:00 | Encerramento | Branch/commits no GitHub | "Obrigado aos testadores!" |

## Checklist antes de gravar

- [ ] Banco com dados de demonstração (`npm run db:reset` localmente, com o servidor parado)
- [ ] Abas abertas: v1, v2 (cliente), v2 (admin em janela anônima), GitHub, fichas e terminal
- [ ] Zoom do navegador em 110–125% para a gravação ficar legível
- [ ] Notificações do sistema desativadas (modo "Não perturbe")
- [ ] Roteiro ensaiado uma vez com cronômetro (limite: **5 minutos**)

## Dicas de gravação

**OBS Studio** (gratuito):
1. Crie uma *Cena* com a fonte "Captura de tela" e, opcionalmente, "Dispositivo de captura de vídeo" (webcam) em um canto.
2. Em *Configurações → Saída*, grave em MP4, 1920×1080, 30 fps.
3. Em *Áudio*, confira o microfone no medidor (o volume deve ficar no amarelo, não no vermelho).
4. Use *Iniciar gravação* e faça cortes simples depois (Clipchamp/Shotcut) se precisar.

**Loom** (mais simples): instale, escolha "Tela + câmera", grave e copie o link. Confira se o plano gratuito comporta 5 minutos.

**Publicação:** suba no YouTube como **Não listado** (ou Google Drive com o link público) e cole o link no template da entrega e no README do repositório.
