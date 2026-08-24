import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  JWT_SECRET: z.string().min(1, 'JWT_SECRET e obrigatorio no arquivo .env'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL e obrigatorio no arquivo .env'),
  PORT: z.coerce.number().int().positive().default(4000),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  console.error(`\nVariaveis de ambiente invalidas:\n${issues}\n\nCopie o .env.example para .env e preencha os valores.\n`);
  process.exit(1);
}

export const env = parsed.data;

/**
 * Lista de origens liberadas no CORS. Sem CORS_ORIGIN definido, libera todas
 * as origens (util em desenvolvimento).
 */
export const corsOrigins = env.CORS_ORIGIN
  ? env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : true;
