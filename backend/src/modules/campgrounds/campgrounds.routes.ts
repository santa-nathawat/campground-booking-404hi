import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import * as controller from './campgrounds.controller.js';

export function createCampgroundsRouter(secret: string) {
  const router = Router();
  router.use(protect(secret));
  router.get('/', controller.list);
  router.get('/:id', controller.detail);
  return router;
}
