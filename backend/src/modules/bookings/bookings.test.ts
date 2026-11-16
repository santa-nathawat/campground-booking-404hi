import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../app.js';
import { User } from '../auth/user.model.js';
import { Campground } from '../campgrounds/campground.model.js';
import { Booking } from './booking.model.js';
import { validateStay } from './bookings.validation.js';

const secret = 'isolated-booking-test-secret-at-least-32-bytes';
const app = createApp({ JWT_SECRET: secret });
const destination = { name: 'Booking Campground', address: '1 Test Road', telephone: '0812345678' };
let database: MongoMemoryServer;
let ownerId: string;
let otherId: string;
let token: string;
let otherToken: string;
let campgroundId: string;
const stay = { checkIn: '2030-12-31', checkOut: '2031-01-03' };
const create = (body: object, credential = token) => request(app).post('/api/v1/bookings').auth(credential, { type: 'bearer' }).send(body);

beforeAll(async () => {
  database = await MongoMemoryServer.create();
  await mongoose.connect(database.getUri(), { dbName: 'bookings_test' });
  for (const name of ['Owner', 'Other']) {
    const response = await request(app).post('/api/v1/auth/register').send({
      name, telephone: '0811111111', email: `${name.toLowerCase()}@example.test`, password: 'test-password',
    });
    expect(response.status).toBe(201);
    if (name === 'Owner') ownerId = response.body.data.id;
    else otherId = response.body.data.id;
  }
}, 120_000);
beforeEach(async () => {
  await Booking.deleteMany({});
  await Campground.deleteMany({});
  await User.findByIdAndUpdate(ownerId, { role: 'user' });
  campgroundId = (await Campground.create(destination)).id;
  // Fake Date only so MongoDB's network timers remain real.
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2030-12-30T17:00:00.000Z'));
  token = jwt.sign({}, secret, { subject: ownerId, expiresIn: '1h' });
  otherToken = jwt.sign({}, secret, { subject: otherId, expiresIn: '1h' });
});
afterEach(() => vi.useRealTimers());
afterAll(async () => { await mongoose.disconnect(); await database?.stop(); });

describe('booking creation', () => {
  it.each([1, 2, 3])('persists an owned %i-night stay starting today in Bangkok', async nights => {
    const checkOut = `2031-01-0${nights}`;
    const response = await create({ campgroundId, checkIn: stay.checkIn, checkOut });
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ success: true, data: {
      id: expect.any(String), ownerId, campground: { id: campgroundId, ...destination }, checkIn: stay.checkIn, checkOut,
    } });
    const stored = await Booking.findById(response.body.data.id);
    expect(String(stored!.owner)).toBe(ownerId);
    expect(String(stored!.campground)).toBe(campgroundId);
    expect(stored).toMatchObject({ checkIn: stay.checkIn, checkOut });
  });
  it('allows overlaps, different owners, and more than three bookings per owner', async () => {
    for (let i = 0; i < 4; i++) expect((await create({ campgroundId, ...stay })).status).toBe(201);
    expect((await create({ campgroundId, ...stay }, otherToken)).status).toBe(201);
    expect(await Booking.countDocuments({ owner: ownerId })).toBe(4);
    expect(await Booking.countDocuments()).toBe(5);
  });
  it('allows administrators to book for themselves under the same rules', async () => {
    await User.findByIdAndUpdate(ownerId, { role: 'admin' });
    expect((await create({ campgroundId, ...stay })).body.data.ownerId).toBe(ownerId);
    expect((await create({ campgroundId, ...stay, checkOut: '2031-01-04' })).status).toBe(400);
  });
  it.each([
    ['2030-12-30', '2030-12-31'], ['2030-12-31', '2030-12-31'],
    ['2031-01-01', '2030-12-31'], ['2030-12-31', '2031-01-04'],
    ['2031-02-29', '2031-03-01'], ['2032-02-30', '2032-03-02'],
    ['2031-04-31', '2031-05-02'], ['2031-13-01', '2031-13-02'],
    ['2031-01-00', '2031-01-01'], ['2031-1-01', '2031-01-02'],
    ['2031-01-01T00:00:00Z', '2031-01-02'], ['2031-01-01', '2031-02-30'],
    ['0000-01-01', '0000-01-02'], [' 2031-01-01', '2031-01-02'],
  ])('rejects invalid stay %s to %s without persistence', async (checkIn, checkOut) => {
    const response = await create({ campgroundId, checkIn, checkOut });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ success: false, message: 'Invalid booking dates' });
    expect(await Booking.countDocuments()).toBe(0);
  });
  it.each(['campgroundId', 'checkIn', 'checkOut'])('rejects missing and non-string %s', async field => {
    for (const value of [undefined, null, 1, true, [], {}]) {
      expect((await create({ campgroundId, ...stay, [field]: value })).status).toBe(400);
    }
    expect(await Booking.countDocuments()).toBe(0);
  });
  it('rejects ownership, authority, unexpected fields, and non-object bodies', async () => {
    for (const field of ['owner', 'ownerId', 'user', 'role', '_id', 'unexpected']) {
      expect((await create({ campgroundId, ...stay, [field]: otherId })).status).toBe(400);
    }
    for (const body of [[], {}, { campgroundId, ...stay, checkIn: '' }]) expect((await create(body)).status).toBe(400);
    expect((await request(app).post('/api/v1/bookings').auth(token, { type: 'bearer' })).status).toBe(400);
    expect(await Booking.countDocuments()).toBe(0);
  });
  it('requires an existing campground with a valid identifier', async () => {
    for (const id of ['bad', '123456789012', 'g'.repeat(24)]) {
      const response = await create({ campgroundId: id, ...stay });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid campground identifier');
    }
    const response = await create({ campgroundId: new mongoose.Types.ObjectId().toString(), ...stay });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Campground not found');
    expect(await Booking.countDocuments()).toBe(0);
  });
  it('requires authentication before field validation without writes', async () => {
    const deleted = await User.create({ name: 'Deleted', telephone: '0800000000', email: 'deleted@example.test', passwordHash: 'unused' });
    const deletedToken = jwt.sign({}, secret, { subject: deleted.id, expiresIn: '1h' });
    await deleted.deleteOne();
    for (const header of ['', 'Basic abc', 'Bearer invalid', `Bearer ${jwt.sign({}, secret, { subject: ownerId, expiresIn: -1 })}`, `Bearer ${deletedToken}`]) {
      const response = await request(app).post('/api/v1/bookings').set('Authorization', header).send({});
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ success: false, message: 'Not authorized' });
    }
    expect(await Booking.countDocuments()).toBe(0);
  });
  it('changes the accepted check-in exactly at Thailand midnight', async () => {
    vi.setSystemTime(new Date('2030-12-30T16:59:59.999Z'));
    expect((await create({ campgroundId, checkIn: '2030-12-30', checkOut: '2030-12-31' })).status).toBe(201);
    vi.setSystemTime(new Date('2030-12-30T17:00:00.000Z'));
    expect((await create({ campgroundId, checkIn: '2030-12-30', checkOut: '2030-12-31' })).status).toBe(400);
    expect((await create({ campgroundId, ...stay })).status).toBe(201);
  });
  it.each([['2031-01-31', '2031-02-01'], ['2032-02-28', '2032-03-01'], ['2032-02-29', '2032-03-03']])('accepts real boundary dates %s to %s', async (checkIn, checkOut) => {
    expect((await create({ campgroundId, checkIn, checkOut })).status).toBe(201);
  });
});

