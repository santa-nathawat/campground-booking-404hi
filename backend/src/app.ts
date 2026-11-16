import express from 'express';
import type { Config } from './config/env.js';
import { createAuthRouter } from './modules/auth/auth.routes.js';
import { createCampgroundsRouter } from './modules/campgrounds/campgrounds.routes.js';
import { errorHandler } from './middleware/errors.js';

export function createApp(config: Pick<Config, 'JWT_SECRET'>) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));
  app.use('/api/v1/auth', createAuthRouter(config.JWT_SECRET));
  app.use('/api/v1/campgrounds', createCampgroundsRouter(config.JWT_SECRET));
  app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });
  app.use(errorHandler);
  return app;
}
