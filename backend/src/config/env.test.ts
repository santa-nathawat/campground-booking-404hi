import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';
import { loadConfig } from './env.js';

const valid = { MONGO_URI: 'mongodb://127.0.0.1:27017/test', JWT_SECRET: 'x'.repeat(32) };

describe('startup configuration', () => {
  it('accepts MongoDB and Atlas URIs and defaults the port', () => {
    expect(loadConfig(valid).PORT).toBe(5000);
    expect(loadConfig(valid).NODE_ENV).toBe('development');
    expect(loadConfig({ ...valid, MONGO_URI: 'mongodb+srv://example.invalid/test', PORT: '8080' }).PORT).toBe(8080);
  });

  it.each([
    { NODE_ENV: 'invalid' }, { MONGO_URI: '' }, { MONGO_URI: 'https://example.test' },
    { JWT_SECRET: '' }, { JWT_SECRET: 'x'.repeat(31) },
    { PORT: '0' }, { PORT: '65536' }, { PORT: '1.5' }, { PORT: 'invalid' },
  ])('rejects invalid configuration: %j', invalid => {
    expect(() => loadConfig({ ...valid, ...invalid })).toThrow('Invalid configuration');
  });

  it('requires configuration without including its values in errors', () => {
    expect(() => loadConfig({})).toThrow('MONGO_URI, JWT_SECRET');
    expect(() => loadConfig({ ...valid, JWT_SECRET: 'private-value' })).toThrow('Invalid configuration: JWT_SECRET');
  });

  it.each([
    { ...valid, JWT_SECRET: '' },
    { ...valid, MONGO_URI: 'mongodb://127.0.0.1:1/test' },
  ])('exits before listening when configuration or database access fails', async env => {
    await expect(promisify(execFile)(process.execPath, ['--import', 'tsx', 'src/server.ts'], {
      env: { ...process.env, ...env }, timeout: 15_000,
    })).rejects.toMatchObject({ code: 1, stdout: '', stderr: expect.stringContaining('Startup failed.') });
  }, 20_000);
});
