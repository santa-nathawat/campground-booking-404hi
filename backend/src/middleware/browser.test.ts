import { describe, expect, it } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createApp } from '../app.js';
import { errorHandler } from './errors.js';
import { requireCsrfHeader } from './browser.js';

const origin = 'http://localhost:3000';
const app = createApp({
  JWT_SECRET: 'isolated-browser-tests-secret-32-bytes',
  NODE_ENV: 'test',
  FRONTEND_ORIGIN: origin,
});

describe('browser security', () => {
  it('allows credentialed preflights only for the configured origin', async () => {
    const response = await request(app).options('/api/v1/auth/login')
      .set('Origin', origin).set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'Content-Type,Authorization,X-CSRF-Protection');
    expect(response.status).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe(origin);
    expect(response.headers['access-control-allow-credentials']).toBe('true');
    expect(response.headers['access-control-allow-headers']).toBe('Content-Type,Authorization,X-CSRF-Protection');
    expect(response.headers['access-control-allow-methods']).toContain('POST');
    expect(response.headers.vary).toContain('Origin');
  });

  it.each(['null', 'http://evil.example', 'http://localhost:3001', 'http://localhost:3000.evil.test'])('rejects untrusted origin %s', async untrusted => {
    for (const method of ['get', 'post', 'options'] as const) {
      const response = await request(app)[method]('/api/v1/auth/register')
        .set('Origin', untrusted).set('X-CSRF-Protection', '1');
      expect(response.status).toBe(403);
      expect(response.body).toEqual({ success: false, message: 'Origin not allowed' });
      expect(response.headers['access-control-allow-origin']).toBeUndefined();
    }
  });

  it.each(['post', 'put', 'patch', 'delete'] as const)('requires the CSRF header on %s with cookies, Bearer tokens, or no credentials', async method => {
    for (const authorization of ['', 'Bearer invalid']) {
      for (const header of ['', '0']) {
        const response = await request(app)[method]('/api/v1/auth/login')
          .set('Authorization', authorization).set('Cookie', 'token=invalid')
          .set('X-CSRF-Protection', header);
        expect(response.status).toBe(403);
        expect(response.body).toEqual({ success: false, message: 'CSRF protection header required' });
      }
    }
    const anonymous = await request(app)[method]('/api/v1/auth/register');
    expect(anonymous.status).toBe(403);
  });

  it('permits non-browser writes without Origin when the CSRF header is present', async () => {
    const response = await request(app).post('/api/v1/auth/login').set('X-CSRF-Protection', '1').send({});
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid login fields');
  });

  it('does not require a CSRF header for reads and allows unauthenticated preflight', async () => {
    expect((await request(app).get('/api/v1/auth/me').set('Origin', origin)).status).toBe(401);
    expect((await request(app).head('/api/v1/auth/me')).status).toBe(401);
    const response = await request(app).post('/api/v1/auth/login').set('Origin', origin).send({});
    expect(response.status).toBe(403);
    expect(response.headers['access-control-allow-origin']).toBe(origin);
  });

  it('provides a reusable CSRF check for ticket 09’s planned GET logout', async () => {
    const fixture = express();
    fixture.get('/logout', requireCsrfHeader, (_req, res) => { res.sendStatus(200); });
    fixture.use(errorHandler);
    expect((await request(fixture).get('/logout')).status).toBe(403);
    expect((await request(fixture).get('/logout').set('X-CSRF-Protection', '1')).status).toBe(200);
  });
});
