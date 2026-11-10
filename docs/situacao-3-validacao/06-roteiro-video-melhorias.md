# Roteiro — Vídeo da Solução Atualizada (até 5 minutos)

Vídeo exigido na Situação 3: apresentar as modificações feitas no sistema **depois** do feedback dos testadores. Ele é diferente do vídeo narrado da Situação 2, que apresenta a solução completa e dura no mínimo 5 minutos.

## Estrutura sugerida

| Tempo | Bloco | O que mostrar / falar |
|---|---|---|
| 0:00 – 0:20 | Abertura | Nome, RGM, projeto ("Doce Nuvem Cupcakes, PIT II, Situação 3"). Objetivo do vídeo: mostrar o que mudou após os testes com usuários. |
| 0:20 – 0:50 | Como foi o teste | Mostrar rapidamente o formulário e a planilha de respostas: 5 testadores, perfis e quantidade de apontamentos. Citar a classificação por gravidade. |
| 0:50 – 3:30 | Correções e melhorias (3 a 5 itens) | Para cada item: **(1)** o que o testador relatou, mostrando o print "antes"; **(2)** o que foi alterado, mostrando o trecho de código ou o commit no GitHub; **(3)** demonstração ao vivo no app funcionando, "depois". |
| | Item 1 | [preencher: D-01 — …] |
| | Item 2 | [preencher: D-02 — …] |
| | Item 3 | [preencher: M-01 — …] |
| | Item 4 (opcional) | [preencher] |
| 3:30 – 4:10 | Garantia de qualidade | Rodar `npm test` no terminal e mostrar todos os testes passando, incluindo os novos testes criados para os defeitos corrigidos. |
| 4:10 – 4:40 | Pendências | Citar honestamente o que não foi corrigido e por quê (seção 6 do laudo). |
| 4:40 – 5:00 | Encerramento | Mostrar a estrutura de pastas no GitHub (docs/situacao-1, 2, 3, código e testes) e agradecer aos testadores. |

## Checklist antes de gravar

- [ ] Banco com dados de demonstração (`npm run db:reset` localmente ou dados preparados no ambiente publicado)
- [ ] Abas abertas: app (cliente), app (admin, em janela anônima), GitHub (commits das correções), laudo e terminal
- [ ] Prints "antes" separados em uma pasta para mostrar rapidamente
- [ ] Zoom do navegador em 110–125% para a gravação ficar legível
- [ ] Notificações do sistema desativadas (modo "Não perturbe")
- [ ] Roteiro ensaiado uma vez com cronômetro (limite: **5 minutos**)

## Dicas de gravação

**OBS Studio** (gratuito):
1. Crie uma *Cena* com a fonte "Captura de tela" e, opcionalmente, "Dispositivo de captura de vídeo" (webcam) em um canto.
2. Em *Configurações → Saída*, grave em MP4, 1920×1080, 30 fps.
3. Em *Áudio*, confira o microfone no medidor (o volume deve ficar no amarelo, não no vermelho).
4. Use *Iniciar gravação* e faça cortes simples depois (Clipchamp/Shotcut) se precisar.

**Loom** (mais simples):
1. Instale a extensão ou o app, escolha "Tela + câmera".
2. Grave e copie o link compartilhável. O plano gratuito limita a duração do vídeo; confira se cabe nos 5 minutos.

**Publicação:** suba no YouTube como **Não listado** (ou Google Drive com o link público) e cole o link no template da entrega e no README do repositório.
