import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';
import { loadConfig } from './env.js';

const valid = { MONGO_URI: 'mongodb://127.0.0.1:27017/test', JWT_SECRET: 'x'.repeat(32) };

describe('startup configuration', () => {
  it('accepts MongoDB and Atlas URIs and defaults the port', () => {
    expect(loadConfig(valid).PORT).toBe(5000);
    expect(loadConfig(valid).NODE_ENV).toBe('development');
    expect(loadConfig(valid).FRONTEND_ORIGIN).toBe('http://localhost:3000');
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
      env: { ...process.env, NODE_ENV: 'test', FRONTEND_ORIGIN: 'http://localhost:3000', ...env }, timeout: 15_000,
    })).rejects.toMatchObject({ code: 1, stdout: '', stderr: expect.stringContaining('Startup failed.') });
  }, 20_000);
});


describe('frontend origin configuration', () => {
  it.each([
    '*', 'https://*.example.test', 'null', 'not-a-url', 'ftp://example.test',
    'https://user:password@example.test', 'https://example.test/path',
    'https://example.test/', 'https://example.test?query=1', 'https://example.test#fragment',
  ])('rejects invalid origins: %s', origin => {
    expect(() => loadConfig({ ...valid, FRONTEND_ORIGIN: origin })).toThrow('FRONTEND_ORIGIN');
  });

  it('allows one exact origin in development and requires explicit HTTPS in production', () => {
    expect(loadConfig({ ...valid, FRONTEND_ORIGIN: 'http://localhost:5173' }).FRONTEND_ORIGIN).toBe('http://localhost:5173');
    expect(() => loadConfig({ ...valid, NODE_ENV: 'production' })).toThrow('FRONTEND_ORIGIN');
    expect(() => loadConfig({ ...valid, NODE_ENV: 'production', FRONTEND_ORIGIN: 'http://app.example.test' })).toThrow('FRONTEND_ORIGIN');
    expect(loadConfig({ ...valid, NODE_ENV: 'production', FRONTEND_ORIGIN: 'https://app.example.test' }).FRONTEND_ORIGIN).toBe('https://app.example.test');
  });
});
