import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createApp } from '../../app.js';
import { User } from './user.model.js';

const secret = 'isolated-test-signing-secret-32-bytes-minimum';
const app = createApp({ JWT_SECRET: secret, NODE_ENV: 'test' });
const visitor = { name: 'Example User', telephone: '0812345678', email: 'user@example.test', password: ' safe password ' };
let database: MongoMemoryServer;
const register = (body: object = visitor) => request(app).post('/api/v1/auth/register').send(body);
const login = (body: object) => request(app).post('/api/v1/auth/login').send(body);
const me = (token: string) => request(app).get('/api/v1/auth/me').auth(token, { type: 'bearer' });

beforeAll(async () => {
  database = await MongoMemoryServer.create();
  await mongoose.connect(database.getUri(), { dbName: 'auth_test' });
  await User.init();
}, 120_000);
beforeEach(async () => { await User.deleteMany({}); });
afterAll(async () => {
  await mongoose.disconnect();
  await database?.stop();
});

describe('registration', () => {
  it('persists normalized contact details and an expiring token with only public fields', async () => {
    const response = await register({ ...visitor, name: ' Example User ', telephone: ' 0812345678 ', email: ' USER@EXAMPLE.TEST ' });
    expect(response.status).toBe(201);
    expect(response.body.data).toEqual({ id: expect.any(String), name: visitor.name, telephone: visitor.telephone, email: visitor.email, role: 'user' });
    const payload = jwt.verify(response.body.token, secret, { algorithms: ['HS256'] });
    expect(payload).toMatchObject({ sub: response.body.data.id, iat: expect.any(Number), exp: expect.any(Number) });
    if (typeof payload === 'string') throw new Error('Expected object claims');
    expect(payload.exp! - payload.iat!).toBe(3600);
    expect(response.headers['set-cookie'][0]).toContain(`token=${response.body.token};`);
    expect((await me(response.body.token)).status).toBe(200);
    expect((await User.findById(response.body.data.id))?.passwordHash).toBeUndefined();
  });

  it('stores salted hashes and preserves password whitespace', async () => {
    await register();
    await register({ ...visitor, email: 'other@example.test' });
    const users = await User.find().select('+passwordHash');
    expect(users[0].passwordHash).not.toBe(visitor.password);
    expect(users[0].passwordHash).not.toBe(users[1].passwordHash);
    expect(await bcrypt.compare(visitor.password, users[0].passwordHash)).toBe(true);
    expect(await bcrypt.compare(visitor.password.trim(), users[0].passwordHash)).toBe(false);
    expect(JSON.stringify(users[0])).not.toContain(users[0].passwordHash);
  });

  it.each(['name', 'telephone', 'email', 'password'])('requires %s', async field => {
    const body: Record<string, unknown> = { ...visitor };
    delete body[field];
    expect((await register(body)).status).toBe(400);
    expect(await User.countDocuments()).toBe(0);
  });

  it.each([
    { name: ' ' }, { telephone: ' ' }, { telephone: 812345678 },
    { email: 'bad-email' }, { email: { $ne: null } }, { name: null },
    { password: '1234567' }, { password: 'a'.repeat(73) },
    { password: 'ก'.repeat(25) }, { password: 12345678 },
    { role: 'admin' }, { role: 'user' }, { passwordHash: 'injected' }, { extra: true },
  ])('rejects invalid or unexpected fields: %j', async invalid => {
    expect((await register({ ...visitor, ...invalid })).status).toBe(400);
    expect(await User.countDocuments()).toBe(0);
  });

  it('accepts the 8-character minimum and 72-byte maximum', async () => {
    expect((await register({ ...visitor, password: '12345678' })).status).toBe(201);
    expect((await register({ ...visitor, email: 'max@example.test', password: 'ก'.repeat(24) })).status).toBe(201);
  });

  it('rejects duplicate normalized emails', async () => {
    await register();
    const response = await register({ ...visitor, email: ' USER@EXAMPLE.TEST ' });
    expect(response.status).toBe(409);
    expect(response.body).toEqual({ success: false, message: 'Email already registered' });
    expect(await User.countDocuments()).toBe(1);
  });

  it('enforces uniqueness for simultaneous registrations', async () => {
    const responses = await Promise.all([register(), register()]);
    expect(responses.map(response => response.status).sort()).toEqual([201, 409]);
    expect(await User.countDocuments()).toBe(1);
  });
});

