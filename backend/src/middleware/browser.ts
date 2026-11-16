import { Router, type RequestHandler } from 'express';
import cors from 'cors';
import { HttpError } from './errors.js';

export const requireCsrfHeader: RequestHandler = (req, _res, next) => {
  if (req.get('X-CSRF-Protection') !== '1') {
    throw new HttpError(403, 'CSRF protection header required');
  }
  next();
};

export function browserSecurity(frontendOrigin: string) {
  const router = Router();
  router.use((req, _res, next) => {
    if (req.headers.origin !== undefined && req.headers.origin !== frontendOrigin) {
      throw new HttpError(403, 'Origin not allowed');
    }
    next();
  });
  router.use(cors({
    origin: frontendOrigin,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Protection'],
  }));
  router.use((req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return requireCsrfHeader(req, res, next);
    }
    next();
  });
  return router;
}
