import { z } from 'zod';

const environment = z.object({
  MONGO_URI: z.string().regex(/^mongodb(?:\+srv)?:\/\/\S+$/),
  JWT_SECRET: z.string().refine(value => Buffer.byteLength(value) >= 32),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
});

export function loadConfig(env: NodeJS.ProcessEnv = process.env) {
  const result = environment.safeParse(env);
  if (!result.success) {
    const fields = result.error.issues.map(issue => issue.path.join('.'));
    throw new Error(`Invalid configuration: ${[...new Set(fields)].join(', ')}`);
  }
  return result.data;
}

export type Config = ReturnType<typeof loadConfig>;
