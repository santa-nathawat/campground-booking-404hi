import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../app.js';
import { User } from '../auth/user.model.js';
import { Campground } from './campground.model.js';

const secret = 'isolated-campground-test-secret-at-least-32-bytes';
const app = createApp({ JWT_SECRET: secret });
const destination = { name: 'Test Campground', address: '1 Test Road', telephone: '0812345678' };
let database: MongoMemoryServer;
let token: string;
let userId: string;
const browse = (path = '') => request(app).get(`/api/v1/campgrounds${path}`).auth(token, { type: 'bearer' });

beforeAll(async () => {
  database = await MongoMemoryServer.create();
  await mongoose.connect(database.getUri(), { dbName: 'campgrounds_test' });
  const response = await request(app).post('/api/v1/auth/register').send({
    name: 'Browser', telephone: '0811111111', email: 'browser@example.test', password: 'test-password',
  });
  expect(response.status).toBe(201);
  token = response.body.token;
  userId = response.body.data.id;
}, 120_000);
beforeEach(async () => {
  await Campground.deleteMany({});
  await User.findByIdAndUpdate(userId, { role: 'user' });
});
afterAll(async () => {
  await mongoose.disconnect();
  await database?.stop();
});

describe('campground persistence', () => {
  it.each(['name', 'address', 'telephone'])('requires nonempty %s', async field => {
    for (const value of [undefined, '', '   ']) {
      await expect(Campground.create({ ...destination, [field]: value })).rejects.toThrow();
    }
    expect(await Campground.countDocuments()).toBe(0);
  });

  it('trims contact fields and preserves leading telephone zeroes', async () => {
    const campground = await Campground.create({ name: ' Test Campground ', address: ' 1 Test Road ', telephone: ' 0812345678 ' });
    expect((await browse(`/${campground.id}`)).body.data).toEqual({ id: campground.id, ...destination });
  });
});

describe('authenticated browsing', () => {
  it('returns the agreed empty list envelope', async () => {
    const response = await browse();
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, count: 0, data: [] });
  });

  it('lists all destinations in ID order and exposes only public campground fields', async () => {
    const first = new mongoose.Types.ObjectId('cafe00000000000000000001');
    const second = new mongoose.Types.ObjectId('cafe00000000000000000002');
    // Bypass schema filtering to prove unexpected/private stored fields cannot leak.
    await Campground.collection.insertMany([
      { _id: second, ...destination, name: 'Second', bookings: [{ owner: 'private-user' }], secret: 'private' },
      { _id: first, ...destination },
    ]);
    const response = await browse();
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, count: 2, data: [
      { id: first.toString(), ...destination },
      { id: second.toString(), ...destination, name: 'Second' },
    ] });
    const detail = await browse(`/${second}`);
    expect(detail.status).toBe(200);
    expect(detail.body).toEqual({ success: true, data: response.body.data[1] });
  });

  it('allows administrators to browse through the same endpoints', async () => {
    const campground = await Campground.create(destination);
    await User.findByIdAndUpdate(userId, { role: 'admin' });
    expect((await browse()).status).toBe(200);
    expect((await browse(`/${campground.id}`)).status).toBe(200);
  });

  it.each(['invalid', '123456789012', 'g'.repeat(24), 'a'.repeat(23), 'a'.repeat(25)])('rejects malformed ID %s', async id => {
    const response = await browse(`/${id}`);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ success: false, message: 'Invalid campground identifier' });
  });

  it('returns 404 for an absent well-formed ID', async () => {
    const response = await browse(`/${new mongoose.Types.ObjectId()}`);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ success: false, message: 'Campground not found' });
  });

  it.each(['', '/cafe00000000000000000001', '/invalid'])('requires authentication before resource validation: %s', async path => {
    for (const header of ['', 'Basic abc', 'Bearer invalid', `Bearer ${jwt.sign({}, secret, { subject: userId, expiresIn: -1 })}`]) {
      const response = await request(app).get(`/api/v1/campgrounds${path}`).set('Authorization', header);
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ success: false, message: 'Not authorized' });
    }
  });

  it('rejects a token whose account has been deleted', async () => {
    const user = await User.create({ name: 'Temporary', email: 'temporary@example.test', telephone: '0800000000', passwordHash: 'unused' });
    const deletedToken = jwt.sign({}, secret, { subject: user.id, expiresIn: '1h' });
    await user.deleteOne();
    for (const path of ['', '/cafe00000000000000000001']) {
      expect((await request(app).get(`/api/v1/campgrounds${path}`).auth(deletedToken, { type: 'bearer' })).status).toBe(401);
    }
  });
});
