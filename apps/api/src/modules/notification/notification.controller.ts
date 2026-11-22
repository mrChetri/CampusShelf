import type { Request, Response } from 'express';
import { z } from 'zod';
import { notificationService } from './notification.service';
import { listingService } from '../listing/listing.service';
import { requestService } from '../request/request.service';
import { campusService } from '../campus/campus.service';
import { userService } from '../user/user.service';
import { MarkReadInputSchema } from '@campusshelf/contracts';

// GET /api/notifications
export function getMyNotifications(req: Request, res: Response): void {
  const user = req.user;
  if (!user?.id) {
    res.status(401).json({ error: 'Unauthorized: missing authentication session' });
    return;
  }

  try {
    const result = notificationService.getMyNotifications(user.id);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch notifications' });
  }
}

// PATCH /api/notifications/read
export function markAsRead(req: Request, res: Response): void {
  const user = req.user;
  if (!user?.id) {
    res.status(401).json({ error: 'Unauthorized: missing authentication session' });
    return;
  }

  const parsed = MarkReadInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    return;
  }

  try {
    const result = notificationService.markAsRead(user.id, parsed.data.notificationIds);
    res.json({ success: true, updatedCount: result.updatedCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update notifications' });
  }
}

// PATCH /api/notifications/read-all
export function markAllAsRead(req: Request, res: Response): void {
  const user = req.user;
  if (!user?.id) {
    res.status(401).json({ error: 'Unauthorized: missing authentication session' });
    return;
  }

  try {
    const result = notificationService.markAllAsRead(user.id);
    res.json({ success: true, updatedCount: result.updatedCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to mark all notifications as read' });
  }
}

// GET /api/notifications/history
export function getDonationHistory(req: Request, res: Response): void {
  const user = req.user;
  if (!user?.id) {
    res.status(401).json({ error: 'Unauthorized: missing authentication session' });
    return;
  }

  try {
    // Books given: listings by this user that are DONATED
    const booksGiven = listingService
      .getMyListings(user.id)
      .filter((l) => l.status === 'DONATED');

    // Books received: requests by this user that are COMPLETED
    const booksReceived = requestService
      .getMyRequests(user.id)
      .filter((r) => r.status === 'COMPLETED');

    res.json({ history: { booksGiven, booksReceived } });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve donation history' });
  }
}

// GET /api/notifications/impact/:campusId
export function getCampusImpact(req: Request, res: Response): void {
  const { campusId } = req.params;

  const uuidValidation = z.string().uuid().safeParse(campusId);
  if (!uuidValidation.success) {
    res.status(400).json({ error: 'Invalid campus ID: must be a valid UUID' });
    return;
  }

  try {
    const campus = campusService.getCampusById(campusId);
    if (!campus) {
      res.status(404).json({ error: 'Campus not found' });
      return;
    }

    // Count listings by status for this campus
    const feed = listingService.getListingsFeed({ campusId, page: 1, limit: 10000 });
    const allListings = feed.listings;

    const totalListed = allListings.length;
    const totalReserved = allListings.filter((l) => l.status === 'RESERVED').length;
    const totalDonated = allListings.filter((l) => l.status === 'DONATED').length;

    // Count campus members
    const allProfiles = userService.getAllProfiles();
    const totalMembers = allProfiles.filter(
      (p) => p.campusId === campusId && p.role === 'CAMPUS_MEMBER'
    ).length;

    res.json({
      impact: {
        campusId,
        campusName: campus.name,
        totalListed,
        totalReserved,
        totalDonated,
        totalMembers,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve campus impact' });
  }
}
