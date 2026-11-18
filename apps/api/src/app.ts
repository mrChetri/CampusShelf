import express, { Express } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { healthRoutes } from './modules/health/health.routes';

export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());

  // Mount health check at both /health and /api/health
  app.use('/health', healthRoutes);
  app.use('/api/health', healthRoutes);

  return app;
}
