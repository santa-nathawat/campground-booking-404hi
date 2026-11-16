import express from 'express';
import cookieParser from 'cookie-parser';
import type { Config } from './config/env.js';
import { createAuthRouter } from './modules/auth/auth.routes.js';
import { browserSecurity } from './middleware/browser.js';
import { errorHandler } from './middleware/errors.js';

export function createApp(config: Pick<Config, 'JWT_SECRET' | 'NODE_ENV' | 'FRONTEND_ORIGIN'>) {
  const app = express();
  app.disable('x-powered-by');
  app.use(browserSecurity(config.FRONTEND_ORIGIN));
  app.use(express.json({ limit: '16kb' }));
  app.use(cookieParser());
  app.use('/api/v1/auth', createAuthRouter(config));
  app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });
  app.use(errorHandler);
  return app;
}
