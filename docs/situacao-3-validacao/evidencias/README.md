# Evidências de Teste

Pasta para os prints (snapshots) que comprovam a execução dos testes e as correções.

## Padrão de nomes

| Origem | Padrão | Exemplo |
|---|---|---|
| Caso de teste manual | `CT-xx_descricao.png` | `CT-02_pedido-1-pago.png` |
| Testador (print enviado pelo formulário) | `TESTADOR-n_xx.png` | `TESTADOR-3_02.png` |
| Correção (antes/depois) | `D-xx_antes.png` / `D-xx_depois.png` | `D-01_depois.png` |
| Testes automatizados | `TESTES-AUTOMATIZADOS_saida.png` | saída do `npm test` |

## Regras

- Use números com dois dígitos (`01`, `02`…) para manter a ordem.
- Descrição em minúsculas, sem acentos, separada por hífen.
- Não inclua dados pessoais reais dos testadores (e-mail, telefone, endereço) nos prints. Use as contas e os endereços de teste.
- Cada evidência deve ser referenciada no caso de teste, na ficha do testador ou no [laudo de qualidade](../05-laudo-de-qualidade.md).
