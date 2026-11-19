import { Router } from 'express';
import { campusController } from './campus.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

export const campusRoutes = Router();

// Public: directory listing of participating campuses
campusRoutes.get('/', (req, res) => campusController.getCampuses(req, res));

// Authenticated: redeem campus invite code to become a Campus Member
campusRoutes.post('/redeem-invite', authMiddleware, (req, res) =>
  campusController.redeemInvite(req, res)
);

// Admin / coordinator routes
campusRoutes.post('/admin/invites', authMiddleware, (req, res) =>
  campusController.adminCreateInvite(req, res)
);

campusRoutes.post('/admin/invites/revoke', authMiddleware, (req, res) =>
  campusController.adminRevokeInvite(req, res)
);
