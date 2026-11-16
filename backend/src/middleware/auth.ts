import type { RequestHandler } from 'express';
import { authenticate } from '../modules/auth/auth.service.js';
import { AUTH_COOKIE_NAME } from '../modules/auth/auth.settings.js';
import { HttpError } from './errors.js';

export function protect(secret: string): RequestHandler {
  return async (req, res, next) => {
    let token = req.cookies?.[AUTH_COOKIE_NAME];
    if (req.headers.authorization !== undefined) {
      const match = /^Bearer\s+(\S+)$/i.exec(req.headers.authorization);
      if (!match) throw new HttpError(401, 'Not authorized');
      token = match[1];
    }
    if (typeof token !== 'string' || !token) throw new HttpError(401, 'Not authorized');
    res.locals.user = await authenticate(token, secret);
    next();
  };
}
