import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import {
  createProposalHandler,
  getMyProposalsHandler,
  acceptProposalHandler,
  declineProposalHandler,
  completeExchangeHandler,
  cancelProposalHandler,
} from './exchange.controller';

export const exchangeRoutes = Router();

exchangeRoutes.use(authMiddleware);

exchangeRoutes.post('/', createProposalHandler);
exchangeRoutes.get('/mine', getMyProposalsHandler);
exchangeRoutes.post('/:id/accept', acceptProposalHandler);
exchangeRoutes.post('/:id/decline', declineProposalHandler);
exchangeRoutes.post('/:id/complete', completeExchangeHandler);
exchangeRoutes.post('/:id/cancel', cancelProposalHandler);
