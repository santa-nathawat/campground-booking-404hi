import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import { createAuthController } from './auth.controller.js';
import type { AuthConfig } from './auth.settings.js';

export function createAuthRouter(config: AuthConfig) {
  const router = Router();
  const controller = createAuthController(config);
  router.post('/register', controller.register);
  router.post('/login', controller.login);
  router.get('/me', protect(config.JWT_SECRET), controller.me);
  return router;
}
