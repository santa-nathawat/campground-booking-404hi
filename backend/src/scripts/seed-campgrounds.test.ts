import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { Campground } from '../modules/campgrounds/campground.model.js';
import { campgroundFixtures } from '../modules/campgrounds/campground.fixtures.js';

let database: MongoMemoryServer;
let uri: string;
const execute = promisify(execFile);
const seed = (mongoUri = uri) => execute('npm', ['run', 'seed:campgrounds'], {
  env: { ...process.env, MONGO_URI: mongoUri, JWT_SECRET: '', PORT: 'invalid', DOTENV_CONFIG_PATH: '/dev/null' },
  timeout: 15_000,
});

beforeAll(async () => {
  database = await MongoMemoryServer.create();
  uri = database.getUri('seed_test');
  await mongoose.connect(uri);
}, 120_000);
beforeEach(async () => {
  await Campground.deleteMany({});
  await mongoose.connection.collection('bookings').deleteMany({});
});
afterAll(async () => {
  await mongoose.disconnect();
  await database?.stop();
});

describe('campground seed command', () => {
  it('adds three fixtures once without JWT/HTTP configuration', async () => {
    expect((await seed()).stdout).toContain('3 inserted, 0 existing');
    const before = await Campground.collection.find().sort({ _id: 1 }).toArray();
    expect(before).toHaveLength(3);
    for (const fixture of campgroundFixtures) {
      expect(before.find(record => record._id.toString() === fixture._id)).toMatchObject({
        name: fixture.name, address: fixture.address, telephone: fixture.telephone,
      });
      expect(fixture.telephone).toMatch(/^0/);
    }
    expect((await seed()).stdout).toContain('0 inserted, 3 existing');
    expect(await Campground.collection.find().sort({ _id: 1 }).toArray()).toEqual(before);
  });

  it('adds only missing identities and preserves edited fixtures, unrelated records, and every booking', async () => {
    await seed();
    const [first, second] = campgroundFixtures;
    await Campground.updateOne({ _id: first._id }, { $set: { name: 'Locally edited', telephone: '0099999999' } });
    await Campground.deleteOne({ _id: second._id });
    const unrelated = await Campground.create({ name: second.name, address: 'Unrelated record with same name', telephone: '0012345678' });
    const preserved = await Campground.collection.find().sort({ _id: 1 }).toArray();
    const bookings = mongoose.connection.collection('bookings');
    await bookings.insertMany([
      { campground: new mongoose.Types.ObjectId(first._id), owner: new mongoose.Types.ObjectId(), checkIn: '2026-12-01', checkOut: '2026-12-02' },
      { campground: new mongoose.Types.ObjectId(second._id), custom: { preserve: true } },
      { campground: unrelated._id, legacy: ['untouched'] },
      { unrelatedDocument: true },
    ]);
    const beforeBookings = await bookings.find().sort({ _id: 1 }).toArray();
    expect((await seed()).stdout).toContain('1 inserted, 2 existing');
    expect(await Campground.countDocuments()).toBe(4);
    for (const record of preserved) expect(await Campground.collection.findOne({ _id: record._id })).toEqual(record);
    expect(await Campground.findById(second._id)).toMatchObject({ name: second.name, telephone: second.telephone });
    expect(await bookings.find().sort({ _id: 1 }).toArray()).toEqual(beforeBookings);
    await seed();
    expect(await bookings.find().sort({ _id: 1 }).toArray()).toEqual(beforeBookings);
  });

  it.each(['', 'https://private-user:private-password@example.invalid', 'mongodb://127.0.0.1:1/test'])('fails safely for invalid/unavailable database configuration', async mongoUri => {
    await expect(seed(mongoUri)).rejects.toMatchObject({
      code: 1, stderr: 'Campground seed failed. Check MONGO_URI and database access.\n',
    });
  }, 20_000);
});
