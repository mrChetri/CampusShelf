import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireAdminOrModeratorMiddleware } from '../../middleware/role.middleware';
import {
  listPublicPartners,
  getPartnerById,
  listAdminPartners,
  createPartner,
  updatePartner,
  reviewPartner,
} from './partner.controller';

export const publicPartnerRoutes = Router();
export const adminPartnerRoutes = Router();

// Public partner directory routes
publicPartnerRoutes.get('/', listPublicPartners);
publicPartnerRoutes.get('/:id', getPartnerById);

// Admin partner management routes (protected by auth & moderator/admin check)
adminPartnerRoutes.use(authMiddleware, requireAdminOrModeratorMiddleware);
adminPartnerRoutes.get('/', listAdminPartners);
adminPartnerRoutes.post('/', createPartner);
adminPartnerRoutes.patch('/:id', updatePartner);
adminPartnerRoutes.patch('/:id/review', reviewPartner);
