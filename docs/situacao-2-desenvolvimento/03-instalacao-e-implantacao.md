# Instalação local e implantação

## Rodar localmente

Pré-requisito: **Node.js 20.9+** (recomendado 22). Não é preciso instalar banco de dados.

```bash
npm install
npm run dev
```

Acesse http://localhost:3000. O comando `dev` aplica as migrações e o seed no PostgreSQL embarcado (pasta `.data/`) antes de iniciar.

| Script | Função |
|---|---|
| `npm run dev` | Prepara o banco e sobe o servidor de desenvolvimento |
| `npm test` | Roda os testes unitários e de integração (Vitest) |
| `npm run typecheck` | Verificação de tipos TypeScript |
| `npm run lint` | ESLint |
| `npm run build` / `npm start` | Build e servidor de produção |
| `npm run db:setup` | Aplica migrações + seed (idempotente) |
| `npm run db:reset` | Apaga o banco local e recria do zero |
| `npm run db:generate` | Gera nova migração após mudar `src/models/db/schema.ts` |

## Variáveis de ambiente

| Variável | Obrigatória em produção | Descrição |
|---|---|---|
| `DATABASE_URL` | sim | String de conexão PostgreSQL (ex.: `postgresql://usuario:senha@host/db?sslmode=require`). Sem ela o app usa o PGlite local |
| `SESSION_SECRET` | sim | Segredo para assinar a sessão (mínimo 32 caracteres aleatórios) |
| `ADMIN_NOME`, `ADMIN_EMAIL`, `ADMIN_SENHA` | recomendado | Cria (ou atualiza) um administrador pessoal ao rodar `npm run db:setup`. Assim você não depende da conta de demonstração, cuja senha está publicada no README |

Localmente, coloque essas variáveis em `.env.local` na raiz. Esse arquivo está no `.gitignore` e nunca vai para o GitHub. O `npm run db:setup` lê o arquivo automaticamente.

Gerar um segredo:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Implantação sugerida: Vercel + Neon (gratuitos)

1. **Banco:** crie um projeto em [neon.tech](https://neon.tech) e copie a *connection string* (com `sslmode=require`).
2. **Migrações e seed no banco de produção** (na sua máquina):
   ```bash
   DATABASE_URL="postgresql://..." ADMIN_EMAIL="voce@exemplo.com" ADMIN_SENHA="SuaSenha123" npm run db:setup
   ```
   No PowerShell: `$env:DATABASE_URL="postgresql://..."; npm run db:setup`
3. **Aplicação:** em [vercel.com](https://vercel.com) importe o repositório do GitHub, configure `DATABASE_URL` e `SESSION_SECRET` em *Settings → Environment Variables* e faça o deploy. O comando de build padrão (`next build`) já serve.
4. Acesse a URL gerada (ex.: `https://doce-nuvem.vercel.app`) e preencha o campo "Link da solução em funcionamento" no documento de entrega.

> Alternativas equivalentes: Render (web service + PostgreSQL) ou Railway. Qualquer provedor com Node.js 20+ e PostgreSQL funciona.

## Checklist antes de enviar aos testadores

- [ ] `npm test`, `npm run typecheck` e `npm run lint` sem erros
- [ ] Deploy acessível em aba anônima
- [ ] Login com as contas de teste funcionando no ambiente publicado
- [ ] Compra com PIX e com cartão concluídas no ambiente publicado
- [ ] Link do formulário de teste pronto (`docs/situacao-3-validacao/03-formulario-teste-usuarios.md`)
