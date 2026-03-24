import { loadEnvConfig } from '@next/env';
import { defineConfig } from 'drizzle-kit';

loadEnvConfig(process.cwd());

// Workflow de migrations:
//
// 1. Altere src/lib/db/schema.ts
// 2. Gere o SQL:  npm run db:generate
//    → cria arquivo em src/lib/db/migrations/
// 3. Copie o SQL gerado para supabase/migrations/<timestamp>_<nome>.sql
//    (use o timestamp do momento, ex: 20260325000000)
// 4. Aplique em produção via Supabase MCP (apply_migration) ou CLI (supabase db push)
// 5. Para dev local: npm run supabase:reset  (recria a partir de supabase/migrations/)
//
// DATABASE_URL_MIGRATE (session pooler / direct) é necessário para o Supabase hospedado.
// O transaction pooler (porta 6543) pode causar "Tenant or user not found".
const url = process.env.DATABASE_URL_MIGRATE || process.env.DATABASE_URL;

if (!url) {
  throw new Error('DATABASE_URL or DATABASE_URL_MIGRATE must be set');
}

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: { url },
});
