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

describe('booking updates', () => {
  const update = (id: string, body: object, credential = token) => request(app).put(`/api/v1/bookings/${id}`).auth(credential, { type: 'bearer' }).send(body);
  const own = async () => (await create({ campgroundId, ...stay })).body.data.id as string;

  it('accepts campground-only, single-date, and combined changes while preserving the owner', async () => {
    const id = await own();
    const second = await Campground.create({ ...destination, name: 'Second' });
    const campgroundOnly = await update(id, { campgroundId: second.id });
    expect(campgroundOnly.status).toBe(200);
    expect(campgroundOnly.body.data).toEqual({ id, ownerId, campground: { id: second.id, ...destination, name: 'Second' }, ...stay });
    expect((await update(id, { checkIn: '2031-01-01' })).status).toBe(200);
    expect((await update(id, { checkOut: '2031-01-04' })).status).toBe(200);
    const combined = await update(id, { campgroundId, checkIn: '2032-02-28', checkOut: '2032-03-02' });
    expect(combined.status).toBe(200);
    expect(combined.body.data).toEqual({ id, ownerId, campground: { id: campgroundId, ...destination }, checkIn: '2032-02-28', checkOut: '2032-03-02' });
    const stored = await Booking.findById(id);
    expect(String(stored!.owner)).toBe(ownerId);
    expect(String(stored!.campground)).toBe(campgroundId);
    expect(stored).toMatchObject({ checkIn: '2032-02-28', checkOut: '2032-03-02' });
  });
  it('rejects invalid merged stays and leaves the full stored record unchanged', async () => {
    const id = await own();
    const before = await Booking.findById(id).lean();
    for (const body of [
      { checkOut: '2031-01-04' }, { checkIn: '2031-01-03' }, { checkIn: '2031-01-04' },
      { checkIn: '2030-12-30' }, { checkOut: '2031-02-29' },
      { checkIn: '2032-02-30', checkOut: '2032-03-02' },
      { campgroundId, checkIn: '2030-01-01', checkOut: '2030-01-02' },
    ]) {
      const response = await update(id, body);
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid booking dates');
      expect(await Booking.findById(id).lean()).toEqual(before);
    }
  });
  it('requires an existing campground and preserves rejected updates', async () => {
    const id = await own();
    const before = await Booking.findById(id).lean();
    for (const campground of ['invalid', '123456789012', 'g'.repeat(24), new mongoose.Types.ObjectId().toString()]) {
      const response = await update(id, { campgroundId: campground, checkIn: '2031-01-01' });
      expect(response.status).toBe(campground.length === 24 && !campground.startsWith('g') ? 404 : 400);
      expect(await Booking.findById(id).lean()).toEqual(before);
    }
  });
  it('rejects empty, unexpected, ownership, authority, and invalid field inputs', async () => {
    const id = await own();
    const before = await Booking.findById(id).lean();
    for (const body of [[], {}, { owner: otherId }, { ownerId: otherId }, { role: 'admin' }, { _id: otherId }, { unexpected: true }]) {
      const response = await update(id, body);
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid booking fields');
    }
    for (const field of ['campgroundId', 'checkIn', 'checkOut']) {
      for (const value of [null, false, 123, [], {}]) expect((await update(id, { [field]: value })).status).toBe(400);
    }
    expect((await request(app).put(`/api/v1/bookings/${id}`).auth(token, { type: 'bearer' })).status).toBe(400);
    expect(await Booking.findById(id).lean()).toEqual(before);
  });
  it('checks ownership before update fields, also for administrators', async () => {
    const id = await own();
    const before = await Booking.findById(id).lean();
    for (const role of ['user', 'admin']) {
      await User.findByIdAndUpdate(otherId, { role });
      for (const body of [{}, { checkOut: '2031-01-02' }]) {
        const response = await update(id, body, otherToken);
        expect(response.status).toBe(403);
        expect(response.body).toEqual({ success: false, message: 'Booking access denied' });
      }
    }
    await User.findByIdAndUpdate(otherId, { role: 'user' });
    expect(await Booking.findById(id).lean()).toEqual(before);
    await User.findByIdAndUpdate(ownerId, { role: 'admin' });
    expect((await update(id, { checkOut: '2031-01-02' })).status).toBe(200);
  });
  it('requires authentication before identifiers or fields and preserves the booking', async () => {
    const id = await own();
    const before = await Booking.findById(id).lean();
    for (const target of [id, 'invalid']) {
      for (const header of ['', 'Bearer invalid', `Bearer ${jwt.sign({}, secret, { subject: ownerId, expiresIn: -1 })}`]) {
        expect((await request(app).put(`/api/v1/bookings/${target}`).set('Authorization', header).send({})).status).toBe(401);
      }
    }
    expect(await Booking.findById(id).lean()).toEqual(before);
  });
  it('returns 400 for malformed and 404 for absent booking identifiers', async () => {
    const malformed = await update('invalid', {});
    expect(malformed.status).toBe(400);
    expect(malformed.body.message).toBe('Invalid booking identifier');
    const missing = await update(new mongoose.Types.ObjectId().toString(), {});
    expect(missing.status).toBe(404);
    expect(missing.body.message).toBe('Booking not found');
  });
  it('rejects campground-only historical edits but permits rescheduling the complete stay', async () => {
    const old = await Booking.create({ owner: ownerId, campground: campgroundId, checkIn: '2020-01-01', checkOut: '2020-01-02' });
    const second = await Campground.create(destination);
    const before = await Booking.findById(old.id).lean();
    expect((await update(old.id, { campgroundId: second.id })).status).toBe(400);
    expect((await update(old.id, { checkOut: '2031-01-01' })).status).toBe(400);
    expect(await Booking.findById(old.id).lean()).toEqual(before);
    const response = await update(old.id, { campgroundId: second.id, ...stay });
    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({ ownerId, ...stay, campground: { id: second.id } });
  });
  it('revalidates an unchanged date when Bangkok today advances', async () => {
    vi.setSystemTime(new Date('2030-12-30T16:59:59.999Z'));
    const created = await create({ campgroundId, checkIn: '2030-12-30', checkOut: '2030-12-31' });
    const id = created.body.data.id;
    vi.setSystemTime(new Date('2030-12-30T17:00:00.000Z'));
    expect((await update(id, { campgroundId })).status).toBe(400);
    expect((await update(id, { checkOut: '2031-01-01' })).status).toBe(400);
    expect((await update(id, stay)).status).toBe(200);
  });
});

