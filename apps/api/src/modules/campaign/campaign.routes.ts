import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireAdminOrModeratorMiddleware } from '../../middleware/role.middleware';
import {
  listCampaignNeeds,
  getCampaignNeed,
  createCampaignNeed,
  updateCampaignNeed,
} from './campaign.controller';

export const campaignRoutes = Router();

// Public routes
campaignRoutes.get('/needs', listCampaignNeeds);
campaignRoutes.get('/needs/:id', getCampaignNeed);

// Staff management routes
campaignRoutes.post('/needs', authMiddleware, requireAdminOrModeratorMiddleware, createCampaignNeed);
campaignRoutes.patch('/needs/:id', authMiddleware, requireAdminOrModeratorMiddleware, updateCampaignNeed);
