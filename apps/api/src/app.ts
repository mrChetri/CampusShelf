import express, { Express } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { healthRoutes } from './modules/health/health.routes';
import { userRoutes } from './modules/user/user.routes';
import { campusRoutes } from './modules/campus/campus.routes';
import { listingRoutes } from './modules/listing/listing.routes';

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

  // Mount campus directory and invite redemption endpoints
  app.use('/campuses', campusRoutes);
  app.use('/api/campuses', campusRoutes);

  // Mount listing endpoints (CS-004)
  app.use('/listings', listingRoutes);
  app.use('/api/listings', listingRoutes);

  return app;
}
