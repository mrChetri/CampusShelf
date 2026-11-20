import { Router } from 'express';
import { listingController } from './listing.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

export const listingRoutes = Router();

// Create donation listing (Campus Members only)
listingRoutes.post('/', authMiddleware, (req, res) =>
  listingController.createListing(req, res)
);

// Get my listings
listingRoutes.get('/mine', authMiddleware, (req, res) =>
  listingController.getMyListings(req, res)
);

// Withdraw own listing
listingRoutes.patch('/:id/withdraw', authMiddleware, (req, res) =>
  listingController.withdrawListing(req, res)
);
