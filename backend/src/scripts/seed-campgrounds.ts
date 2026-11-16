import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import { loadDatabaseConfig } from '../config/env.js';
import { Campground } from '../modules/campgrounds/campground.model.js';
import { campgroundFixtures } from '../modules/campgrounds/campground.fixtures.js';

async function seed() {
  const { MONGO_URI } = loadDatabaseConfig();
  await connectDatabase(MONGO_URI);
  let inserted = 0;
  for (const fixture of campgroundFixtures) {
    const result = await Campground.updateOne(
      { _id: fixture._id }, { $setOnInsert: fixture }, { upsert: true, runValidators: true },
    );
    inserted += result.upsertedCount;
  }
  console.log(`Campgrounds: ${inserted} inserted, ${campgroundFixtures.length - inserted} existing.`);
}

seed().catch(() => {
  console.error('Campground seed failed. Check MONGO_URI and database access.');
  process.exitCode = 1;
}).finally(async () => {
  await mongoose.disconnect();
});