describe('calendar boundary rules', () => {
  it('handles leap-century rules and low four-digit years without Date.UTC year coercion', () => {
    const now = new Date('0001-01-01T00:00:00.000Z');
    expect(() => validateStay('0099-12-31', '0100-01-01', now)).not.toThrow();
    expect(() => validateStay('2000-02-29', '2000-03-01', now)).not.toThrow();
    expect(() => validateStay('2100-02-29', '2100-03-01', now)).toThrow('Invalid booking dates');
  });
});

describe('booking reads', () => {
  const read = (path = '', credential = token) => request(app).get(`/api/v1/bookings${path}`).auth(credential, { type: 'bearer' });

  it('returns an empty list', async () => {
    expect((await read()).body).toEqual({ success: true, count: 0, data: [] });
  });
  it('isolates both users and returns only public booking and destination fields in ID order', async () => {
    const first = new mongoose.Types.ObjectId('cafe00000000000000000001');
    const second = new mongoose.Types.ObjectId('cafe00000000000000000002');
    const other = await create({ campgroundId, ...stay }, otherToken);
    await Booking.collection.insertMany([
      { _id: second, owner: new mongoose.Types.ObjectId(ownerId), campground: new mongoose.Types.ObjectId(campgroundId), ...stay, secret: 'private', passwordHash: 'private' },
      { _id: first, owner: new mongoose.Types.ObjectId(ownerId), campground: new mongoose.Types.ObjectId(campgroundId), ...stay },
    ]);
    await Campground.collection.updateOne({ _id: new mongoose.Types.ObjectId(campgroundId) }, { $set: { bookings: ['private'], secret: 'private' } });
    const data = [first, second].map(id => ({ id: String(id), ownerId, campground: { id: campgroundId, ...destination }, ...stay }));
    expect((await read()).body).toEqual({ success: true, count: 2, data });
    expect((await read(`/${first}`)).body).toEqual({ success: true, data: data[0] });
    expect((await read('', otherToken)).body).toEqual({ success: true, count: 1, data: [other.body.data] });
    expect((await read(`/${first}`, otherToken)).status).toBe(403);
    expect((await read(`/${other.body.data.id}`)).status).toBe(403);
  });
  it('keeps historical bookings visible', async () => {
    const old = await Booking.create({ owner: ownerId, campground: campgroundId, checkIn: '2020-01-01', checkOut: '2020-01-02' });
    expect((await read()).body.data[0].checkIn).toBe('2020-01-01');
    expect((await read(`/${old.id}`)).status).toBe(200);
  });
  it('restricts administrators to their own records until ticket 08', async () => {
    const own = await create({ campgroundId, ...stay });
    const other = await create({ campgroundId, ...stay }, otherToken);
    await User.findByIdAndUpdate(ownerId, { role: 'admin' });
    expect((await read()).body.data).toEqual([own.body.data]);
    expect((await read(`/${other.body.data.id}`)).status).toBe(403);
  });
  it('uses documented ID and missing-resource errors', async () => {
    for (const id of ['bad', '123456789012', 'g'.repeat(24), 'a'.repeat(23), 'a'.repeat(25)]) {
      const response = await read(`/${id}`);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ success: false, message: 'Invalid booking identifier' });
    }
    const response = await read(`/${new mongoose.Types.ObjectId()}`);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ success: false, message: 'Booking not found' });
  });
  it.each(['', '/invalid', '/cafe00000000000000000001'])('requires authentication before reading %s', async path => {
    for (const header of ['', 'Bearer invalid', `Bearer ${jwt.sign({}, secret, { subject: ownerId, expiresIn: -1 })}`]) {
      const response = await request(app).get(`/api/v1/bookings${path}`).set('Authorization', header);
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ success: false, message: 'Not authorized' });
    }
  });
});
