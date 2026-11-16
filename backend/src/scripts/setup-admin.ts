import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import { loadDatabaseConfig } from '../config/env.js';
import { registration } from '../modules/auth/auth.validation.js';
import { User } from '../modules/auth/user.model.js';

async function setupAdmin() {
  const input = registration.safeParse({
    name: process.env.ADMIN_NAME,
    telephone: process.env.ADMIN_TELEPHONE,
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  });
  if (!input.success) throw new Error('Invalid administrator input');
  const { MONGO_URI } = loadDatabaseConfig();
  await connectDatabase(MONGO_URI);
  await User.init();
  const { password, ...contact } = input.data;
  await User.create({ ...contact, passwordHash: await bcrypt.hash(password, 10), role: 'admin' });
  console.log('Administrator created.');
}

setupAdmin().catch(() => {
  console.error('Administrator setup failed. Check ADMIN_NAME, ADMIN_TELEPHONE, ADMIN_EMAIL, ADMIN_PASSWORD, MONGO_URI, database access, and that the email is unused.');
  process.exitCode = 1;
}).finally(async () => {
  await mongoose.disconnect();
});
