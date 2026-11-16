import type { RequestHandler } from 'express';
import { authenticate } from '../modules/auth/auth.service.js';
import { HttpError } from './errors.js';

export function protect(secret: string): RequestHandler {
  return async (req, res, next) => {
    const match = /^Bearer\s+(\S+)$/i.exec(req.headers.authorization ?? '');
    if (!match) throw new HttpError(401, 'Not authorized');
    res.locals.user = await authenticate(match[1], secret);
    next();
  };
}

export const requireAdmin: RequestHandler = (_req, res, next) => {
  if (res.locals.user.role !== 'admin') throw new HttpError(403, 'Administrator access required');
  next();
};
