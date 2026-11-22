import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import {
  createReport,
  listReports,
  getReport,
  moderateAction,
  listAuditLogs,
} from './moderation.controller';

export const reportRoutes = Router();
export const adminRoutes = Router();

// Member endpoints: submit community reports
reportRoutes.post('/', authMiddleware, createReport);

// Moderator endpoints
adminRoutes.get('/reports', authMiddleware, listReports);
adminRoutes.get('/reports/:id', authMiddleware, getReport);
adminRoutes.post('/moderate', authMiddleware, moderateAction);
adminRoutes.get('/audit-logs', authMiddleware, listAuditLogs);
