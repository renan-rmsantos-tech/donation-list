# Church Donations Platform

Plataforma transparente de doações para igrejas, construída com Next.js 15, Drizzle ORM e Supabase.

## Pré-requisitos

- **Node.js** 18+ 
- **npm** ou **pnpm**
- **Docker** (para Supabase local)
- **Conta no [Supabase](https://supabase.com)** (para produção)
- **Conta no [Vercel](https://vercel.com)** (para deploy)

---

## Rodando localmente

### 1. Clonar e instalar dependências

```bash
git clone <url-do-repositorio>
cd donation-list
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite o `.env.local` e ajuste os valores:

| Variável | Descrição | Local (padrão) |
|----------|-----------|----------------|
| `DATABASE_URL` | URL do PostgreSQL | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do Supabase | `http://127.0.0.1:54321` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima | (valor do .env.example) |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service role | (valor do .env.example) |
| `ADMIN_USERNAME` | Usuário do admin | `admin` |
| `ADMIN_PASSWORD` | Senha do admin | `admin123` |
| `SESSION_PASSWORD` | Chave para sessão (32+ caracteres) | **Altere em produção** |

> Os valores padrão do `.env.example` funcionam com o Supabase local. O `SESSION_PASSWORD` deve ter **pelo menos 32 caracteres**.

### 3. Subir o Supabase local

```bash
npm run supabase:start
```

Isso inicia PostgreSQL, Storage, Auth e Studio. Aguarde até aparecer "Started supabase local development setup."

### 4. Rodar as migrações

```bash
npm run db:generate   # Gera migrações (se houver alterações no schema)
npm run db:migrate    # Aplica migrações no banco
```

> Se o banco estiver vazio e precisar popular com dados iniciais: `npx supabase db reset` (aplica seed.sql).

### 5. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse:

- **App**: http://localhost:3000
- **Admin**: http://localhost:3000/admin
- **Supabase Studio**: http://127.0.0.1:54323

### Comandos úteis

```bash
npm run test           # Rodar testes
npm run test:watch     # Testes em modo watch
npm run test:coverage  # Cobertura de testes
npm run db:studio      # Interface visual do Drizzle
npm run supabase:stop  # Parar Supabase local
```

---

## Deploy no Vercel + Supabase

### 1. Configurar o Supabase (produção)

1. Crie um projeto em [supabase.com](https://supabase.com/dashboard)
2. Em **Settings → Database**, copie a **Connection string** (modo **Transaction** ou **Session**)
3. Use a porta **6543** (connection pooler) para serverless:
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
4. Em **Settings → API**, copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Aplicar migrações no Supabase

Com `DATABASE_URL` apontando para o projeto Supabase de produção:

```bash
# Configure temporariamente no .env.local a URL de produção
npm run db:migrate
```

Ou use o SQL Editor no Supabase Dashboard para rodar as migrações manualmente (arquivos em `src/lib/db/migrations/`).

### 3. Configurar Storage no Supabase

No Supabase Dashboard → **Storage**:

1. Crie o bucket `receipts` (privado)
2. Crie o bucket `pix-qr` (público)
3. Configure as políticas de acesso conforme o `supabase/seed.sql`

### 4. Deploy no Vercel

1. Conecte o repositório ao [Vercel](https://vercel.com)
2. Em **Settings → Environment Variables**, adicione:

| Variável | Valor | Ambiente |
|----------|-------|----------|
| `DATABASE_URL` | Connection string (porta 6543) | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima do projeto | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service_role | Production, Preview |
| `ADMIN_USERNAME` | Usuário do admin | Production |
| `ADMIN_PASSWORD` | Senha forte do admin | Production |
| `SESSION_PASSWORD` | String aleatória 32+ caracteres | Production |

3. Faça o deploy:

```bash
vercel
```

Ou via Git: push para a branch principal e o Vercel fará o deploy automático.

### 5. Pós-deploy

- Acesse `/admin` e faça login com `ADMIN_USERNAME` e `ADMIN_PASSWORD`
- Configure o PIX em **Admin → PIX** (QR Code e Copia e Cola)
- Cadastre categorias e produtos

---

## Estrutura do projeto

```
src/
├── app/
│   ├── (public)/     # Catálogo público
│   └── admin/        # Painel administrativo
├── features/
│   ├── donations/    # Fluxos de doação
│   ├── products/     # Produtos
│   ├── categories/   # Categorias
│   ├── pix/          # Configuração PIX
│   └── dashboard/    # Estatísticas
├── lib/
│   ├── db/           # Drizzle + schema
│   ├── auth/         # iron-session
│   └── storage/      # Supabase Storage
└── middleware.ts     # Proteção de rotas
```

---

## Troubleshooting

### Erro de conexão com o banco

- Confirme que o Docker está rodando
- Verifique `npm run supabase:start`
- Valide `DATABASE_URL` no `.env.local`

### "Tenant or user not found" ao rodar migrações

Ao usar **Supabase hospedado** com `DATABASE_URL` apontando para o pooler em modo transação (porta 6543), migrações podem falhar. Soluções:

1. **Defina `DATABASE_URL_MIGRATE`** no `.env.local` com a URL do **Session pooler** (porta 5432). Se já usa o pooler na porta 6543, basta criar uma cópia trocando a porta para 5432.
2. **Projeto pausado?** Projetos no free tier pausam após inatividade. Acesse o dashboard e clique em "Restore project".
3. **Desenvolvimento local:** use `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres` e rode `npm run supabase:start` antes das migrações.

### Migrações falhando

- Revise o SQL em `src/lib/db/migrations/`
- Reset local: `npx supabase db reset`
- Em produção, use o SQL Editor do Supabase se necessário

### Login admin não funciona

- `SESSION_PASSWORD` deve ter 32+ caracteres
- Confira `ADMIN_USERNAME` e `ADMIN_PASSWORD` nas variáveis de ambiente
- Limpe cookies do navegador e tente novamente

### Upload de arquivos falha (PIX, comprovantes)

- **Buckets**: Crie manualmente no Supabase Dashboard → Storage:
  - `receipts` (privado)
  - `pix-qr` (público)
- **RLS "new row violates row-level security policy"**: Rode o SQL em `supabase/storage-rls-fix.sql` no SQL Editor do Supabase
- **Local**: Rode `npx supabase db reset` para aplicar o `supabase/seed.sql` que cria os buckets
- **Variáveis**: Confirme `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no `.env.local` ou Vercel
- **Projeto pausado**: Projetos Supabase no free tier pausam após inatividade — restaure no dashboard

---

## Licença

Projeto privado.
