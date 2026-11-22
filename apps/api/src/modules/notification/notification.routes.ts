import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getDonationHistory,
  getCampusImpact,
} from './notification.controller';

export const notificationRoutes = Router();

// Public: campus impact dashboard
notificationRoutes.get('/impact/:campusId', getCampusImpact);

// Authenticated: notification management
notificationRoutes.get('/', authMiddleware, getMyNotifications);
notificationRoutes.patch('/read', authMiddleware, markAsRead);
notificationRoutes.patch('/read-all', authMiddleware, markAllAsRead);
notificationRoutes.get('/history', authMiddleware, getDonationHistory);