describe('login', () => {
  it('authenticates a persisted user using normalized email without returning the hash', async () => {
    const registered = await register();
    const response = await login({ email: ' USER@EXAMPLE.TEST ', password: visitor.password });
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(registered.body.data);
    expect((await me(response.body.token)).body.data).toEqual(registered.body.data);
    expect(response.body).not.toHaveProperty('password');
    expect(response.body.data).not.toHaveProperty('passwordHash');
  });

  it.each([
    { email: visitor.email, password: 'wrong-password' },
    { email: 'unknown@example.test', password: visitor.password },
    { email: 'admin@gmail.com', password: '12345678' },
    { email: visitor.email, password: visitor.password.trim() },
  ])('rejects incorrect credentials without fallback accounts: %j', async credentials => {
    await register();
    const response = await login(credentials);
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ success: false, message: 'Invalid credentials' });
  });

  it.each([{}, { email: visitor.email }, { email: visitor.email, password: {} },
    { email: visitor.email, password: visitor.password, role: 'admin' }])('rejects malformed login: %j', async body => {
    expect((await login(body)).status).toBe(400);
  });
});

describe('current user', () => {
  it('rejects missing credentials or malformed authorization', async () => {
    for (const authorization of ['', 'Basic abc', 'Bearer', 'Bearer abc def']) {
      const response = await request(app).get('/api/v1/auth/me').set('Authorization', authorization);
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ success: false, message: 'Not authorized' });
    }
  });

  it('rejects invalid, expired, wrong-algorithm and malformed-claim tokens', async () => {
    const response = await register();
    const sub = response.body.data.id;
    const tokens = [
      'not-a-token', `${response.body.token}tampered`,
      jwt.sign({}, 'another-signing-secret', { subject: sub, expiresIn: '1h' }),
      jwt.sign({}, secret, { subject: sub, expiresIn: -1 }),
      jwt.sign({}, secret, { subject: sub, algorithm: 'HS384', expiresIn: '1h' }),
      jwt.sign({}, secret, { subject: 'invalid-id', expiresIn: '1h' }),
      jwt.sign({}, secret, { expiresIn: '1h' }),
      jwt.sign({}, secret, { subject: sub }),
    ];
    for (const token of tokens) expect((await me(token)).status).toBe(401);
  });

  it('uses the current stored profile and role rather than token claims', async () => {
    const response = await register();
    await User.findByIdAndUpdate(response.body.data.id, { name: 'Updated Name', role: 'admin' });
    expect((await me(response.body.token)).body.data).toMatchObject({ name: 'Updated Name', role: 'admin' });
    const forgedRole = jwt.sign({ role: 'admin' }, secret, { subject: response.body.data.id, expiresIn: '1h' });
    await User.findByIdAndUpdate(response.body.data.id, { role: 'user' });
    expect((await me(forgedRole)).body.data.role).toBe('user');
  });

  it('rejects deleted and nonexistent accounts', async () => {
    const response = await register();
    await User.deleteMany({});
    expect((await me(response.body.token)).status).toBe(401);
    const token = jwt.sign({}, secret, { subject: new mongoose.Types.ObjectId().toString(), expiresIn: '1h' });
    expect((await me(token)).status).toBe(401);
  });

  it('returns a generic 500 for database failures', async () => {
    // Closing the connection forces an actual persistence failure without a service stub.
    const response = await register();
    await mongoose.disconnect();
    mongoose.set('bufferCommands', false);
    try {
      const failed = await me(response.body.token);
      expect(failed.status).toBe(500);
      expect(failed.body).toEqual({ success: false, message: 'Internal server error' });
    } finally {
      await mongoose.connect(database.getUri(), { dbName: 'auth_test' });
      mongoose.set('bufferCommands', true);
    }
  }, 15_000);
});

