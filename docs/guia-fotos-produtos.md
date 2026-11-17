# Guia para gerar as fotos dos produtos

As ilustrações atuais (`public/img/cupcakes/*.svg`) funcionam, mas fotos realistas deixam a vitrine mais convincente. Opções gratuitas:

| Ferramenta | Observação |
|---|---|
| **Google Gemini** (modelo de imagem "Nano Banana") | Boa qualidade em fotos de comida e consistência entre imagens. Melhor opção |
| Microsoft Designer / Bing Image Creator | Gratuito com conta Microsoft |
| Unsplash / Pexels | Fotos reais com licença livre (não ficam padronizadas entre si) |

## Padrão para todas as fotos

- Formato **quadrado 1:1**, exportar em **800×800**, preferencialmente `.webp` ou `.jpg`
- Mesmo fundo, luz e ângulo em todas (a vitrine fica uniforme)
- Salvar em `public/img/cupcakes/` com o nome indicado abaixo
- Depois, no **Painel → Produtos → Editar**, escolher a nova imagem (o seletor já aceita `.jpg`, `.png` e `.webp`)

### Prompt base (cole e troque só o trecho entre colchetes)

> Fotografia de produto profissional, quadrada, de um único cupcake gourmet **[DESCRIÇÃO]**, centralizado, em forminha de papel azul-marinho, sobre fundo liso creme claro, luz natural suave vinda da esquerda, leve sombra, ângulo de 30 graus, foco nítido, estilo e-commerce minimalista, sem texto, sem mãos, sem outros objetos.

| Arquivo | Produto | [DESCRIÇÃO] |
|---|---|---|
| `baunilha.jpg` | Baunilha com Chantilly | massa de baunilha dourada com cobertura alta de chantilly branco e uma cereja |
| `chocolate.jpg` | Chocolate Belga | massa de cacau escura com ganache brilhante de chocolate meio amargo e raspas de chocolate |
| `red-velvet.jpg` | Red Velvet | massa vermelha aveludada com frosting branco de cream cheese e farelos vermelhos por cima |
| `cenoura.jpg` | Cenoura com Brigadeiro | massa laranja de cenoura com cobertura de brigadeiro e granulado de chocolate |
| `pistache.jpg` | Pistache Siciliano | massa verde-clara com creme de pistache e pistaches picados por cima |
| `limao.jpg` | Limão Siciliano com Merengue | massa amarela com merengue italiano maçaricado e raspas de limão |
| `frutas-vermelhas.jpg` | Frutas Vermelhas | massa branca com buttercream rosado, morango e framboesas frescas por cima |
| `doce-de-leite.jpg` | Doce de Leite com Flor de Sal | cobertura de doce de leite em espiral com cristais de flor de sal |
| `vegano.jpg` | Chocolate Vegano | massa de chocolate escura com ganache de chocolate 70% e uma folha de hortelã |
| `maracuja.jpg` | Coco e Maracujá | cobertura de coco queimado com calda de maracujá e sementes |
| `cafe.jpg` | Café com Avelã | cobertura de creme de café com avelãs tostadas picadas |

### Kits (prompt diferente: precisam mostrar o conteúdo)

> Fotografia de produto profissional, quadrada, vista de cima levemente inclinada, de uma **[DESCRIÇÃO]** aberta, sobre fundo liso creme claro, luz natural suave, estilo e-commerce minimalista, sem texto, sem mãos.

| Arquivo | Produto | [DESCRIÇÃO] |
|---|---|---|
| `caixa.jpg` | Caixa Degustação (6 unidades) | caixa de presente azul-marinho com laço laranja contendo 6 cupcakes de sabores e cores diferentes, organizados em 2 fileiras de 3 |
| `kit-festa.jpg` | Kit Festa (12 minis) | caixa azul-marinho contendo 12 mini cupcakes coloridos com pequenas bandeirinhas de festa, organizados em 3 fileiras de 4 |

> Dica: gere primeiro o Chocolate Belga, aprove o estilo e peça os demais com "mesmo estilo, fundo e iluminação da imagem anterior". Assim todas ficam padronizadas.
