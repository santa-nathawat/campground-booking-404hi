import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import { createAuthController } from './auth.controller.js';

export function createAuthRouter(secret: string) {
  const router = Router();
  const controller = createAuthController(secret);
  router.post('/register', controller.register);
  router.post('/login', controller.login);
  router.get('/me', protect(secret), controller.me);
  return router;
}