it('returns JSON errors for malformed JSON, non-object bodies, and unknown routes', async () => {
  const malformed = await request(app).post('/api/v1/auth/register').set('Content-Type', 'application/json').send('{');
  expect(malformed.status).toBe(400);
  expect(malformed.body).toEqual({ success: false, message: 'Invalid JSON body' });
  expect((await register([])).status).toBe(400);
  const missing = await request(app).get('/missing');
  expect(missing.status).toBe(404);
  expect(missing.body).toEqual({ success: false, message: 'Route not found' });
});


describe('cookie authentication', () => {
  it('stores the registration cookie in a client jar and authenticates without a Bearer header', async () => {
    const client = request.agent(app);
    const registered = await client.post('/api/v1/auth/register').send(visitor);
    expect(registered.status).toBe(201);
    const response = await client.get('/api/v1/auth/me');
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(registered.body.data);
    expect(response.headers['set-cookie']).toBeUndefined();
  });

  it('issues the login cookie with the JSON token and one-hour lifetime', async () => {
    await register();
    const response = await login({ email: visitor.email, password: visitor.password });
    const cookie = response.headers['set-cookie'][0];
    expect(cookie).toContain(`token=${response.body.token};`);
    expect(cookie).toContain('Max-Age=3600');
    expect(cookie).toContain('Path=/');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).not.toContain('Domain=');
    expect(cookie).not.toContain('Secure');
    const payload = jwt.decode(response.body.token);
    if (!payload || typeof payload === 'string') throw new Error('Expected token claims');
    const expires = /Expires=([^;]+)/.exec(cookie);
    expect(expires).not.toBeNull();
    expect(Math.abs(Date.parse(expires![1]) - payload.exp! * 1000)).toBeLessThanOrEqual(1000);
    expect((await request(app).get('/api/v1/auth/me').set('Cookie', cookie.split(';')[0])).status).toBe(200);
  });

  it.each(['development', 'production'] as const)('sets the expected cookie flags in %s', async environment => {
    const configured = createApp({ JWT_SECRET: secret, NODE_ENV: environment });
    const response = await request(configured).post('/api/v1/auth/register').send(visitor);
    const cookie = response.headers['set-cookie'][0];
    expect(cookie.includes('; Secure')).toBe(environment === 'production');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).not.toContain('Domain=');
  });

  it('does not issue cookies for failed registration or login', async () => {
    const invalid = await register({ ...visitor, role: 'admin' });
    expect(invalid.status).toBe(400);
    expect(invalid.headers['set-cookie']).toBeUndefined();
    await register();
    const duplicate = await register();
    expect(duplicate.status).toBe(409);
    expect(duplicate.headers['set-cookie']).toBeUndefined();
    const failed = await login({ email: visitor.email, password: 'wrong-password' });
    expect(failed.status).toBe(401);
    expect(failed.headers['set-cookie']).toBeUndefined();
  });

  it('rejects expired, tampered, malformed and deleted-account cookies', async () => {
    const response = await register();
    const expired = jwt.sign({}, secret, { subject: response.body.data.id, expiresIn: -1 });
    for (const token of [expired, response.body.token + 'tampered', 'j:{"sub":"injected"}']) {
      expect((await request(app).get('/api/v1/auth/me').set('Cookie', `token=${encodeURIComponent(token)}`)).status).toBe(401);
    }
    await User.deleteMany({});
    expect((await request(app).get('/api/v1/auth/me').set('Cookie', `token=${response.body.token}`)).status).toBe(401);
  });

  it('uses an explicit Bearer header ahead of a cookie and never falls back from invalid headers', async () => {
    const first = await register();
    const second = await register({ ...visitor, email: 'second@example.test' });
    const cookie = `token=${first.body.token}`;
    const response = await me(second.body.token).set('Cookie', cookie);
    expect(response.body.data.id).toBe(second.body.data.id);
    expect((await me(second.body.token).set('Cookie', 'token=invalid')).status).toBe(200);
    for (const authorization of ['', 'Basic abc', 'Bearer invalid', 'Bearer abc def']) {
      expect((await request(app).get('/api/v1/auth/me').set('Cookie', cookie).set('Authorization', authorization)).status).toBe(401);
    }
  });
});
