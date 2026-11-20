import { Request, Response } from 'express';
import { listingService } from './listing.service';
import { userService } from '../user/user.service';
import { CreateListingInputSchema, ListingsQuerySchema } from './listing.schema';

export class ListingController {
  public async getListingsFeed(req: Request, res: Response): Promise<void> {
    const parseResult = ListingsQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Invalid query parameters',
        details: parseResult.error.flatten(),
      });
      return;
    }

    try {
      const feed = listingService.getListingsFeed(parseResult.data);
      res.status(200).json(feed);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch listings feed' });
    }
  }

  public async getListingDetail(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const listing = listingService.getListingById(id);

    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    res.status(200).json({ listing });
  }

  public async createListing(req: Request, res: Response): Promise<void> {
    const authUser = req.user;
    if (!authUser || !authUser.id) {
      res.status(401).json({ error: 'Unauthorized: missing authentication session' });
      return;
    }

    const profile = userService.getProfileById(authUser.id) ?? userService.getOrCreateProfile(authUser);

    if (profile.role !== 'CAMPUS_MEMBER') {
      res.status(403).json({
        error: 'Forbidden: only Campus Members can publish book listings. Please redeem a campus invite code first.',
      });
      return;
    }

    const parseResult = CreateListingInputSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten(),
      });
      return;
    }

    try {
      const listing = listingService.createListing(profile, parseResult.data);
      res.status(201).json({ listing });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to create listing' });
    }
  }

  public async getMyListings(req: Request, res: Response): Promise<void> {
    const authUser = req.user;
    if (!authUser || !authUser.id) {
      res.status(401).json({ error: 'Unauthorized: missing authentication session' });
      return;
    }

    const listings = listingService.getMyListings(authUser.id);
    res.status(200).json({ listings });
  }

  public async withdrawListing(req: Request, res: Response): Promise<void> {
    const authUser = req.user;
    if (!authUser || !authUser.id) {
      res.status(401).json({ error: 'Unauthorized: missing authentication session' });
      return;
    }

    const { id } = req.params;

    try {
      const updated = listingService.withdrawListing(authUser.id, id);
      res.status(200).json({
        success: true,
        message: 'Listing withdrawn successfully',
        listing: updated,
      });
    } catch (err: any) {
      const statusCode = err.statusCode || (err.message.includes('not found') ? 404 : 400);
      res.status(statusCode).json({ error: err.message || 'Failed to withdraw listing' });
    }
  }
}

export const listingController = new ListingController();
