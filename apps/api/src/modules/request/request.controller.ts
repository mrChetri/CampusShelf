import { Request, Response } from 'express';
import { requestService } from './request.service';
import { userService } from '../user/user.service';
import { CreateBookRequestInputSchema, DeclineBookRequestInputSchema } from './request.schema';

export class RequestController {
  public async createListingRequest(req: Request, res: Response): Promise<void> {
    const authUser = req.user;
    if (!authUser || !authUser.id) {
      res.status(401).json({ error: 'Unauthorized: missing authentication session' });
      return;
    }

    const { id: listingId } = req.params;
    const profile = userService.getProfileById(authUser.id) ?? userService.getOrCreateProfile(authUser);

    const parseResult = CreateBookRequestInputSchema.safeParse(req.body || {});
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten(),
      });
      return;
    }

    try {
      const bookRequest = requestService.createRequest(listingId, profile, parseResult.data);
      res.status(201).json({ request: bookRequest });
    } catch (err: any) {
      const statusCode = err.statusCode || 500;
      res.status(statusCode).json({ error: err.message || 'Failed to submit book request' });
    }
  }

  public async getMyRequests(req: Request, res: Response): Promise<void> {
    const authUser = req.user;
    if (!authUser || !authUser.id) {
      res.status(401).json({ error: 'Unauthorized: missing authentication session' });
      return;
    }

    try {
      const requests = requestService.getMyRequests(authUser.id);
      res.status(200).json({ requests });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch your requests' });
    }
  }

  public async cancelRequest(req: Request, res: Response): Promise<void> {
    const authUser = req.user;
    if (!authUser || !authUser.id) {
      res.status(401).json({ error: 'Unauthorized: missing authentication session' });
      return;
    }

    const { id: requestId } = req.params;

    try {
      const cancelledRequest = requestService.cancelRequest(requestId, authUser.id);
      res.status(200).json({
        success: true,
        message: 'Request cancelled successfully',
        request: cancelledRequest,
      });
    } catch (err: any) {
      const statusCode = err.statusCode || 500;
      res.status(statusCode).json({ error: err.message || 'Failed to cancel request' });
    }
  }

  public async getListingRequests(req: Request, res: Response): Promise<void> {
    const authUser = req.user;
    if (!authUser || !authUser.id) {
      res.status(401).json({ error: 'Unauthorized: missing authentication session' });
      return;
    }

    const { id: listingId } = req.params;

    try {
      const requests = requestService.getListingRequests(listingId, authUser.id);
      res.status(200).json({ requests });
    } catch (err: any) {
      const statusCode = err.statusCode || 500;
      res.status(statusCode).json({ error: err.message || 'Failed to fetch listing requests' });
    }
  }

  public async acceptRequest(req: Request, res: Response): Promise<void> {
    const authUser = req.user;
    if (!authUser || !authUser.id) {
      res.status(401).json({ error: 'Unauthorized: missing authentication session' });
      return;
    }

    const { id: requestId } = req.params;

    try {
      const result = requestService.acceptRequest(requestId, authUser.id);
      res.status(200).json({
        success: true,
        message: 'Request accepted. Listing is now reserved for 72 hours for handover.',
        request: result.request,
        listing: result.listing,
      });
    } catch (err: any) {
      const statusCode = err.statusCode || 500;
      res.status(statusCode).json({ error: err.message || 'Failed to accept request' });
    }
  }

  public async declineRequest(req: Request, res: Response): Promise<void> {
    const authUser = req.user;
    if (!authUser || !authUser.id) {
      res.status(401).json({ error: 'Unauthorized: missing authentication session' });
      return;
    }

    const { id: requestId } = req.params;

    const parseResult = DeclineBookRequestInputSchema.safeParse(req.body || {});
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten(),
      });
      return;
    }

    try {
      const declined = requestService.declineRequest(
        requestId,
        authUser.id,
        parseResult.data.reason
      );
      res.status(200).json({
        success: true,
        message: 'Request declined',
        request: declined,
      });
    } catch (err: any) {
      const statusCode = err.statusCode || 500;
      res.status(statusCode).json({ error: err.message || 'Failed to decline request' });
    }
  }
}

export const requestController = new RequestController();
