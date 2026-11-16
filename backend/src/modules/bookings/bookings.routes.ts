import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import * as controller from './bookings.controller.js';

export function createBookingsRouter(secret: string) {
  const router = Router();
  router.use(protect(secret));
  router.post('/', controller.create);
  router.get('/', controller.list);
  router.get('/:id', controller.detail);
  router.put('/:id', controller.update);
  return router;
}
