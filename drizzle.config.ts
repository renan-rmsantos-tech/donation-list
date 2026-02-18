import { loadEnvConfig } from '@next/env';
import { defineConfig } from 'drizzle-kit';

loadEnvConfig(process.cwd());

// Migrations: use DATABASE_URL_MIGRATE (Session pooler/direct) when connecting to
// hosted Supabase. Transaction pooler (port 6543) can cause "Tenant or user not found".
// For local dev, DATABASE_URL (127.0.0.1:54322) works for both.
const url =
  process.env.DATABASE_URL_MIGRATE || process.env.DATABASE_URL;

if (!url) {
  throw new Error('DATABASE_URL or DATABASE_URL_MIGRATE must be set');
}

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: { url },
});
