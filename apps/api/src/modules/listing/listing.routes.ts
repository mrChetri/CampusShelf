import { Router } from 'express';
import { listingController } from './listing.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

export const listingRoutes = Router();

// Public: discovery feed with search & filters (CS-005)
listingRoutes.get('/', (req, res) =>
  listingController.getListingsFeed(req, res)
);

// Authenticated: get my listings (must be above /:id)
listingRoutes.get('/mine', authMiddleware, (req, res) =>
  listingController.getMyListings(req, res)
);

// Public: single book listing detail view (CS-005)
listingRoutes.get('/:id', (req, res) =>
  listingController.getListingDetail(req, res)
);

// Create donation listing (Campus Members only)
listingRoutes.post('/', authMiddleware, (req, res) =>
  listingController.createListing(req, res)
);

// Withdraw own listing
listingRoutes.patch('/:id/withdraw', authMiddleware, (req, res) =>
  listingController.withdrawListing(req, res)
);
