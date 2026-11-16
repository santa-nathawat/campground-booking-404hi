import express from 'express';
import { errorHandler } from './middleware/errors.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));
  app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });
  app.use(errorHandler);
  return app;
}
