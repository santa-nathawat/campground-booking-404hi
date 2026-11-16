import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { User } from '../modules/auth/user.model.js';
import { Campground } from '../modules/campgrounds/campground.model.js';

const execute = promisify(execFile);
const app = createApp({ JWT_SECRET: 'isolated-admin-test-secret-at-least-32-bytes' });
const input = { ADMIN_NAME: ' Administrator ', ADMIN_TELEPHONE: ' 0812345678 ', ADMIN_EMAIL: ' Admin@Example.test ', ADMIN_PASSWORD: ' explicit-password ' };
const failure = 'Administrator setup failed. Check ADMIN_NAME, ADMIN_TELEPHONE, ADMIN_EMAIL, ADMIN_PASSWORD, MONGO_URI, database access, and that the email is unused.\n';
let database: MongoMemoryServer;
let uri: string;
const setup = (overrides: NodeJS.ProcessEnv = {}) => execute('npm', ['run', 'setup:admin'], {
  env: { ...process.env, ...input, MONGO_URI: uri, JWT_SECRET: '', PORT: 'invalid', DOTENV_CONFIG_PATH: '/dev/null', ...overrides },
  timeout: 15_000,
});

beforeAll(async () => {
  database = await MongoMemoryServer.create();
  uri = database.getUri('admin_test');
  await mongoose.connect(uri);
  await User.init();
}, 120_000);
beforeEach(async () => {
  await User.deleteMany({});
  await Campground.deleteMany({});
});
afterAll(async () => {
  await mongoose.disconnect();
  await database?.stop();
});

describe('administrator setup command', () => {
  it('provisions a hashed administrator who logs in, creates, and browses through HTTP', async () => {
    const result = await setup();
    expect(result.stdout).toContain('Administrator created.');
    expect(result.stdout + result.stderr).not.toContain(input.ADMIN_PASSWORD);
    const user = await User.findOne().select('+passwordHash');
    expect(user).toMatchObject({ name: 'Administrator', telephone: '0812345678', email: 'admin@example.test', role: 'admin' });
    expect(bcrypt.getRounds(user!.passwordHash)).toBe(10);
    expect(await bcrypt.compare(input.ADMIN_PASSWORD, user!.passwordHash)).toBe(true);
    const login = await request(app).post('/api/v1/auth/login').send({ email: input.ADMIN_EMAIL, password: input.ADMIN_PASSWORD });
    expect(login.status).toBe(200);
    expect(login.body.data.role).toBe('admin');
    expect(login.body.data).not.toHaveProperty('passwordHash');
    const token = login.body.token;
    const destination = { name: 'New destination', address: '1 Test Road', telephone: '0012345678' };
    const created = await request(app).post('/api/v1/campgrounds').auth(token, { type: 'bearer' }).send(destination);
    expect(created.status).toBe(201);
    expect(created.body).toEqual({ success: true, data: { id: expect.any(String), ...destination } });
    expect(await Campground.findById(created.body.data.id)).toMatchObject(destination);
    expect((await request(app).get('/api/v1/campgrounds').auth(token, { type: 'bearer' })).body.data).toContainEqual(created.body.data);
    expect((await request(app).get(`/api/v1/campgrounds/${created.body.data.id}`).auth(token, { type: 'bearer' })).body.data).toEqual(created.body.data);
    await User.updateOne({ _id: user!._id }, { role: 'user' });
    expect((await request(app).post('/api/v1/campgrounds').auth(token, { type: 'bearer' }).send(destination)).status).toBe(403);
    expect(await Campground.countDocuments()).toBe(1);
  });

  it.each(['user', 'admin'] as const)('rejects duplicate normalized email without modifying an existing %s', async role => {
    await User.create({ name: 'Existing', telephone: '0800000000', email: 'admin@example.test', passwordHash: 'unchanged-hash', role });
    const before = await User.collection.find().toArray();
    await expect(setup()).rejects.toMatchObject({ code: 1, stderr: failure });
    expect(await User.collection.find().toArray()).toEqual(before);
  });

  it.each([
    ...Object.keys(input).flatMap(key => [{ [key]: '' }, { [key]: undefined }]),
    { ADMIN_NAME: '   ' }, { ADMIN_TELEPHONE: '   ' }, { ADMIN_EMAIL: 'invalid-email' },
    { ADMIN_PASSWORD: 'short' }, { ADMIN_PASSWORD: 'ก'.repeat(25) },
  ])('rejects invalid credentials safely: %j', async overrides => {
    await expect(setup(overrides)).rejects.toMatchObject({ code: 1, stderr: failure });
    expect(await User.countDocuments()).toBe(0);
  });

  it.each(['', 'https://private-user:private-password@example.invalid', 'mongodb://127.0.0.1:1/test'])('fails safely for invalid/unavailable MongoDB', async MONGO_URI => {
    await expect(setup({ MONGO_URI })).rejects.toMatchObject({ code: 1, stderr: failure });
    expect(await User.countDocuments()).toBe(0);
  }, 20_000);
});
