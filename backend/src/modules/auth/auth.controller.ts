import type { RequestHandler } from 'express';
import { z } from 'zod';
import { HttpError } from '../../middleware/errors.js';
import * as auth from './auth.service.js';

const contact = z.string().trim().min(1);
const email = z.string().trim().toLowerCase().email();
const password = z.string().min(8).refine(value => Buffer.byteLength(value) <= 72);
const registration = z.strictObject({ name: contact, telephone: contact, email, password });
const credentials = z.strictObject({
  email,
  password: z.string().min(1).refine(value => Buffer.byteLength(value) <= 72),
});

export function createAuthController(secret: string): Record<'register' | 'login' | 'me', RequestHandler> {
  return {
    register: async (req, res) => {
      const input = registration.safeParse(req.body);
      if (!input.success) throw new HttpError(400, 'Invalid registration fields');
      const user = await auth.register(input.data);
      res.status(201).json({ success: true, data: user, token: auth.issueToken(user.id, secret) });
    },
    login: async (req, res) => {
      const input = credentials.safeParse(req.body);
      if (!input.success) throw new HttpError(400, 'Invalid login fields');
      const user = await auth.login(input.data.email, input.data.password);
      res.json({ success: true, data: user, token: auth.issueToken(user.id, secret) });
    },
    me: (_req, res) => {
      res.json({ success: true, data: res.locals.user });
    },
  };
}
