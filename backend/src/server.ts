import 'dotenv/config';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';
import { loadConfig } from './config/env.js';

async function start() {
  const config = loadConfig();
  await connectDatabase(config.MONGO_URI);
  const server = createApp().listen(config.PORT, () => {
    console.log(`API listening on port ${config.PORT}`);
  });
  server.on('error', () => {
    console.error('HTTP server failed to start');
    void mongoose.disconnect().finally(() => { process.exitCode = 1; });
  });
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
      server.close(() => { void mongoose.disconnect(); });
    });
  }
}

start().catch(() => {
  console.error('Startup failed. Check MONGO_URI, JWT_SECRET, PORT, and database access.');
  void mongoose.disconnect().finally(() => { process.exitCode = 1; });
});
