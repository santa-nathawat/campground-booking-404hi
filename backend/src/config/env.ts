import { z } from 'zod';

const frontendOrigin = z.string().refine(value => {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol)
      && !url.hostname.includes('*') && url.origin === value;
  } catch {
    return false;
  }
});

const environment = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  FRONTEND_ORIGIN: frontendOrigin.optional(),
  MONGO_URI: z.string().regex(/^mongodb(?:\+srv)?:\/\/\S+$/),
  JWT_SECRET: z.string().refine(value => Buffer.byteLength(value) >= 32),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
}).superRefine((config, context) => {
  if (config.NODE_ENV === 'production' && !config.FRONTEND_ORIGIN?.startsWith('https://')) {
    context.addIssue({ code: 'custom', path: ['FRONTEND_ORIGIN'], message: 'Production requires an HTTPS frontend origin' });
  }
}).transform(config => ({
  ...config,
  FRONTEND_ORIGIN: config.FRONTEND_ORIGIN ?? 'http://localhost:3000',
}));

export function loadConfig(env: NodeJS.ProcessEnv = process.env) {
  const result = environment.safeParse(env);
  if (!result.success) {
    const fields = result.error.issues.map(issue => issue.path.join('.'));
    throw new Error(`Invalid configuration: ${[...new Set(fields)].join(', ')}`);
  }
  return result.data;
}

export type Config = ReturnType<typeof loadConfig>;
