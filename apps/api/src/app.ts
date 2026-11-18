import express, { Express } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { healthRoutes } from './modules/health/health.routes';
import { userRoutes } from './modules/user/user.routes';

export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());

  // Mount health check endpoints
  app.use('/health', healthRoutes);
  app.use('/api/health', healthRoutes);

  // Mount authenticated user profile endpoints
  app.use('/me', userRoutes);
  app.use('/api/me', userRoutes);

  return app;
}
