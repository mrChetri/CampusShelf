import express, { Express } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { healthRoutes } from './modules/health/health.routes';
import { userRoutes } from './modules/user/user.routes';
import { campusRoutes } from './modules/campus/campus.routes';
import { listingRoutes } from './modules/listing/listing.routes';
import { requestRoutes } from './modules/request/request.routes';
import { handoverRoutes } from './modules/handover/handover.routes';
import { notificationRoutes } from './modules/notification/notification.routes';
import { reportRoutes, adminRoutes } from './modules/moderation/moderation.routes';

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

  // Mount book request endpoints (CS-006)
  app.use('/requests', requestRoutes);
  app.use('/api/requests', requestRoutes);

  // Mount handover endpoints (CS-008)
  app.use('/handovers', handoverRoutes);
  app.use('/api/handovers', handoverRoutes);

  // Mount notification endpoints (CS-009)
  app.use('/notifications', notificationRoutes);
  app.use('/api/notifications', notificationRoutes);

  // Mount moderation & report endpoints (CS-010)
  app.use('/reports', reportRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/admin', adminRoutes);
  app.use('/api/admin', adminRoutes);

  return app;
}
