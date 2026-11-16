import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { HttpError } from '../../middleware/errors.js';
import { User, publicUser } from './user.model.js';

type Registration = { name: string; telephone: string; email: string; password: string };

export async function register(input: Registration) {
  const passwordHash = await bcrypt.hash(input.password, 10);
  try {
    const user = await User.create({
      name: input.name, telephone: input.telephone, email: input.email,
      passwordHash, role: 'user',
    });
    return publicUser(user);
  } catch (error) {
    if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
      throw new HttpError(409, 'Email already registered');
    }
    throw error;
  }
}

export async function login(email: string, password: string) {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new HttpError(401, 'Invalid credentials');
  }
  return publicUser(user);
}

export function issueToken(userId: string, secret: string) {
  return jwt.sign({}, secret, { algorithm: 'HS256', subject: userId, expiresIn: '1h' });
}

export async function authenticate(token: string, secret: string) {
  let subject: string;
  try {
    const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
    if (typeof payload === 'string' || !payload.exp || !mongoose.isObjectIdOrHexString(payload.sub)) {
      throw new Error('Invalid token claims');
    }
    subject = payload.sub!;
  } catch {
    throw new HttpError(401, 'Not authorized');
  }
  const user = await User.findById(subject);
  if (!user) throw new HttpError(401, 'Not authorized');
  return publicUser(user);
}