describe('booking deletion', () => {
  const remove = (id: string, credential = token) => request(app).delete(`/api/v1/bookings/${id}`).auth(credential, { type: 'bearer' });
  it.each([false, true])('permanently deletes an owned booking (historical: %s)', async historical => {
    const booking = await Booking.create({ owner: ownerId, campground: campgroundId, ...(historical ? { checkIn: '2020-01-01', checkOut: '2020-01-02' } : stay) });
    const other = await create({ campgroundId, ...stay }, otherToken);
    const response = await remove(booking.id);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, data: {} });
    expect(await Booking.findById(booking.id)).toBeNull();
    expect(await Booking.countDocuments()).toBe(1);
    expect(await Booking.findById(other.body.data.id)).not.toBeNull();
    expect((await request(app).get(`/api/v1/bookings/${booking.id}`).auth(token, { type: 'bearer' })).status).toBe(404);
    expect((await request(app).get('/api/v1/bookings').auth(token, { type: 'bearer' })).body).toEqual({ success: true, count: 0, data: [] });
    expect((await remove(booking.id)).status).toBe(404);
  });
  it('denies cross-user deletion, including administrators, and preserves the record', async () => {
    const booking = await Booking.create({ owner: ownerId, campground: campgroundId, ...stay });
    const before = await Booking.findById(booking.id).lean();
    for (const role of ['user', 'admin']) {
      await User.findByIdAndUpdate(otherId, { role });
      const response = await remove(booking.id, otherToken);
      expect(response.status).toBe(403);
      expect(response.body).toEqual({ success: false, message: 'Booking access denied' });
      expect(await Booking.findById(booking.id).lean()).toEqual(before);
    }
    await User.findByIdAndUpdate(otherId, { role: 'user' });
    await User.findByIdAndUpdate(ownerId, { role: 'admin' });
    expect((await remove(booking.id)).status).toBe(200);
  });
  it('requires authentication before ID validation and preserves the booking', async () => {
    const booking = await Booking.create({ owner: ownerId, campground: campgroundId, ...stay });
    const before = await Booking.findById(booking.id).lean();
    for (const id of [booking.id, 'invalid']) {
      for (const header of ['', 'Bearer invalid', `Bearer ${jwt.sign({}, secret, { subject: ownerId, expiresIn: -1 })}`]) {
        const response = await request(app).delete(`/api/v1/bookings/${id}`).set('Authorization', header);
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ success: false, message: 'Not authorized' });
      }
    }
    expect(await Booking.findById(booking.id).lean()).toEqual(before);
  });
  it('uses documented malformed and missing ID errors', async () => {
    for (const id of ['invalid', '123456789012', 'g'.repeat(24)]) {
      const response = await remove(id);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ success: false, message: 'Invalid booking identifier' });
    }
    const response = await remove(new mongoose.Types.ObjectId().toString());
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ success: false, message: 'Booking not found' });
  });
});
